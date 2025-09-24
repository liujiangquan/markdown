const { invoke } = window.__TAURI__.core;

// DOM 元素
const editor = document.getElementById('markdown-editor');
const preview = document.getElementById('preview-content');
const statusText = document.getElementById('status-text');
const wordCountSpan = document.getElementById('word-count');

// 按钮元素
const newBtn = document.getElementById('new-btn');
const openBtn = document.getElementById('open-btn');
const saveBtn = document.getElementById('save-btn');
const saveAsBtn = document.getElementById('save-as-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const findBtn = document.getElementById('find-btn');
const replaceBtn = document.getElementById('replace-btn');
const syncScrollBtn = document.getElementById('sync-scroll-btn');
const exportBtn = document.getElementById('export-btn');
const themeSelector = document.getElementById('theme-selector');

// 模态框元素
const findReplaceModal = document.getElementById('find-replace-modal');
const closeModalBtn = document.getElementById('close-modal');
const closeModalBtn2 = document.getElementById('close-modal-btn');
const findInput = document.getElementById('find-input');
const replaceInput = document.getElementById('replace-input');
const caseSensitiveCheck = document.getElementById('case-sensitive');
const wholeWordCheck = document.getElementById('whole-word');
const findNextBtn = document.getElementById('find-next');
const replaceCurrentBtn = document.getElementById('replace-current');
const replaceAllBtn = document.getElementById('replace-all');

// 面板元素
const editorPanel = document.getElementById('editor-panel');
const previewPanel = document.getElementById('preview-panel');

// 全屏预览元素
const fullscreenModal = document.getElementById('fullscreen-modal');
const fullscreenContent = document.getElementById('fullscreen-content');
const closeFullscreenBtn = document.getElementById('close-fullscreen');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// 全屏目录元素
const fullscreenTocPanel = document.getElementById('fullscreen-toc-panel');
const fullscreenTocContent = document.getElementById('fullscreen-toc-content');

// 状态变量
let currentContent = '';
let isScrolling = false; // 防止循环滚动
let syncScrollEnabled = true; // 同步滚动开关
let currentTheme = 'auto'; // 当前主题
let history = []; // 撤销重做历史
let historyIndex = -1; // 当前历史索引
let currentSearchIndex = -1; // 当前搜索索引
let searchResults = []; // 搜索结果
let isFullscreen = false; // 是否全屏模式
let fullscreenTocItems = []; // 全屏目录项列表

// 初始化应用
function init() {
  setupEventListeners();
  loadDefaultContent();
  updatePreview();
  updateWordCount();
  initTheme();
  setupFullscreenTocScrollListener();
}

// 设置事件监听器
function setupEventListeners() {
  console.log('设置事件监听器...');
  
  try {
    // 文件操作按钮
    newBtn.addEventListener('click', handleNewFile);
    openBtn.addEventListener('click', handleOpenFile);
    saveBtn.addEventListener('click', handleSaveFile);
    saveAsBtn.addEventListener('click', handleSaveAsFile);
    console.log('文件操作按钮事件监听器已设置');
    
    // 编辑功能按钮
    undoBtn.addEventListener('click', handleUndo);
    redoBtn.addEventListener('click', handleRedo);
    findBtn.addEventListener('click', openFindReplaceModal);
    replaceBtn.addEventListener('click', openFindReplaceModal);
    exportBtn.addEventListener('click', handleExport);
    console.log('编辑功能按钮事件监听器已设置');
    
    // 预览相关按钮
    syncScrollBtn.addEventListener('click', toggleSyncScroll);
    console.log('预览相关按钮事件监听器已设置');
    
    // 编辑器内容变化
    editor.addEventListener('input', handleEditorChange);
    console.log('编辑器事件监听器已设置');
    
    // 同步滚动事件
    editor.addEventListener('scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);
    console.log('同步滚动事件监听器已设置');
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
    console.log('键盘快捷键事件监听器已设置');
    
    
    // 主题切换
    themeSelector.addEventListener('change', handleThemeChange);
    console.log('主题切换事件监听器已设置');
    
    // 全屏预览按钮
    fullscreenBtn.addEventListener('click', openFullscreen);
    closeFullscreenBtn.addEventListener('click', closeFullscreen);
    console.log('全屏预览按钮事件监听器已设置');
    
    // 模态框事件
    closeModalBtn.addEventListener('click', closeFindReplaceModal);
    closeModalBtn2.addEventListener('click', closeFindReplaceModal);
    findReplaceModal.addEventListener('click', (e) => {
      if (e.target === findReplaceModal) {
        closeFindReplaceModal();
      }
    });
    
    // 全屏模态框点击外部关闭
    fullscreenModal.addEventListener('click', (e) => {
      if (e.target === fullscreenModal) {
        closeFullscreen();
      }
    });
    findNextBtn.addEventListener('click', handleFindNext);
    replaceCurrentBtn.addEventListener('click', handleReplaceCurrent);
    replaceAllBtn.addEventListener('click', handleReplaceAll);
    console.log('模态框事件监听器已设置');
    
    console.log('所有事件监听器设置完成');
  } catch (error) {
    console.error('设置事件监听器时出错:', error);
  }
}

// 加载默认内容
function loadDefaultContent() {
  currentContent = `# 欢迎使用 Markdown 编辑器

这是一个功能完整的 Markdown 编辑和预览工具。

## 主要功能

- ✨ **实时预览** - 编辑时实时显示预览效果
- 📁 **文件操作** - 支持打开、保存、新建文件
- 🔍 **全屏预览** - 支持全屏模式查看文档
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🎨 **现代界面** - 简洁美观的用户界面

## 支持的 Markdown 语法

### 标题
\`\`\`
# 一级标题
## 二级标题
### 三级标题
\`\`\`

### 文本格式
\`\`\`
**粗体文本**
*斜体文本*
\`代码文本\`
\`\`\`

### 列表
\`\`\`
- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项

1. 有序列表项 1
2. 有序列表项 2
\`\`\`

### 链接和图片
\`\`\`
[链接文本](https://example.com)
![图片描述](https://example.com/image.jpg)
\`\`\`

### 代码块
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Mermaid 图表
\`\`\`mermaid
graph TB
    A[开始] --> B{条件判断}
    B -->|是| C[执行操作A]
    B -->|否| D[执行操作B]
    C --> E[结束]
    D --> E
\`\`\`

### Android Init 语法示例
\`\`\`bash
# Android Init 使用自定义的配置语言，支持以下语法元素：

# 1. Actions (动作)
on <trigger> [&& <trigger>]*
    <command>
    <command>
    ...

# 2. Services (服务)
service <name> <pathname> [<argument>]*
    <option>
    <option>
    ...

# 3. Imports (导入)
import <path>

# 示例配置
on early-init
    start ueventd

service ueventd /sbin/ueventd
    class core
    critical
    seclabel u:r:ueventd:s0
\`\`\`

### Bash 脚本示例
\`\`\`bash
#!/bin/bash

# 这是一个示例脚本
function check_service() {
    local service_name=$1
    
    if systemctl is-active --quiet $service_name; then
        echo "服务 $service_name 正在运行"
        return 0
    else
        echo "服务 $service_name 未运行"
        return 1
    fi
}

# 检查多个服务
services=("nginx" "mysql" "redis")

for service in "\${services[@]}"; do
    check_service $service || echo "警告: $service 服务异常"
done

# 使用管道和重定向
echo "系统信息:" | tee /tmp/system_info.log
uname -a >> /tmp/system_info.log 2>&1
\`\`\`

### 表格
\`\`\`
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
\`\`\`

### 引用
\`\`\`
> 这是一个引用块
> 可以包含多行内容
\`\`\`

---

开始编写你的 Markdown 文档吧！`;
  
  editor.value = currentContent;
  updatePreview();
}

// 处理编辑器内容变化
function handleEditorChange() {
  currentContent = editor.value;
  updatePreview();
  updateWordCount();
  
  // 延迟保存历史记录，避免频繁保存
  clearTimeout(handleEditorChange.timeoutId);
  handleEditorChange.timeoutId = setTimeout(() => {
    saveToHistory();
  }, 1000);
}

// 更新预览内容
function updatePreview() {
  if (typeof marked !== 'undefined') {
    const html = marked.parse(currentContent);
    preview.innerHTML = html;
    
    // 如果当前是全屏模式，同时更新全屏内容
    if (isFullscreen) {
      fullscreenContent.innerHTML = html;
    }
    
    // 增强代码块
    enhanceCodeBlocks();
    
    // 渲染 Mermaid 图表
    renderMermaidDiagrams();
    
    // 生成全屏目录
    if (isFullscreen) {
      generateFullscreenToc();
    }
  } else {
    // 如果 marked 库未加载，显示纯文本
    preview.innerHTML = `<pre>${currentContent}</pre>`;
    if (isFullscreen) {
      fullscreenContent.innerHTML = `<pre>${currentContent}</pre>`;
    }
  }
}

// 渲染 Mermaid 图表
function renderMermaidDiagrams() {
  if (typeof mermaid !== 'undefined') {
    // 查找所有 mermaid 代码块
    const mermaidElements = document.querySelectorAll('code.language-mermaid, pre code.language-mermaid');
    
    mermaidElements.forEach((element, index) => {
      // 创建唯一的 ID
      const diagramId = `mermaid-diagram-${Date.now()}-${index}`;
      
      // 创建新的 div 元素来替换代码块
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.id = diagramId;
      mermaidDiv.textContent = element.textContent;
      
      // 替换原来的代码块
      const preElement = element.parentElement;
      preElement.parentNode.replaceChild(mermaidDiv, preElement);
    });
    
    // 初始化并渲染 Mermaid
    try {
      const isDark = currentTheme === 'dark' || (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        themeVariables: isDark ? {
          primaryColor: '#4dabf7',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#4dabf7',
          lineColor: '#ffffff',
          secondaryColor: '#2d2d2d',
          tertiaryColor: '#1e1e1e'
        } : {
          primaryColor: '#007bff',
          primaryTextColor: '#333',
          primaryBorderColor: '#007bff',
          lineColor: '#333',
          secondaryColor: '#f8f9fa',
          tertiaryColor: '#ffffff'
        }
      });
      
      // 渲染所有 Mermaid 图表
      mermaid.run({
        querySelector: '.mermaid'
      }).catch(error => {
        console.error('Mermaid 渲染错误:', error);
      });
    } catch (error) {
      console.error('Mermaid 初始化错误:', error);
    }
  }
}

// 增强代码块 - 简化版本，只添加语言标签和复制按钮
function enhanceCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach((codeBlock) => {
    const preElement = codeBlock.parentElement;
    
    // 跳过已经处理过的代码块
    if (preElement.hasAttribute('data-enhanced')) {
      return;
    }
    
    // 保存原始文本内容
    const originalText = codeBlock.textContent;
    
    // 添加语言标签
    const language = codeBlock.className.match(/language-(\w+)/);
    if (language) {
      preElement.setAttribute('data-language', language[1]);
    }
    
    // 添加复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '复制';
    copyBtn.addEventListener('click', () => copyCode(originalText));
    preElement.appendChild(copyBtn);
    
    // 标记为已处理
    preElement.setAttribute('data-enhanced', 'true');
  });
}

// 复制代码功能
function copyCode(text) {
  navigator.clipboard.writeText(text).then(() => {
    showStatus('代码已复制到剪贴板', 'success');
  }).catch(err => {
    console.error('复制失败:', err);
    showStatus('复制失败', 'error');
  });
}

// 简单的语法高亮 - 已禁用以避免样式错误
function applySyntaxHighlighting(codeBlock) {
  // 禁用所有语法高亮，直接显示原始文本
  // 这样可以避免样式代码显示的问题
  return;
}

// 更新字数统计
function updateWordCount() {
  const text = currentContent.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const chars = currentContent.length;
  wordCountSpan.textContent = `字数: ${words} | 字符: ${chars}`;
}

// 处理编辑器滚动
function handleEditorScroll() {
  if (isScrolling || !syncScrollEnabled) return;
  
  isScrolling = true;
  syncScroll(editor, preview, 'editor');
  
  // 延迟重置标志，防止频繁触发
  setTimeout(() => {
    isScrolling = false;
  }, 50);
}

// 处理预览区域滚动
function handlePreviewScroll() {
  if (isScrolling || !syncScrollEnabled) return;
  
  isScrolling = true;
  syncScroll(preview, editor, 'preview');
  
  // 延迟重置标志，防止频繁触发
  setTimeout(() => {
    isScrolling = false;
  }, 50);
}

// 同步滚动函数
function syncScroll(sourceElement, targetElement, sourceType) {
  const sourceScrollTop = sourceElement.scrollTop;
  const sourceScrollHeight = sourceElement.scrollHeight;
  const sourceClientHeight = sourceElement.clientHeight;
  
  // 计算滚动百分比
  const scrollPercentage = sourceScrollTop / (sourceScrollHeight - sourceClientHeight);
  
  // 应用到目标元素
  const targetScrollHeight = targetElement.scrollHeight;
  const targetClientHeight = targetElement.clientHeight;
  const targetScrollTop = scrollPercentage * (targetScrollHeight - targetClientHeight);
  
  targetElement.scrollTop = Math.max(0, Math.min(targetScrollTop, targetScrollHeight - targetClientHeight));
}

// 处理新建文件
async function handleNewFile() {
  console.log('新建文件按钮被点击');
  try {
    const result = await invoke('new_file');
    currentContent = result;
    editor.value = currentContent;
    updatePreview();
    updateWordCount();
    showStatus('已新建文档', 'success');
  } catch (error) {
    console.error('新建文件错误:', error);
    showStatus(`新建文件失败: ${error}`, 'error');
  }
}

// 处理打开文件
async function handleOpenFile() {
  console.log('打开文件按钮被点击');
  try {
    showStatus('正在打开文件...', 'info');
    const content = await invoke('open_file');
    currentContent = content;
    editor.value = currentContent;
    updatePreview();
    updateWordCount();
    showStatus('文件打开成功', 'success');
  } catch (error) {
    console.error('打开文件错误:', error);
    if (error !== '未选择文件') {
      showStatus(`打开文件失败: ${error}`, 'error');
    }
  }
}

// 处理保存文件
async function handleSaveFile() {
  console.log('保存文件按钮被点击');
  try {
    showStatus('正在保存文件...', 'info');
    const filePath = await invoke('save_file', { content: currentContent });
    showStatus(`文件保存成功: ${filePath.split('/').pop()}`, 'success');
  } catch (error) {
    console.error('保存文件错误:', error);
    if (error !== '未选择保存路径') {
      showStatus(`保存文件失败: ${error}`, 'error');
    }
  }
}


// 切换同步滚动
function toggleSyncScroll() {
  syncScrollEnabled = !syncScrollEnabled;
  
  if (syncScrollEnabled) {
    syncScrollBtn.textContent = '🔗 同步';
    syncScrollBtn.classList.remove('disabled');
    syncScrollBtn.setAttribute('data-enabled', 'true');
    showStatus('同步滚动已启用', 'success');
  } else {
    syncScrollBtn.textContent = '🔗 不同步';
    syncScrollBtn.classList.add('disabled');
    syncScrollBtn.setAttribute('data-enabled', 'false');
    showStatus('同步滚动已禁用', 'info');
  }
}


// 初始化主题
function initTheme() {
  // 从本地存储加载主题设置
  const savedTheme = localStorage.getItem('markdown-editor-theme') || 'auto';
  currentTheme = savedTheme;
  themeSelector.value = currentTheme;
  applyTheme(currentTheme);
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'auto') {
      applyTheme('auto');
    }
  });
}

// 应用主题
function applyTheme(theme) {
  currentTheme = theme;
  
  // 移除现有主题类
  document.documentElement.removeAttribute('data-theme');
  
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  // auto 主题不需要设置 data-theme，使用系统默认
  
  // 保存主题设置
  localStorage.setItem('markdown-editor-theme', theme);
  
  // 重新渲染 Mermaid 图表以应用新主题
  setTimeout(() => {
    renderMermaidDiagrams();
  }, 100);
}

// 处理主题切换
function handleThemeChange() {
  const selectedTheme = themeSelector.value;
  applyTheme(selectedTheme);
  
  const themeNames = {
    'light': '浅色主题',
    'dark': '暗黑主题',
    'auto': '自动切换'
  };
  
  showStatus(`已切换到${themeNames[selectedTheme]}`, 'success');
}

// 显示状态信息
function showStatus(message, type = 'info') {
  statusText.textContent = message;
  statusText.className = `status-${type}`;
  
  // 3秒后清除状态信息
  setTimeout(() => {
    statusText.textContent = '就绪';
    statusText.className = '';
  }, 3000);
}

// 处理键盘快捷键
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + S: 保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    handleSaveFile();
  }
  
  // Ctrl/Cmd + O: 打开
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    handleOpenFile();
  }
  
  // Ctrl/Cmd + N: 新建
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    handleNewFile();
  }
  
  
  // Ctrl/Cmd + Shift + S: 另存为
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    handleSaveAsFile();
  }
  
  // Ctrl/Cmd + Z: 撤销
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    handleUndo();
  }
  
  // Ctrl/Cmd + Y 或 Ctrl/Cmd + Shift + Z: 重做
  if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
    e.preventDefault();
    handleRedo();
  }
  
  // Ctrl/Cmd + F: 查找
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    openFindReplaceModal();
  }
  
  // Ctrl/Cmd + H: 替换
  if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
    e.preventDefault();
    openFindReplaceModal();
  }
  
  // Ctrl/Cmd + Shift + R: 切换同步滚动
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
    e.preventDefault();
    toggleSyncScroll();
  }
  
  // Ctrl/Cmd + Shift + T: 切换主题
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
    e.preventDefault();
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    themeSelector.value = themes[nextIndex];
    handleThemeChange();
  }
  
  // F11: 全屏预览
  if (e.key === 'F11') {
    e.preventDefault();
    if (isFullscreen) {
      closeFullscreen();
    } else {
      openFullscreen();
    }
  }
  
  // Escape: 关闭全屏
  if (e.key === 'Escape' && isFullscreen) {
    closeFullscreen();
  }
  
}

// 添加状态样式
const style = document.createElement('style');
style.textContent = `
  .status-success {
    color: var(--success-color);
    font-weight: 500;
  }
  
  .status-error {
    color: var(--danger-color);
    font-weight: 500;
  }
  
  .status-info {
    color: var(--accent-color);
    font-weight: 500;
  }
  
  .btn.active {
    background-color: var(--accent-color);
    color: white;
  }
`;
document.head.appendChild(style);

// 另存为文件
async function handleSaveAsFile() {
  console.log('另存为文件按钮被点击');
  try {
    showStatus('正在另存为文件...', 'info');
    const filePath = await invoke('save_file', { content: currentContent });
    showStatus(`文件另存为成功: ${filePath.split('/').pop()}`, 'success');
  } catch (error) {
    console.error('另存为文件错误:', error);
    if (error !== '未选择保存路径') {
      showStatus(`另存为文件失败: ${error}`, 'error');
    }
  }
}

// 撤销功能
function handleUndo() {
  if (historyIndex > 0) {
    historyIndex--;
    const content = history[historyIndex];
    editor.value = content;
    currentContent = content;
    updatePreview();
    updateWordCount();
    showStatus('已撤销', 'info');
  } else {
    showStatus('没有可撤销的操作', 'info');
  }
}

// 重做功能
function handleRedo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    const content = history[historyIndex];
    editor.value = content;
    currentContent = content;
    updatePreview();
    updateWordCount();
    showStatus('已重做', 'info');
  } else {
    showStatus('没有可重做的操作', 'info');
  }
}

// 打开查找替换模态框
function openFindReplaceModal() {
  findReplaceModal.classList.add('active');
  findInput.focus();
  showStatus('查找替换模式', 'info');
}

// 关闭查找替换模态框
function closeFindReplaceModal() {
  findReplaceModal.classList.remove('active');
  showStatus('已关闭查找替换', 'info');
}

// 查找下一个
function handleFindNext() {
  const searchText = findInput.value;
  if (!searchText) {
    showStatus('请输入要查找的文本', 'error');
    return;
  }
  
  const content = editor.value;
  const caseSensitive = caseSensitiveCheck.checked;
  const wholeWord = wholeWordCheck.checked;
  
  let searchPattern = searchText;
  if (!caseSensitive) {
    searchPattern = searchText.toLowerCase();
  }
  
  if (wholeWord) {
    searchPattern = `\\b${searchPattern}\\b`;
  }
  
  const regex = new RegExp(searchPattern, caseSensitive ? 'g' : 'gi');
  const matches = [...content.matchAll(regex)];
  
  if (matches.length === 0) {
    showStatus('未找到匹配的文本', 'error');
    return;
  }
  
  currentSearchIndex = (currentSearchIndex + 1) % matches.length;
  const match = matches[currentSearchIndex];
  
  // 选中匹配的文本
  editor.focus();
  editor.setSelectionRange(match.index, match.index + match[0].length);
  
  showStatus(`找到第 ${currentSearchIndex + 1} 个匹配项，共 ${matches.length} 个`, 'success');
}

// 替换当前
function handleReplaceCurrent() {
  const searchText = findInput.value;
  const replaceText = replaceInput.value;
  
  if (!searchText) {
    showStatus('请输入要查找的文本', 'error');
    return;
  }
  
  const selection = editor.selectionStart;
  const content = editor.value;
  const caseSensitive = caseSensitiveCheck.checked;
  const wholeWord = wholeWordCheck.checked;
  
  let searchPattern = searchText;
  if (!caseSensitive) {
    searchPattern = searchText.toLowerCase();
  }
  
  if (wholeWord) {
    searchPattern = `\\b${searchPattern}\\b`;
  }
  
  const regex = new RegExp(searchPattern, caseSensitive ? 'g' : 'gi');
  const match = content.slice(selection).match(regex);
  
  if (match) {
    const newContent = content.replace(regex, replaceText);
    editor.value = newContent;
    currentContent = newContent;
    updatePreview();
    updateWordCount();
    showStatus('已替换当前匹配项', 'success');
  } else {
    showStatus('当前选择不匹配', 'error');
  }
}

// 全部替换
function handleReplaceAll() {
  const searchText = findInput.value;
  const replaceText = replaceInput.value;
  
  if (!searchText) {
    showStatus('请输入要查找的文本', 'error');
    return;
  }
  
  const content = editor.value;
  const caseSensitive = caseSensitiveCheck.checked;
  const wholeWord = wholeWordCheck.checked;
  
  let searchPattern = searchText;
  if (!caseSensitive) {
    searchPattern = searchText.toLowerCase();
  }
  
  if (wholeWord) {
    searchPattern = `\\b${searchPattern}\\b`;
  }
  
  const regex = new RegExp(searchPattern, caseSensitive ? 'g' : 'gi');
  const matches = content.match(regex);
  
  if (!matches) {
    showStatus('未找到匹配的文本', 'error');
    return;
  }
  
  const newContent = content.replace(regex, replaceText);
  editor.value = newContent;
  currentContent = newContent;
  updatePreview();
  updateWordCount();
  showStatus(`已替换 ${matches.length} 个匹配项`, 'success');
}

// 导出为HTML
function handleExport() {
  if (typeof marked !== 'undefined') {
    const html = marked.parse(currentContent);
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>导出的Markdown文档</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 1.5em; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('HTML文件已导出', 'success');
  } else {
    showStatus('Markdown解析库未加载', 'error');
  }
}

// 保存历史记录
function saveToHistory() {
  const content = editor.value;
  if (content !== currentContent) {
    history = history.slice(0, historyIndex + 1);
    history.push(content);
    historyIndex = history.length - 1;
    
    // 限制历史记录数量
    if (history.length > 50) {
      history.shift();
      historyIndex--;
    }
  }
}

// 打开全屏预览
function openFullscreen() {
  isFullscreen = true;
  fullscreenModal.classList.add('active');
  
  console.log('进入全屏模式，开始生成目录...');
  console.log('目录面板元素:', fullscreenTocPanel);
  console.log('目录面板可见性:', fullscreenTocPanel.style.display);
  
  // 确保全屏内容与预览内容一致
  if (typeof marked !== 'undefined') {
    const html = marked.parse(currentContent);
    fullscreenContent.innerHTML = html;
    
    // 增强全屏内容中的代码块
    enhanceCodeBlocks();
    
    // 渲染全屏内容中的 Mermaid 图表
    renderMermaidDiagrams();
    
    // 生成全屏目录
    console.log('开始生成全屏目录...');
    generateFullscreenToc();
    console.log('全屏目录生成完成，目录项数量:', fullscreenTocItems.length);
  } else {
    fullscreenContent.innerHTML = `<pre>${currentContent}</pre>`;
  }
  
  showStatus('已进入全屏预览模式', 'info');
}

// 关闭全屏预览
function closeFullscreen() {
  isFullscreen = false;
  fullscreenModal.classList.remove('active');
  showStatus('已退出全屏预览模式', 'info');
}


// 生成全屏目录
function generateFullscreenToc() {
  const headings = fullscreenContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
  fullscreenTocItems = [];
  
  if (headings.length === 0) {
    clearFullscreenToc();
    return;
  }
  
  // 为每个标题添加ID
  headings.forEach((heading, index) => {
    const id = `fullscreen-heading-${index}`;
    heading.id = id;
    
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent.trim();
    
    fullscreenTocItems.push({
      id: id,
      level: level,
      text: text,
      element: heading
    });
  });
  
  renderFullscreenToc();
}

// 渲染全屏目录
function renderFullscreenToc() {
  console.log('renderFullscreenToc 被调用，目录项数量:', fullscreenTocItems.length);
  
  if (fullscreenTocItems.length === 0) {
    console.log('没有目录项，清空目录');
    clearFullscreenToc();
    return;
  }
  
  const tocList = document.createElement('ul');
  tocList.className = 'toc-list';
  
  fullscreenTocItems.forEach(item => {
    const li = document.createElement('li');
    li.className = `toc-item level-${item.level}`;
    
    const link = document.createElement('a');
    link.href = `#${item.id}`;
    link.className = 'toc-link';
    link.textContent = item.text;
    
    // 添加点击事件
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToFullscreenHeading(item.id);
    });
    
    li.appendChild(link);
    tocList.appendChild(li);
  });
  
  fullscreenTocContent.innerHTML = '';
  fullscreenTocContent.appendChild(tocList);
  
  console.log('目录渲染完成，目录面板可见性:', fullscreenTocPanel.style.display);
  console.log('目录面板类名:', fullscreenTocPanel.className);
  
  // 监听滚动事件，更新活动目录项
  updateActiveFullscreenTocItem();
}

// 清空全屏目录
function clearFullscreenToc() {
  fullscreenTocContent.innerHTML = '<div class="toc-placeholder">开始编写文档以生成目录...</div>';
  fullscreenTocItems = [];
}

// 滚动到全屏指定标题
function scrollToFullscreenHeading(headingId) {
  const heading = document.getElementById(headingId);
  if (heading) {
    heading.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    
    // 更新活动目录项
    updateActiveFullscreenTocItem();
    
    showStatus(`已跳转到: ${heading.textContent}`, 'success');
  }
}

// 更新全屏活动目录项
function updateActiveFullscreenTocItem() {
  const tocLinks = fullscreenTocContent.querySelectorAll('.toc-link');
  const headings = fullscreenContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  // 清除所有活动状态
  tocLinks.forEach(link => link.classList.remove('active'));
  
  // 找到当前可见的标题
  let activeHeading = null;
  
  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i];
    const rect = heading.getBoundingClientRect();
    const fullscreenRect = fullscreenContent.getBoundingClientRect();
    
    if (rect.top <= fullscreenRect.top + 100) {
      activeHeading = heading;
      break;
    }
  }
  
  // 设置活动状态
  if (activeHeading) {
    const activeLink = fullscreenTocContent.querySelector(`a[href="#${activeHeading.id}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}

// 监听全屏预览区域滚动，更新活动目录项
function setupFullscreenTocScrollListener() {
  fullscreenContent.addEventListener('scroll', () => {
    updateActiveFullscreenTocItem();
  });
}

// 页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', () => {
  console.log('Markdown Editor: 开始初始化...');
  try {
    init();
    console.log('Markdown Editor: 初始化完成');
  } catch (error) {
    console.error('Markdown Editor: 初始化失败', error);
  }
});