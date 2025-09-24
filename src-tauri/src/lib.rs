use std::fs;
use std::sync::{Arc, Mutex};
use tauri::State;

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
    while attempts < 100 { // 最多等待10秒
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
async fn save_file(app: tauri::AppHandle, content: String, state: State<'_, DialogState>) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    
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
    while attempts < 100 { // 最多等待10秒
        if let Some(result) = result_clone.lock().unwrap().take() {
            return result;
        }
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        attempts += 1;
    }
    
    Err("操作超时".to_string())
}

// 新建文件
#[tauri::command]
fn new_file() -> Result<String, String> {
    Ok("# 新文档\n\n开始编写你的 Markdown 内容...".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let dialog_state = DialogState {
        open_result: Arc::new(Mutex::new(None)),
        save_result: Arc::new(Mutex::new(None)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(dialog_state)
        .invoke_handler(tauri::generate_handler![open_file, save_file, new_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
