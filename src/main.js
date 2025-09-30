// 文件关联标志（全局变量）
let hasFileAssociationContent = false;

// Markdown编辑器主应用
document.addEventListener('DOMContentLoaded', () => {
const editor = document.getElementById('markdown-editor');
    const preview = document.getElementById('markdown-preview');
    
    if (!editor || !preview) {
        console.error('编辑器或预览元素未找到');
        return;
    }
    
    // 默认内容（空白文档）
    const defaultContent = '';
    
    // 欢迎模板内容
    const welcomeTemplate = `# Markdown 编辑器

欢迎使用 Markdown 编辑器！

## 基本语法

- **粗体文本**
- *斜体文本*
- \`代码文本\`

### 列表
- 项目 1
- 项目 2
- 项目 3

### 链接
[链接文本](https://example.com)

### 代码块示例

\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
}
greet('World');
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
\`\`\`

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

\`\`\`bash
#!/bin/bash
echo "当前目录:\$(pwd)"
ls -la
\`\`\`

\`\`\`json
{
  "name": "Markdown Editor",
  "version": "1.0.0",
  "features": ["编辑", "预览", "导出"]
}
\`\`\`

### 流程图示例

\`\`\`mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主界面]
    B -->|否| D[显示登录界面]
    D --> E[用户输入]
    E --> F{验证成功?}
    F -->|是| C
    F -->|否| G[显示错误信息]
    G --> D
    C --> H[结束]
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant E as 编辑器
    participant P as 预览
    participant S as 保存

    U->>E: 输入内容
    E->>P: 实时更新预览
    U->>S: 点击保存
    S->>E: 保存文件
    S-->>U: 保存成功
\`\`\`

---
开始编写你的 Markdown 文档吧！`;
  
    // 应用状态 - 使用全局变量确保一致性
    window.currentFile = null;
    let hasUnsavedChanges = false;
    let syncScroll = true;
    let isFullscreen = false;
    
    // 撤销重做功能已移除
    
    // 只有在没有文件关联内容时才加载默认内容
    console.log('检查文件关联标志:', hasFileAssociationContent, '全局标志:', window.hasFileAssociationContent);
    if (!hasFileAssociationContent && !window.hasFileAssociationContent) {
        console.log('加载默认内容');
        editor.value = defaultContent;
        } else {
            console.log('跳过默认内容加载，等待文件关联');
        }
    
    // 更新预览
    window.updatePreview = function() {
        try {
            // 保存当前滚动位置，避免更新预览时跳转
            const currentScrollTop = preview.scrollTop;
            const currentScrollHeight = preview.scrollHeight;
            
            // 暂时禁用同步滚动，避免更新预览时触发滚动事件
            const originalSyncScroll = syncScroll;
            syncScroll = false;
            
            // 检查highlight.js是否可用
            const hasHighlight = typeof hljs !== 'undefined';
            console.log('highlight.js可用:', hasHighlight);
            if (hasHighlight) {
                console.log('hljs对象:', hljs);
                console.log('支持的语言数量:', Object.keys(hljs.listLanguages()).length);
                console.log('支持的语言:', hljs.listLanguages());
            }
            
            marked.setOptions({
                highlight: function(code, lang) {
                    console.log('高亮代码块，语言:', lang);
                    if (hasHighlight) {
                        if (lang && hljs.getLanguage(lang)) {
                            console.log('使用指定语言高亮:', lang);
                            return hljs.highlight(code, { language: lang }).value;
                        }
                        console.log('使用自动检测高亮');
                        return hljs.highlightAuto(code).value;
                    }
                    console.log('highlight.js不可用，返回原始代码');
                    return code;
                },
                breaks: true,
                gfm: true
            });
            
            const html = marked.parse(editor.value);
            preview.innerHTML = html;
            
            // 恢复滚动位置的函数
            const restoreScrollPosition = () => {
                if (originalSyncScroll) {
                    // 如果同步滚动开启，根据编辑器位置同步预览位置
                    const editorScrollTop = editor.scrollTop;
                    const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
                    const newScrollHeight = preview.scrollHeight - preview.clientHeight;
                    
                    if (editorScrollHeight > 0 && newScrollHeight > 0) {
                        const ratio = editorScrollTop / editorScrollHeight;
                        const targetScrollTop = ratio * newScrollHeight;
                        
                        // 只有当目标位置与当前位置差异较大时才滚动
                        if (Math.abs(preview.scrollTop - targetScrollTop) > 5) {
                            preview.scrollTop = targetScrollTop;
                        }
                    }
                } else {
                    // 如果同步滚动关闭，保持预览的原始位置
                    if (currentScrollHeight > 0) {
                        const newScrollHeight = preview.scrollHeight;
                        if (newScrollHeight > 0) {
                            // 计算相对位置比例
                            const ratio = currentScrollTop / currentScrollHeight;
                            // 应用比例到新的内容高度
                            const targetScrollTop = ratio * newScrollHeight;
                            
                            // 只有当目标位置与当前位置差异较大时才滚动
                            if (Math.abs(preview.scrollTop - targetScrollTop) > 5) {
                                preview.scrollTop = targetScrollTop;
                            }
                        }
                    }
                }
            };
            
            // 立即恢复滚动位置
            restoreScrollPosition();
            
            // 延迟恢复同步滚动状态，等待所有异步操作完成
            setTimeout(() => {
                // 再次恢复滚动位置，防止异步操作改变了内容高度
                restoreScrollPosition();
                // 恢复同步滚动状态
                syncScroll = originalSyncScroll;
            }, 300);
            
            // 渲染Mermaid图表
            if (window.mermaid) {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose'
                });
                
                // 查找所有mermaid代码块并渲染
                const mermaidElements = preview.querySelectorAll('pre code.language-mermaid');
                mermaidElements.forEach((element, index) => {
                    const mermaidCode = element.textContent;
                    const mermaidDiv = document.createElement('div');
                    mermaidDiv.className = 'mermaid';
                    mermaidDiv.textContent = mermaidCode;
      
                    // 替换原来的代码块
                    const preElement = element.parentElement;
                    preElement.parentElement.replaceChild(mermaidDiv, preElement);
                    
                    // 渲染这个图表
                    mermaid.render(`mermaid-${index}`, mermaidCode).then(({ svg }) => {
                        mermaidDiv.innerHTML = svg;
                        // Mermaid渲染完成后恢复滚动位置
                        restoreScrollPosition();
                    }).catch(error => {
                        console.error('Mermaid渲染失败:', error);
                        mermaidDiv.innerHTML = `<p>流程图渲染失败: ${error.message}</p>`;
                        // 即使渲染失败也要恢复滚动位置
                        restoreScrollPosition();
                    });
                });
            }
            
            // 重新高亮所有代码块（如果highlight.js可用）
            if (hasHighlight) {
                const codeBlocks = preview.querySelectorAll('pre code');
                console.log('找到代码块数量:', codeBlocks.length);
                codeBlocks.forEach((block, index) => {
                    if (!block.classList.contains('language-mermaid')) {
                        console.log(`高亮代码块 ${index}:`, block.className, block.textContent.substring(0, 50));
                        try {
                            hljs.highlightElement(block);
                            console.log(`代码块 ${index} 高亮成功`);
                        } catch (error) {
                            console.error(`代码块 ${index} 高亮失败:`, error);
                        }
                    }
                });
                // 代码高亮完成后恢复滚动位置
                setTimeout(() => {
                    restoreScrollPosition();
                }, 50);
            } else {
                console.log('highlight.js不可用，跳过代码高亮');
            }
            
    } catch (error) {
            console.error('预览更新失败:', error);
            preview.innerHTML = '<p>预览渲染失败</p>';
        }
    };
    
    // 更新标题
    window.updateTitle = function() {
        const fileName = window.currentFile ? 
            window.currentFile.split('\\').pop().split('/').pop() : 
            null;
        const title = fileName ? 
            `${fileName} - Markdown Editor` : 
            'Markdown Editor';
        document.title = hasUnsavedChanges ? `*${title}` : title;
    };
    
    // 更新highlight.js主题
    function updateHighlightTheme(theme) {
        const lightTheme = document.getElementById('highlight-light-theme');
        const darkTheme = document.getElementById('highlight-dark-theme');
        
        if (!lightTheme || !darkTheme) {
            console.log('highlight.js主题样式未找到');
            return;
        }
    
        console.log('当前主题:', theme);
        console.log('浅色主题状态:', lightTheme.disabled);
        console.log('深色主题状态:', darkTheme.disabled);
        
        // 先禁用所有主题
        lightTheme.disabled = true;
        darkTheme.disabled = true;
        
        // 根据主题选择样式
        if (theme === 'dark') {
            darkTheme.disabled = false;
            console.log('启用highlight.js深色主题');
        } else if (theme === 'light') {
            lightTheme.disabled = false;
            console.log('启用highlight.js浅色主题');
        } else if (theme === 'auto') {
            // 自动主题：让CSS媒体查询决定
            lightTheme.disabled = false;
            darkTheme.disabled = false;
            console.log('启用highlight.js自动主题');
        }
        
        console.log('主题切换后状态:');
        console.log('浅色主题状态:', lightTheme.disabled);
        console.log('深色主题状态:', darkTheme.disabled);
        
        // 延迟重新高亮，确保样式已应用
        setTimeout(() => {
            if (typeof hljs !== 'undefined') {
                console.log('开始重新高亮代码块...');
                const codeBlocks = preview.querySelectorAll('pre code');
                console.log('找到代码块数量:', codeBlocks.length);
                
                codeBlocks.forEach((block, index) => {
                    if (!block.classList.contains('language-mermaid')) {
                        console.log(`处理代码块 ${index}:`, block.className);
                        
                        // 清除之前的高亮状态
                        block.removeAttribute('data-highlighted');
                        block.className = block.className.replace(/hljs-[\w-]+/g, '').trim();
                        
                        // 重新高亮
                        try {
                            hljs.highlightElement(block);
                            console.log(`代码块 ${index} 重新高亮成功，新类名:`, block.className);
                        } catch (error) {
                            console.error(`代码块 ${index} 重新高亮失败:`, error);
                        }
                    }
                });
                console.log('代码块重新高亮完成');
            } else {
                console.error('hljs未定义，无法重新高亮');
            }
        }, 200);
    }
    
    // 标记为已修改
    function markAsChanged() {
        hasUnsavedChanges = true;
        updateTitle();
    }
    
    // 保存历史状态功能已移除
    
    // 更新撤销/重做按钮状态功能已移除
    
    // 撤销重做功能已移除
    
    // 新建空白文档
    function createBlankDocument() {
        if (hasUnsavedChanges) {
            if (!confirm('当前文档有未保存的更改，确定要创建新文档吗？')) {
                return;
            }
        }
        
        editor.value = '';
        window.currentFile = null;
        hasUnsavedChanges = false;
        updatePreview();
        updateTitle();
        editor.focus();
    }
    
    // 使用模板创建文档
    function createWithTemplate() {
        if (hasUnsavedChanges) {
            if (!confirm('当前文档有未保存的更改，确定要创建新文档吗？')) {
                return;
            }
        }
        
        editor.value = welcomeTemplate;
        window.currentFile = null;
        hasUnsavedChanges = false;
        updatePreview();
        updateTitle();
        editor.focus();
    }
    
    // 同步滚动功能 - 使用更强大的防抖机制避免循环触发
    let isScrollingEditor = false;
    let isScrollingPreview = false;
    let editorScrollTimeout = null;
    let previewScrollTimeout = null;
    let lastEditorScrollTime = 0;
    let lastPreviewScrollTime = 0;
    let lastEditorScrollTop = 0;
    let lastPreviewScrollTop = 0;
    
    function syncScrollToPreview() {
        // 如果同步滚动未开启，直接返回，不执行任何操作
        if (!syncScroll) return;
        
        if (isScrollingPreview) return;
        
        const now = Date.now();
        const editorScrollTop = editor.scrollTop;
        
        // 如果最近有预览区域滚动，忽略这次编辑器滚动
        if (now - lastPreviewScrollTime < 200) return;
        
        // 如果滚动位置没有变化，忽略
        if (Math.abs(editorScrollTop - lastEditorScrollTop) < 2) return;
        
        // 清除之前的定时器
        if (editorScrollTimeout) {
            clearTimeout(editorScrollTimeout);
        }
        
        isScrollingEditor = true;
        lastEditorScrollTime = now;
        lastEditorScrollTop = editorScrollTop;
        
        const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
        const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
        
        if (editorScrollHeight > 0 && previewScrollHeight > 0) {
            const ratio = editorScrollTop / editorScrollHeight;
            const targetScrollTop = ratio * previewScrollHeight;
            
            // 只有当目标位置与当前位置差异较大时才滚动
            if (Math.abs(preview.scrollTop - targetScrollTop) > 10) {
                preview.scrollTop = targetScrollTop;
            }
        }
        
        // 使用更长的防抖时间
        editorScrollTimeout = setTimeout(() => {
            isScrollingEditor = false;
        }, 200);
    }
    
    function syncScrollToEditor() {
        // 如果同步滚动未开启，直接返回，不执行任何操作
        if (!syncScroll) return;
        
        if (isScrollingEditor) return;
        
        const now = Date.now();
        const previewScrollTop = preview.scrollTop;
        
        // 如果最近有编辑器滚动，忽略这次预览区域滚动
        if (now - lastEditorScrollTime < 200) return;
        
        // 如果滚动位置没有变化，忽略
        if (Math.abs(previewScrollTop - lastPreviewScrollTop) < 2) return;
        
        // 清除之前的定时器
        if (previewScrollTimeout) {
            clearTimeout(previewScrollTimeout);
        }
        
        isScrollingPreview = true;
        lastPreviewScrollTime = now;
        lastPreviewScrollTop = previewScrollTop;
        
        const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
        const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
        
        if (previewScrollHeight > 0 && editorScrollHeight > 0) {
            const ratio = previewScrollTop / previewScrollHeight;
            const targetScrollTop = ratio * editorScrollHeight;
            
            // 只有当目标位置与当前位置差异较大时才滚动
            if (Math.abs(editor.scrollTop - targetScrollTop) > 10) {
                editor.scrollTop = targetScrollTop;
            }
        }
        
        // 使用更长的防抖时间
        previewScrollTimeout = setTimeout(() => {
            isScrollingPreview = false;
        }, 200);
    }

// 切换同步滚动
function toggleSyncScroll() {
        syncScroll = !syncScroll;
        const btn = document.getElementById('sync-btn');
        const icon = btn.querySelector('.icon');
        const text = btn.querySelector('.btn-text');
        
        if (syncScroll) {
            // 同步状态
            btn.classList.add('active');
            btn.title = '同步滚动 (Ctrl+Shift+S)';
            icon.textContent = '🔗';
            text.textContent = '同步';
  } else {
            // 不同步状态
            btn.classList.remove('active');
            btn.title = '不同步滚动 (Ctrl+Shift+S)';
            icon.textContent = '🔓';
            text.textContent = '不同步';
        }
    }
    
    // 生成目录
    function generateTOC() {
        const headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) return '';
        
        let toc = '<div class="toc-container"><h3>目录</h3><ul class="toc-list">';
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent;
            const id = `heading-${index}`;
            
            // 设置标题ID用于锚点链接
            heading.id = id;
            
            // 生成目录项
            toc += `<li class="toc-item level-${level}">
                <a href="#${id}" class="toc-link" data-target="${id}">${text}</a>
            </li>`;
        });
        
        toc += '</ul></div>';
        return toc;
    }
    
    // 切换全屏预览
    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        const btn = document.getElementById('fullscreen-btn');
        const editorContainer = document.querySelector('.editor-container');
        const previewContainer = document.querySelector('.preview-container');
        const mainContent = document.querySelector('.main-content');
        
        btn.classList.toggle('active', isFullscreen);
        
        if (isFullscreen) {
            // 进入全屏模式
            editorContainer.style.display = 'none';
            previewContainer.style.flex = '1';
            
            // 添加全屏样式
            mainContent.classList.add('fullscreen-mode');
            
            // 生成并显示目录
            const toc = generateTOC();
            if (toc) {
                // 创建目录容器
                let tocContainer = document.querySelector('.fullscreen-toc');
                if (!tocContainer) {
                    tocContainer = document.createElement('div');
                    tocContainer.className = 'fullscreen-toc';
                    previewContainer.insertBefore(tocContainer, previewContainer.firstChild);
                }
                tocContainer.innerHTML = toc;
                
                // 添加退出全屏按钮
                const exitButton = document.createElement('button');
                exitButton.className = 'exit-fullscreen-btn';
                exitButton.innerHTML = '✕ 退出全屏';
                exitButton.addEventListener('click', toggleFullscreen);
                tocContainer.appendChild(exitButton);
                
                // 添加目录点击事件
                tocContainer.querySelectorAll('.toc-link').forEach(link => {
                    link.addEventListener('click', (e) => {
    e.preventDefault();
                        const targetId = link.getAttribute('data-target');
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    });
                });
            }
    } else {
            // 退出全屏模式
            editorContainer.style.display = 'flex';
            previewContainer.style.flex = '1';
            
            // 移除全屏样式
            mainContent.classList.remove('fullscreen-mode');
            
            // 隐藏目录
            const tocContainer = document.querySelector('.fullscreen-toc');
            if (tocContainer) {
                tocContainer.remove();
            }
        }
    }
    
    // 关闭下拉菜单
    function closeDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
    
    // 文件操作功能
    async function openFile() {
        try {
            if (window.__TAURI__ && window.__TAURI__.dialog) {
                // 尝试使用Tauri内置API
                const { open } = window.__TAURI__.dialog;
                const filePath = await open({
                    filters: [{
                        name: 'Markdown',
                        extensions: ['md', 'markdown']
                    }]
                });
                
                if (filePath) {
                    await openFileByPath(filePath);
                }
            } else {
                console.log('Tauri API不可用，使用模拟功能');
                // 模拟打开文件
                const content = prompt('请输入文件内容（模拟打开文件）:');
                if (content !== null) {
                    editor.value = content;
                    window.currentFile = '模拟文件.md';
                    hasUnsavedChanges = false;
                    updatePreview();
                    updateTitle();
                    
                    // 将光标移到文件开头
                    editor.focus();
                    editor.setSelectionRange(0, 0);
                    editor.scrollTop = 0;
                }
            }
        } catch (error) {
            console.error('打开文件失败:', error);
            // 如果Tauri API失败，使用模拟功能
            const content = prompt('Tauri API失败，请输入文件内容（模拟打开文件）:');
            if (content !== null) {
                editor.value = content;
                window.currentFile = '模拟文件.md';
                hasUnsavedChanges = false;
                updatePreview();
                updateTitle();
                
                // 将光标移到文件开头，暂时禁用同步滚动
                const originalSyncScroll = syncScroll;
                syncScroll = false;
                editor.focus();
                editor.setSelectionRange(0, 0);
                editor.scrollTop = 0;
                preview.scrollTop = 0;
                // 恢复同步滚动
                setTimeout(() => {
                    syncScroll = originalSyncScroll;
                }, 100);
            }
        }
    }
    
    // 将openFileByPath函数移到全局作用域
    window.openFileByPath = async function(filePath) {
        console.log('openFileByPath被调用，文件路径:', filePath);
        try {
            if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
                console.log('使用Tauri core.invoke API通过Rust后端读取文件...');
                // 使用Rust后端的open_file_by_path函数
                const { invoke } = window.__TAURI__.core;
                const content = await invoke('open_file_by_path', { filePath: filePath });
                console.log('文件读取成功，内容长度:', content.length);
                
                // 检查编辑器元素
                const editor = document.getElementById('markdown-editor');
                if (!editor) {
                    console.error('编辑器元素未找到！');
                    return;
                }
                console.log('编辑器元素找到，设置内容...');
                
                editor.value = content;
                window.currentFile = filePath; // 保存完整路径
                hasUnsavedChanges = false;
                
                // 更新预览和标题
                if (window.updatePreview) window.updatePreview();
                if (window.updateTitle) window.updateTitle();
                
                // 将光标移到文件开头，暂时禁用同步滚动
                const originalSyncScroll = syncScroll;
                syncScroll = false;
                editor.focus();
                editor.setSelectionRange(0, 0);
                editor.scrollTop = 0;
                preview.scrollTop = 0;
                // 恢复同步滚动
                setTimeout(() => {
                    syncScroll = originalSyncScroll;
                }, 100);
                
                console.log('文件打开成功:', filePath);
            } else {
                console.log('Tauri core.invoke API不可用，使用模拟功能');
                const content = prompt('请输入文件内容（模拟打开文件）:');
                if (content !== null) {
                    const editor = document.getElementById('markdown-editor');
                    if (editor) {
                        editor.value = content;
                        window.currentFile = '模拟文件.md';
                        hasUnsavedChanges = false;
                        if (window.updatePreview) window.updatePreview();
                        if (window.updateTitle) window.updateTitle();
                        
                        // 将光标移到文件开头，暂时禁用同步滚动
                        const originalSyncScroll = syncScroll;
                        syncScroll = false;
                        editor.focus();
                        editor.setSelectionRange(0, 0);
                        editor.scrollTop = 0;
                        preview.scrollTop = 0;
                        // 恢复同步滚动
                        setTimeout(() => {
                            syncScroll = originalSyncScroll;
                        }, 100);
                    }
                }
            }
        } catch (error) {
            console.error('读取文件失败:', error);
            const content = prompt('读取文件失败，请输入文件内容（模拟打开文件）:');
            if (content !== null) {
                const editor = document.getElementById('markdown-editor');
                if (editor) {
    editor.value = content;
                    window.currentFile = '模拟文件.md';
                    hasUnsavedChanges = false;
                    if (window.updatePreview) window.updatePreview();
                    if (window.updateTitle) window.updateTitle();
                    
                    // 将光标移到文件开头，暂时禁用同步滚动
                    const originalSyncScroll = syncScroll;
                    syncScroll = false;
                    editor.focus();
                    editor.setSelectionRange(0, 0);
                    editor.scrollTop = 0;
                    preview.scrollTop = 0;
                    // 恢复同步滚动
                    setTimeout(() => {
                        syncScroll = originalSyncScroll;
                    }, 100);
                }
            }
        }
    };
    
    async function saveFile() {
        console.log('saveFile被调用，当前文件:', window.currentFile);
        console.log('window.currentFile类型:', typeof window.currentFile);
        console.log('window.currentFile是否为null:', window.currentFile === null);
        console.log('window.currentFile是否为undefined:', window.currentFile === undefined);
        console.log('window.currentFile是否为空字符串:', window.currentFile === '');
        
        if (!window.currentFile) {
            console.log('没有当前文件，调用另存为');
            saveAsFile();
    return;
  }
  
        console.log('有当前文件，直接保存到:', window.currentFile);
  
        try {
            console.log('检查Tauri API状态:');
            
            // 分步检查，避免在某个步骤出错
            try {
                console.log('window.__TAURI__存在:', !!window.__TAURI__);
                if (window.__TAURI__) {
                    console.log('window.__TAURI__.fs存在:', !!window.__TAURI__.fs);
                    if (window.__TAURI__.fs) {
                        console.log('writeTextFile存在:', !!window.__TAURI__.fs.writeTextFile);
                    }
                }
            } catch (apiCheckError) {
                console.error('API检查出错:', apiCheckError);
            }
            
            // 优先使用invoke API（Tauri 2.0推荐方式）
            if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
                try {
                    console.log('使用invoke API保存文件:', window.currentFile);
                    const { invoke } = window.__TAURI__.core;
                    await invoke('save_file', { 
                        content: editor.value, 
                        path: window.currentFile 
                    });
                    console.log('invoke API保存成功');
                    hasUnsavedChanges = false;
                    updateTitle();
                    console.log('文件保存成功');
    return;
                } catch (invokeError) {
                    console.error('invoke API保存失败:', invokeError);
                    console.log('invoke API失败，尝试fs API');
                }
            }
            
            // 回退到fs API（如果invoke不可用）
            if (window.__TAURI__ && window.__TAURI__.fs) {
                console.log('尝试使用fs API保存文件:', window.currentFile);
                
                const { writeTextFile } = window.__TAURI__.fs;
                console.log('writeTextFile函数:', writeTextFile);
                
                // 直接使用原始文件路径
                console.log('使用文件路径:', window.currentFile);
                console.log('文件内容长度:', editor.value.length);
                
                // 尝试不同的参数格式
                try {
                    await writeTextFile(window.currentFile, editor.value);
                    console.log('writeTextFile调用成功');
                } catch (writeError) {
                    console.error('writeTextFile调用失败:', writeError);
                    // 尝试使用对象格式
                    await writeTextFile({ path: window.currentFile, contents: editor.value });
                    console.log('使用对象格式调用成功');
                }
                
                hasUnsavedChanges = false;
                updateTitle();
                console.log('文件保存成功');
  } else {
                console.log('Tauri API不可用，模拟保存文件');
                hasUnsavedChanges = false;
                updateTitle();
                alert('文件已保存（模拟）');
            }
        } catch (error) {
            console.error('保存文件失败:', error);
            console.error('错误详情:', error.message);
            console.error('错误堆栈:', error.stack);
            // 如果Tauri API失败，使用模拟功能
            hasUnsavedChanges = false;
            updateTitle();
            alert('文件已保存（模拟，Tauri API失败）');
        }
    }
    
    async function saveAsFile() {
        try {
            if (window.__TAURI__ && window.__TAURI__.dialog) {
                const { save } = window.__TAURI__.dialog;
                const filePath = await save({
                    filters: [{
                        name: 'Markdown',
                        extensions: ['md']
                    }]
                });
                
                if (filePath) {
                    // 优先使用invoke API
                    if (window.__TAURI__.core && window.__TAURI__.core.invoke) {
                        try {
                            console.log('使用invoke API另存为文件:', filePath);
                            const { invoke } = window.__TAURI__.core;
                            await invoke('save_file', { 
                                content: editor.value, 
                                path: filePath 
                            });
                            console.log('invoke API另存为成功');
                            window.currentFile = filePath;
                            hasUnsavedChanges = false;
                            updateTitle();
                            console.log('文件另存为成功');
    return;
                        } catch (invokeError) {
                            console.error('invoke API另存为失败:', invokeError);
                            console.log('invoke API失败，尝试fs API');
                        }
                    }
                    
                    // 回退到fs API
                    const { writeTextFile } = window.__TAURI__.fs;
                    
                    // 尝试不同的参数格式
                    try {
                        await writeTextFile(filePath, editor.value);
                        console.log('writeTextFile调用成功');
                    } catch (writeError) {
                        console.error('writeTextFile调用失败:', writeError);
                        // 尝试使用对象格式
                        await writeTextFile({ path: filePath, contents: editor.value });
                        console.log('使用对象格式调用成功');
                    }
                    
                    window.currentFile = filePath;
                    hasUnsavedChanges = false;
                    updateTitle();
                    console.log('文件另存为成功');
                }
            } else {
                console.log('Tauri API不可用，模拟另存为');
                const fileName = prompt('请输入文件名:', 'document.md');
                if (fileName) {
                    window.currentFile = fileName;
                    hasUnsavedChanges = false;
                    updateTitle();
                    alert('文件已另存为（模拟）');
                }
            }
        } catch (error) {
            console.error('另存为失败:', error);
            // 如果Tauri API失败，使用模拟功能
            const fileName = prompt('Tauri API失败，请输入文件名（模拟另存为）:', 'document.md');
            if (fileName) {
                window.currentFile = fileName;
                hasUnsavedChanges = false;
                updateTitle();
                alert('文件已另存为（模拟，Tauri API失败）');
            }
        }
    }
    
    async function exportToHtml() {
        try {
            const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${window.currentFile || 'Markdown文档'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; }
    </style>
</head>
<body>
${marked.parse(editor.value)}
</body>
</html>`;
    
            if (window.__TAURI__ && window.__TAURI__.dialog) {
                const { save } = window.__TAURI__.dialog;
                const filePath = await save({
                    filters: [{
                        name: 'HTML',
                        extensions: ['html']
                    }]
                });
                
                if (filePath) {
                    const { writeTextFile } = window.__TAURI__.fs;
                    await writeTextFile(filePath, html);
                    console.log('HTML导出成功');
                }
            } else {
                console.log('Tauri API不可用，模拟导出HTML');
                const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
                a.download = (window.currentFile || 'document').replace('.md', '') + '.html';
    a.click();
    URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('HTML导出失败:', error);
        }
    }
    
    // 工具栏按钮事件
    // 新建文档下拉菜单
    const newBtn = document.getElementById('new-btn');
    const newBlank = document.getElementById('new-blank');
    const newTemplate = document.getElementById('new-template');
    
    if (newBtn) {
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = newBtn.nextElementSibling;
            menu.classList.toggle('show');
        });
    }
    
    if (newBlank) {
        newBlank.addEventListener('click', () => {
            createBlankDocument();
            closeDropdowns();
        });
    }
    
    if (newTemplate) {
        newTemplate.addEventListener('click', () => {
            createWithTemplate();
            closeDropdowns();
        });
    }
    
    // 其他按钮
    console.log('设置按钮事件监听器...');
    console.log('DOM已加载，开始查找按钮元素...');
    
    const openBtn = document.getElementById('open-btn');
    const saveBtn = document.getElementById('save-btn');
    const saveAsBtn = document.getElementById('save-as-btn');
    const syncBtn = document.getElementById('sync-btn');
    const exportBtn = document.getElementById('export-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    console.log('按钮元素查找结果:');
    console.log('openBtn:', openBtn);
    console.log('saveBtn:', saveBtn);
    console.log('saveAsBtn:', saveAsBtn);
    console.log('syncBtn:', syncBtn);
    console.log('exportBtn:', exportBtn);
    console.log('fullscreenBtn:', fullscreenBtn);
    
    // 检查按钮是否可点击
    if (openBtn) {
        console.log('openBtn样式:', window.getComputedStyle(openBtn).pointerEvents);
        console.log('openBtn disabled:', openBtn.disabled);
    }
    
    if (openBtn) {
        console.log('为openBtn设置事件监听器...');
        openBtn.onclick = function(e) {
            console.log('打开文件按钮被点击！');
            e.preventDefault();
            e.stopPropagation();
            try {
                openFile();
            } catch (error) {
                console.error('openFile函数执行错误:', error);
            }
        };
        console.log('打开文件按钮事件监听器已设置');
        
        // 测试事件监听器是否工作
        console.log('测试openBtn点击事件...');
        openBtn.onmousedown = function() {
            console.log('openBtn mousedown事件触发');
        };
  } else {
        console.error('openBtn元素未找到！');
    }
    
    if (saveBtn) {
        saveBtn.onclick = function() {
            console.log('保存文件按钮被点击');
            try {
                saveFile();
            } catch (error) {
                console.error('saveFile函数执行错误:', error);
            }
        };
        console.log('保存文件按钮事件监听器已设置');
    }
    
    if (saveAsBtn) {
        saveAsBtn.onclick = function() {
            console.log('另存为按钮被点击');
            try {
                saveAsFile();
            } catch (error) {
                console.error('saveAsFile函数执行错误:', error);
            }
        };
        console.log('另存为按钮事件监听器已设置');
    }
    
    if (syncBtn) {
        syncBtn.onclick = function() {
            console.log('同步滚动按钮被点击');
            try {
                toggleSyncScroll();
            } catch (error) {
                console.error('toggleSyncScroll函数执行错误:', error);
            }
        };
        console.log('同步滚动按钮事件监听器已设置');
    }
    
    if (exportBtn) {
        exportBtn.onclick = function() {
            console.log('导出按钮被点击');
            try {
                exportToHtml();
            } catch (error) {
                console.error('exportToHtml函数执行错误:', error);
            }
        };
        console.log('导出按钮事件监听器已设置');
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.onclick = function() {
            console.log('全屏按钮被点击');
            try {
                toggleFullscreen();
            } catch (error) {
                console.error('toggleFullscreen函数执行错误:', error);
            }
        };
        console.log('全屏按钮事件监听器已设置');
    }
    
    // 主题切换
    document.getElementById('theme-select')?.addEventListener('change', (e) => {
        const theme = e.target.value;
        if (theme === 'auto') {
            // 自动主题：移除data-theme属性，让CSS媒体查询生效
            document.body.removeAttribute('data-theme');
        } else {
            // 手动主题：设置data-theme属性
            document.body.setAttribute('data-theme', theme);
        }
        localStorage.setItem('markdown-editor-theme', theme);
        
        // 更新highlight.js样式
        updateHighlightTheme(theme);
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', closeDropdowns);
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    createBlankDocument();
                    break;
                case 'o':
                    e.preventDefault();
                    openFile();
                    break;
                case 's':
                    e.preventDefault();
                    if (e.shiftKey) {
                        saveAsFile();
                    } else {
                        saveFile();
                    }
                    break;
                // 撤销重做快捷键已移除
            }
        }
        
        if (e.key === 'F11') {
      e.preventDefault();
            toggleFullscreen();
        }
    });
    
    // 同步滚动事件
    editor.addEventListener('scroll', syncScrollToPreview);
    preview.addEventListener('scroll', syncScrollToEditor);
    
    // Tab 键支持 - 在编辑器中插入制表符而不是切换焦点
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault(); // 阻止默认的焦点切换行为
            
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const value = editor.value;
            
            // 保存当前的编辑器滚动位置
            const savedScrollTop = editor.scrollTop;
            
            if (e.shiftKey) {
                // Shift+Tab: 取消缩进
                // 找到当前行的开始位置
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                const lineEnd = value.indexOf('\n', start);
                const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
                
                // 检查行首是否有制表符或空格
                if (value[lineStart] === '\t') {
                    // 删除行首的制表符
                    editor.value = value.substring(0, lineStart) + value.substring(lineStart + 1);
                    // 调整光标位置
                    const newStart = start > lineStart ? start - 1 : start;
                    editor.selectionStart = editor.selectionEnd = newStart;
                } else if (value.substring(lineStart, lineStart + 4) === '    ') {
                    // 删除行首的4个空格
                    editor.value = value.substring(0, lineStart) + value.substring(lineStart + 4);
                    // 调整光标位置
                    const newStart = start > lineStart + 3 ? start - 4 : lineStart;
                    editor.selectionStart = editor.selectionEnd = newStart;
                }
            } else {
                // Tab: 插入制表符
                editor.value = value.substring(0, start) + '\t' + value.substring(end);
                // 将光标移到制表符之后
                editor.selectionStart = editor.selectionEnd = start + 1;
            }
            
            // 恢复编辑器滚动位置，避免跳转
            editor.scrollTop = savedScrollTop;
            
            // 触发 input 事件以更新预览
            const inputEvent = new Event('input', { bubbles: true });
            editor.dispatchEvent(inputEvent);
        }
    });
    
    // 编辑器输入事件 - 添加防抖机制避免频繁更新预览
    let previewUpdateTimeout = null;
    editor.addEventListener('input', () => {
        markAsChanged();
        
        // 清除之前的定时器
        if (previewUpdateTimeout) {
            clearTimeout(previewUpdateTimeout);
        }
        
        // 延迟更新预览，避免频繁重新渲染
        previewUpdateTimeout = setTimeout(() => {
            updatePreview();
        }, 100);
    });
    
    // 撤销重做历史保存功能已移除
    
    // 加载保存的主题
    const savedTheme = localStorage.getItem('markdown-editor-theme');
    if (savedTheme) {
        if (savedTheme === 'auto') {
            // 自动主题：移除data-theme属性
            document.body.removeAttribute('data-theme');
        } else {
            // 手动主题：设置data-theme属性
            document.body.setAttribute('data-theme', savedTheme);
        }
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
        
        // 初始化highlight.js主题
        updateHighlightTheme(savedTheme);
    } else {
        // 默认主题
        updateHighlightTheme('light');
    }
    
    // 初始化预览
    updatePreview();
    
    // 初始化同步按钮状态
    if (syncBtn) {
        syncBtn.classList.add('active'); // 默认同步状态
    }
    
    // 撤销重做按钮状态初始化已移除
    
    // 保存原始console方法
    const originalLog = console.log;
    const originalError = console.error;
    
    // 添加调试信息到面板
    function addDebugInfo(message) {
        const debugPanel = document.getElementById('debug-panel');
        const debugContent = document.getElementById('debug-content');
        if (debugPanel && debugContent) {
            debugContent.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
            debugPanel.scrollTop = debugContent.scrollHeight;
        }
        // 使用原始console.log避免无限递归
        originalLog(message);
    }
    
    // 显示调试面板
    function showDebugPanel() {
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            debugPanel.style.display = 'block';
        }
    }
    
    // 切换调试面板 (Release版本备用)
    function toggleDebugPanel() {
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            if (debugPanel.style.display === 'none' || debugPanel.style.display === '') {
                debugPanel.style.display = 'block';
            } else {
                debugPanel.style.display = 'none';
            }
        }
    }
    
    // 将函数暴露到全局作用域
    window.toggleDebugPanel = toggleDebugPanel;
    
    // 添加键盘快捷键 Ctrl+Shift+D 显示调试面板
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            showDebugPanel();
        }
    });
    
    // 重写console.log以同时显示在调试面板中
    console.log = function(...args) {
        originalLog.apply(console, args);
        addDebugInfo(args.join(' '));
    };
    
    // 重写console.error以同时显示在调试面板中
    console.error = function(...args) {
        originalError.apply(console, args);
        addDebugInfo('ERROR: ' + args.join(' '));
    };
    
    console.log('Markdown编辑器已初始化');
    addDebugInfo('调试面板已初始化，按 Ctrl+Shift+D 显示/隐藏');
    
    // 检查Tauri API是否可用
    function checkTauriAPI() {
        if (window.__TAURI__) {
            console.log('Tauri API可用');
            if (window.__TAURI__.fs && window.__TAURI__.dialog) {
                console.log('Tauri文件系统API可用');
            } else {
                console.log('Tauri文件系统API不可用，等待加载...');
                // 等待API加载
                setTimeout(checkTauriAPI, 1000);
            }
        } else {
            console.log('Tauri API不可用');
        }
    }
    
    // 延迟检查API
    setTimeout(checkTauriAPI, 2000);
    
    // 设置文件关联事件监听
    setupFileAssociationListener();
});

// 文件关联事件监听
function setupFileAssociationListener() {
    if (window.__TAURI__ && window.__TAURI__.event) {
        console.log('设置文件关联事件监听');
        window.__TAURI__.event.listen('open-file', (event) => {
            console.log('收到文件关联事件:', event.payload);
            if (event.payload && typeof event.payload === 'string') {
                // 设置文件关联标志
                window.hasFileAssociationContent = true;
                hasFileAssociationContent = true;
                console.log('文件关联标志已设置');
                // 延迟执行，确保编辑器已准备好
                setTimeout(() => {
                    console.log('开始调用openFileByPath:', event.payload);
                    openFileByPath(event.payload);
                }, 100);
            }
        }).then(() => {
            console.log('文件关联事件监听器设置成功');
        }).catch((error) => {
            console.error('文件关联事件监听器设置失败:', error);
        });
    } else {
        console.log('Tauri API不可用，等待加载...');
        setTimeout(setupFileAssociationListener, 100);
    }
}
