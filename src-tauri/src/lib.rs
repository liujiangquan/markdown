use std::fs;
use std::sync::{Arc, Mutex};
use tauri::{Emitter, State};

// 用于存储文件对话框结果的共享状态
struct DialogState {
    open_result: Arc<Mutex<Option<Result<String, String>>>>,
    save_result: Arc<Mutex<Option<Result<String, String>>>>,
}

// 打开文件
#[tauri::command]
async fn open_file(app: tauri::AppHandle, state: State<'_, DialogState>) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let result_clone = state.open_result.clone();
    let app_clone = app.clone();

    // 清除之前的结果
    *result_clone.lock().unwrap() = None;

    let result_clone_for_callback = result_clone.clone();
    app_clone.dialog().file().pick_file(move |file_path| {
        let result = if let Some(path) = file_path {
            if let Some(path_ref) = path.as_path() {
                match fs::read_to_string(path_ref) {
                    Ok(content) => Ok(content),
                    Err(e) => Err(format!("读取文件失败: {}", e)),
                }
            } else {
                Err("无效的文件路径".to_string())
            }
        } else {
            Err("未选择文件".to_string())
        };

        *result_clone_for_callback.lock().unwrap() = Some(result);
    });

    // 等待用户选择文件
    let mut attempts = 0;
    while attempts < 100 {
        // 最多等待10秒
        if let Some(result) = result_clone.lock().unwrap().take() {
            return result;
        }
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        attempts += 1;
    }

    Err("操作超时".to_string())
}

// 保存文件
#[tauri::command]
async fn save_file(
    app: tauri::AppHandle,
    content: String,
    path: Option<String>,
    state: State<'_, DialogState>,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    // 如果提供了路径，直接保存到该路径
    if let Some(file_path) = path {
        println!("直接保存到指定路径: {}", file_path);
        match fs::write(&file_path, &content) {
            Ok(_) => {
                println!("文件保存成功: {}", file_path);
                Ok(file_path)
            }
            Err(e) => {
                let error_msg = format!("保存文件失败: {}", e);
                println!("{}", error_msg);
                Err(error_msg)
            }
        }
    } else {
        // 如果没有提供路径，弹出文件选择对话框
        println!("没有提供路径，弹出文件选择对话框");
        let result_clone = state.save_result.clone();
        let app_clone = app.clone();
        let content_clone = content.clone();

        // 清除之前的结果
        *result_clone.lock().unwrap() = None;

        let result_clone_for_callback = result_clone.clone();
        app_clone.dialog().file().save_file(move |file_path| {
            let result = if let Some(path) = file_path {
                if let Some(path_ref) = path.as_path() {
                    match fs::write(path_ref, &content_clone) {
                        Ok(_) => Ok(path_ref.to_string_lossy().to_string()),
                        Err(e) => Err(format!("保存文件失败: {}", e)),
                    }
                } else {
                    Err("无效的文件路径".to_string())
                }
            } else {
                Err("未选择保存路径".to_string())
            };

            *result_clone_for_callback.lock().unwrap() = Some(result);
        });

        // 等待用户选择保存路径
        let mut attempts = 0;
        while attempts < 100 {
            // 最多等待10秒
            if let Some(result) = result_clone.lock().unwrap().take() {
                return result;
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            attempts += 1;
        }

        Err("操作超时".to_string())
    }
}

// 新建文件
#[tauri::command]
fn new_file() -> Result<String, String> {
    Ok("# 新文档\n\n开始编写你的 Markdown 内容...".to_string())
}

// 打开指定文件
#[tauri::command]
fn open_file_by_path(file_path: String) -> Result<String, String> {
    println!("尝试打开文件: {}", file_path);

    // 检查文件是否存在
    if !std::path::Path::new(&file_path).exists() {
        let error_msg = format!("文件不存在: {}", file_path);
        println!("{}", error_msg);
        return Err(error_msg);
    }

    match fs::read_to_string(&file_path) {
        Ok(content) => {
            println!("成功读取文件，内容长度: {}", content.len());
            Ok(content)
        }
        Err(e) => {
            let error_msg = format!("读取文件失败: {}", e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let dialog_state = DialogState {
        open_result: Arc::new(Mutex::new(None)),
        save_result: Arc::new(Mutex::new(None)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(dialog_state)
        .invoke_handler(tauri::generate_handler![
            open_file,
            save_file,
            new_file,
            open_file_by_path
        ])
        .setup(|app| {
            // 处理文件关联
            let args: Vec<String> = std::env::args().collect();
            if args.len() > 1 {
                let file_path = args[1].clone();
                if file_path.ends_with(".md") || file_path.ends_with(".markdown") {
                    println!("收到文件关联请求: {}", file_path);

                    // 延迟发送事件，确保前端已准备好
                    let app_handle = app.handle().clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(2000));
                        println!("发送文件路径到前端: {}", file_path);
                        match app_handle.emit("open-file", file_path) {
                            Ok(_) => println!("事件发送成功"),
                            Err(e) => println!("事件发送失败: {}", e),
                        }
                    });
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
