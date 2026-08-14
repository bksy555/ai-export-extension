# AI Export Assistant — 产品启动指南

以下是你从代码到赚钱的完整步骤。

## 📋 启动清单

### 第1步：测试（30分钟）

1. 打开 `chrome://extensions/` → 开启开发者模式 → 加载 `ai-export-extension/` 目录
2. 按照 `TESTING.md` 逐项测试
3. 用 `test/test.html` 快速验证基础功能（无需登录任何AI平台）
4. **修复发现的 bug**

### 第2步：设置 Gumroad（30分钟）

1. 注册 [Gumroad](https://gumroad.com/) 账号（邮箱即可，国家选 China）
2. 创建产品（参考 `gumroad-listing.md` 文案）：
   - 名称：**AI Export Assistant — Lifetime License**
   - 价格：**$9.9 USD**（一次性）
   - 类型：**Digital product**
   - ⚠️ 关键：打开 **"Generate License Keys"**（买家付款后自动收到激活码）
3. 复制 **Product ID**：
   - 打开产品编辑页，URL 类似 `https://app.gumroad.com/products/<PRODUCT_ID>/edit`
   - 复制 `<PRODUCT_ID>` 部分
4. 复制你的产品购买链接（类似 `https://gumroad.com/l/XXXXXX`）
5. 替换代码中的占位符：
   - `background/service-worker.js` → `YOUR_GUMROAD_PRODUCT_ID`
   - `lib/license.js` → `YOUR_GUMROAD_PRODUCT_ID` 和 `storeUrl`
   - `options/options.js` → `PURCHASE_URL`（你的 Gumroad 购买链接）
   - `options/options.html` → 购买链接
   - `landing/index.html` → 购买链接
6. 重新加载扩展，用一个真实购买测试激活（可以先给自己买个 $9.9 测试，或用 Gumroad 测试模式）

### 第3步：绑定 PayPal 提现

1. Gumroad → Settings → Payments
2. 绑定你的 **PayPal** 账号
3. Gumroad 每周五自动结算到 PayPal
4. PayPal 提现到国内银行卡（或绑定国内储蓄卡/信用卡消费）

### 第4步：上架 Chrome Web Store（1-2天）

1. 注册 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. 支付 $5 一次性注册费
3. 创建新项目：
   - 名称：**AI Export Assistant**
   - 描述：使用 `store-listing.md` 中的文案
   - 图标：替换 `icons/` 目录为正式图标（至少 128x128）
   - 截图：至少 4 张 1280x800 截图
4. 上传 `dist/ai-export-assistant-v1.0.zip`（先 `npm run package`）
5. 提交审核（通常 1-2 天通过）

### 第5步：部署 Landing Page（30分钟）

部署 `landing/index.html` 到：
- **GitHub Pages**：免费，适合技术用户
- **Vercel / Netlify**：免费，支持自定义域名
- **自己的服务器**：需要 Nginx / Apache

### 第6步：营销推广

| 渠道 | 方式 | 成本 |
|------|------|------|
| Product Hunt | 发布产品 | 免费 |
| Twitter/X | 分享使用视频 | 免费 |
| Reddit | r/SideProject, r/chrome_extensions | 免费 |
| 知乎/小红书 | 写使用教程 | 免费 |
| Hacker News | Show HN | 免费 |
| 付费广告 | Google Ads 定向"AI tools" | $50-200/月 |

### 第7步：定价策略

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

**实际到手估算（Gumroad 10% + $0.5/单，PayPal 提现费）**：
- 每单 $9.9 → Gumroad 抽 $1.49 → 到手 $8.41
- PayPal 提现到国内卡约 1.5-2% 手续费 → 实收约 $8.2（约 ¥59）

## ⚠️ 注意事项

1. **隐私合规**：必须在 Chrome Web Store 描述中声明数据本地处理
2. **更新频率**：AI 平台经常改版，需定期更新选择器
3. **用户支持**：准备 FAQ 和邮件支持
4. **退款政策**：Gumroad 默认允许买家 30 天内退款，注意处理
5. **License 设备数**：当前为简单验证，如需严格限制设备数可升级自建验证服务器

## 🔧 需要替换的占位符

搜索代码中的 `YOUR_` 开头的值：

```
grep -r "YOUR_" ai-export-extension/ --include="*.js" --include="*.html"
```

需要替换的包括：
- Gumroad Product ID（`YOUR_GUMROAD_PRODUCT_ID`）
- Gumroad 购买链接 URL（`YOUR_PRODUCT_PERMALINK`）
- 联系邮箱
- GitHub 仓库地址

---

**祝你大卖！🚀**