# Markdown Editor · 基于 Tauri 的跨平台 Markdown 编辑器

轻量、易用的 Markdown 写作工具。前端使用原生 HTML/CSS/JavaScript，后端基于 Rust + Tauri 2 提供原生文件访问能力，适用于 Windows、macOS 与 Linux。

## ✨ 功能亮点

- **实时所见即所得**：编辑区与预览区并排展示，支持同步滚动与全屏预览。
- **完整文件工作流**：新建、打开、保存、另存为、导出 HTML，以及最近文件列表与快捷键面板。
- **内容可视化**：内置 Marked.js 与 highlight.js，高亮多语言代码块；支持 Mermaid 流程图、时序图等。
- **优雅的阅读体验**：浅色 / 深色 / 自动主题切换，响应式布局与优化的代码块样式。
- **链接增强**：外部链接在默认浏览器打开；相对路径链接可在应用内弹窗预览，缺失文件给出提示。

## 🚀 快速开始

### 1. 环境准备

- Node.js ≥ 18
- Rust ≥ 1.74（含 `cargo`）
- Tauri CLI：`npm install -g @tauri-apps/cli`

> **Debian/Ubuntu 系** 请确保安装桌面依赖：
> ```bash
> sudo apt-get update
> sudo apt-get install -y build-essential pkg-config libgtk-3-dev \
>   libsoup-3.0-dev libwebkit2gtk-4.1-dev libssl-dev
> ```

### 2. 克隆并安装依赖

```bash
git clone <repo-url>
cd markdown
npm install
```

### 3. 运行与构建

```bash
# 开发调试
npm run dev            # 等同于 tauri dev

# 打包发行版
npm run tauri build
```

## 🧭 项目结构

```
markdown/
├── src/                     # 前端资源
│   ├── index.html           # UI 结构
│   ├── main.js              # 应用逻辑
│   └── styles.css           # 样式与主题
├── src-tauri/               # Rust + Tauri 后端
│   ├── src/
│   │   ├── main.rs          # 入口
│   │   └── lib.rs           # 命令与插件初始化
│   ├── capabilities/        # 权限声明
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── README.md
```

## 🛠️ 主要技术

| 层级 | 说明 |
| --- | --- |
| 前端 | 原生 HTML/CSS/JS、Marked.js、Mermaid.js、highlight.js |
| 后端 | Rust + Tauri 2 |
| 插件 | `@tauri-apps/plugin-dialog`（文件对话框）、`@tauri-apps/plugin-fs`（文件读写）、`@tauri-apps/plugin-shell`（外部链接） |
| 权限 | 在 `src-tauri/capabilities/default.json` 中显式放行 `$HOME/*` 与项目根目录，支持预览相对链接 |

## ⌨️ 快捷键

| 功能 | Windows / Linux | 说明 |
| --- | --- | --- |
| 新建文档 | `Ctrl + N` | 创建空白文档 |
| 打开文件 | `Ctrl + O` | 调用系统文件选择器 |
| 保存 | `Ctrl + S` | 保存当前文件 |
| 另存为 | `Ctrl + Shift + S` | 保存到新位置 |
| 最近文件面板 | `Ctrl + Shift + R` | 显示/隐藏最近文件列表 |
| 全屏预览 | `F11` | 切换沉浸式阅读 |
| 退出面板 | `Esc` | 关闭最近文件 / 链接预览弹窗 |

## 🔍 功能详情

- **Markdown 渲染**：Marked.js 解析 + highlight.js 高亮；Mermaid 图表在首屏渲染并保持滚动位置。
- **文件操作增强**：
  - 最近文件记录持久化本地存储，最多保存 10 条。
  - 支持从 Tauri 文件关联（系统双击 `.md` 文件）唤起应用并打开目标文件。
- **链接访问**：
  - `http(s)` 链接通过 Shell 插件在默认浏览器打开。
  - 相对路径链接解析成绝对路径，读入 Markdown 并在弹窗中渲染；若不存在则弹出提示。
- **主题与高亮**：CSS 自定义属性驱动，highligh.js 多主题切换随当前主题变化。

## ⚙️ 开发贴士

- 新增与文件访问相关的功能时，请同步调整 `capabilities/default.json`，否则 Tauri 会阻止读写并报 `forbidden path`。
- Linux 打包/编译需要安装 `libgtk-3-dev`、`libsoup-3.0-dev`、`libwebkit2gtk-4.1-dev` 等库。
- 调试时可使用浏览器 DevTools（`Ctrl+Shift+I`）观察前端日志，Rust 后端日志可通过 `RUST_LOG=debug npm run dev` 查看。

## 🤝 贡献

欢迎通过 PR、Issue 贡献想法或修复。提交前请确保：

1. 运行 `npm run lint`（若后续添加）。
2. 验证主要交互流程（打开/保存、主题切换、最近文件、外链/相对链接预览）。
3. 更新文档与截图（若有 UI 变更）。

## 📄 许可证

本项目采用 MIT 许可证，详情见 `LICENSE`。

---

*Enjoy writing in Markdown Editor!* 
