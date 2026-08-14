# AI Export Assistant — 产品启动指南

以下是你从代码到赚钱的完整步骤。

## 📋 启动清单

### 第1步：测试（30分钟）

1. 打开 `chrome://extensions/` → 开启开发者模式 → 加载 `ai-export-extension/` 目录
2. 按照 `TESTING.md` 逐项测试
3. 用 `test/test.html` 快速验证基础功能（无需登录任何AI平台）
4. **修复发现的 bug**

### 第2步：设置 Lemon Squeezy（1小时）

1. 注册 [Lemon Squeezy](https://lemonsqueezy.com/) 账号
2. 创建产品：
   - 名称：**AI Export Assistant**
   - 价格：**$9.9 USD**（一次性）
   - 类型：**License Key**
3. 复制 Product ID
4. 替换代码中的占位符：
   - `background/service-worker.js` → `YOUR_PRODUCT_ID`
   - `lib/license.js` → `YOUR_PRODUCT_ID`
   - `lib/license.js` → `storeUrl`（你的购买链接）
   - `options/options.html` → 购买链接

### 第3步：上架 Chrome Web Store（1-2天）

1. 注册 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. 支付 $5 一次性注册费
3. 创建新项目：
   - 名称：**AI Export Assistant**
   - 描述：使用 `store-listing.md` 中的文案
   - 图标：替换 `icons/` 目录为正式图标（至少 128x128）
   - 截图：至少 4 张 1280x800 截图
4. 上传 `dist/ai-export-assistant-v1.0.zip`
5. 提交审核（通常 1-2 天通过）

### 第4步：部署 Landing Page（30分钟）

部署 `landing/index.html` 到：
- **GitHub Pages**：免费，适合技术用户
- **Vercel / Netlify**：免费，支持自定义域名
- **自己的服务器**：需要 Nginx / Apache

### 第5步：营销推广

| 渠道 | 方式 | 成本 |
|------|------|------|
| Product Hunt | 发布产品 | 免费 |
| Twitter/X | 分享使用视频 | 免费 |
| Reddit | r/SideProject, r/chrome_extensions | 免费 |
| 知乎/小红书 | 写使用教程 | 免费 |
| Hacker News | Show HN | 免费 |
| 付费广告 | Google Ads 定向"AI tools" | $50-200/月 |

### 第6步：定价策略

| 方案 | 价格 | 说明 |
|------|------|------|
| 免费版 | $0 | 5次导出，用于口碑传播 |
| 完整版 | $9.9 | 无限导出，目标用户群 |
| 限时折扣 | $4.9 | 首发优惠，快速获客 |

## 💰 收入预期

| 阶段 | 用户数 | 转化率 | 月收入 |
|------|--------|--------|--------|
| 第1个月 | 1,000 安装 | 2% | $198 |
| 第3个月 | 5,000 安装 | 3% | $1,485 |
| 第6个月 | 15,000 安装 | 4% | $5,940 |

## ⚠️ 注意事项

1. **隐私合规**：必须在 Chrome Web Store 描述中声明数据本地处理
2. **更新频率**：AI 平台经常改版，需定期更新选择器
3. **用户支持**：准备 FAQ 和邮件支持
4. **退款政策**：30天无条件退款，提高转化率

## 🔧 需要替换的占位符

搜索代码中的 `YOUR_` 开头的值：

```
grep -r "YOUR_" ai-export-extension/ --include="*.js" --include="*.html"
```

需要替换的包括：
- Lemon Squeezy Product ID
- 购买链接 URL
- 联系邮箱
- GitHub 仓库地址

---

**祝你大卖！🚀**