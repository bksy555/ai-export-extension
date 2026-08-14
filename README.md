# AI Export Assistant 🚀

一键导出 ChatGPT、Claude、DeepSeek、Gemini 聊天记录为 Markdown、Word、PDF。

## 安装

### 从 Chrome Web Store 安装（开发中）
*待发布*

### 开发者模式安装

1. 下载或克隆本项目
2. 打开 Chrome → `chrome://extensions/`
3. 开启右上角 **开发者模式**
4. 点击 **"加载已解压的扩展程序"** → 选择本项目目录
5. ✅ 安装成功

## 使用

### 自动抓取（推荐）
1. 打开任一 AI 对话页面
2. 点击浏览器右上角的插件图标 🚀
3. 检查预览是否正确
4. 选择导出格式：**Markdown** / **Word** / **PDF**
5. 文件自动下载 🎉

### 手动选择（当自动抓取失败时）
1. 点击插件图标 → 提示无法检测到对话
2. 点击 **✋ Manual Select** 按钮
3. 页面出现工具栏，点击 **✋ Pick** 进入选择模式
4. 鼠标点击对话元素（高亮蓝色），选中后变绿色
5. 点击 **✅ Done** 完成选择
6. 再次点击插件图标，选中的内容即可导出

## 功能

| 功能 | 免费版 | 完整版 |
|------|--------|--------|
| 导出 Markdown | ✅ 5次 | ✅ 无限 |
| 导出 Word (.doc) | ✅ 5次 | ✅ 无限 |
| 导出 PDF (.html) | ✅ 5次 | ✅ 无限 |
| 复制到剪贴板 | ✅ | ✅ |
| 对话预览 | ✅ | ✅ |
| 手动选择模式 | ✅ | ✅ |
| 调试模式 | ✅ | ✅ |
| 多平台支持 | ✅ 10+平台 | ✅ 10+平台 |
| 无限制导出 | ❌ | ✅ $9.9 |

## 支持平台

| 平台 | 网址 | 状态 |
|------|------|------|
| 🤖 **ChatGPT** | chatgpt.com | ✅ |
| 🟣 **Claude** | claude.ai | ✅ |
| 🔵 **DeepSeek** | chat.deepseek.com | ✅ |
| ✨ **Gemini** | gemini.google.com | ✅ |
| 🌐 **通义千问** | tongyi.aliyun.com | ✅ |
| 📕 **Kimi** | kimi.moonshot.cn | ✅ |
| 🟢 **豆包** | doubao.com | ✅ |
| 📖 **文心一言** | yiyan.baidu.com | ✅ |
| 🔍 **Perplexity** | perplexity.ai | ✅ |

## 项目结构

```
ai-export-extension/
├── manifest.json             # 扩展配置
├── icons/                    # 图标
├── popup/
│   ├── popup.html           # 弹出窗口
│   ├── popup.js             # 弹出逻辑
│   └── popup.css            # 样式
├── content/
│   └── content.js           # 内容脚本（对话抓取）
├── background/
│   └── service-worker.js    # 后台服务
├── lib/
│   ├── markdown.js          # Markdown 导出库
│   ├── word-export.js       # Word 导出库
│   ├── pdf-export.js        # PDF 导出库
│   └── license.js           # License 管理
├── options/
│   ├── options.html         # 设置页面
│   └── options.js           # 设置逻辑
└── _locales/                # 国际化
```

## 授权

完整版 $9.9（一次性购买），通过 Lemon Squeezy 授权验证。

首次安装享受 5 次免费导出，之后需购买授权码解锁无限使用。

## 开发

```bash
# 安装依赖
npm install

# 构建（生成 dist/ 目录）
npm run build

# 打包为 .zip
npm run package
```

## License

Proprietary. See LICENSE file.