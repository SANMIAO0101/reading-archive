# Reading Archive · Personal Writing Lab v3.0

v3.0 是 v2.x 的生产升级包，保留原有编辑式 Archive UI，同时重点处理安全、真实章节/卷分析、原创能力评分、队列与长期备份。

## 已升级

- **P0 权限修复**：普通成员不能把自己的 `profiles.role` 改成 admin；浏览器同步 profile 时不再写 role。
- **邀请码并发安全**：`claim_invitation()` 使用数据库行锁，避免同一邀请码被同时兑换。
- **移除旧未授权 AI 入口**：v3 不再包含旧 `/api/analyze-work.js`。
- **TXT / DOCX / EPUB 章节识别**：TXT/DOCX 使用章节标题识别；EPUB 使用 OPF spine 保留章节文件边界。
- **三级故事分析**：chunk 事实 → 章节报告 → 卷报告（每 10 章）→ 全书总编报告。
- **原创作品 AI 评分**：10 项能力 0–5 分写入 `training_records`，并滚动更新 `skill_profiles`。
- **后台队列**：保留浏览器轮询，同时提供 Vercel Cron `/api/process-analysis-queue`，浏览器关闭后可继续推进。
- **私有原稿**：上传文件由服务端进入 Supabase Private Storage；页面不展示原文。
- **AI Provider**：OpenAI-compatible、OpenAI、Gemini、Grok/xAI；密钥仅服务端环境变量。
- **生产默认非 Demo**：`public/config.js` 默认 `demoMode:false`。
- **备份**：设置页增加个人档案 JSON 导出。

## 部署

### A. 新建 Supabase 项目
执行 `supabase-schema.sql`。

### B. 已有 v2.x 数据库
执行 `supabase-v3-migration.sql`，再部署 v3。

### C. Auth
关闭公开注册。账号只能由管理员通过邀请码创建。第一个管理员由项目拥有者设置：

```sql
update profiles set role='admin' where id='管理员用户UUID';
```

### D. Vercel 环境变量

必填：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY` + `AI_API_URL` + `AI_MODEL`（或直接配置 OPENAI/GEMINI/XAI）
- `CRON_SECRET`

可选：`OPENAI_API_KEY`、`GEMINI_API_KEY`、`XAI_API_KEY`、`AI_JOB_BATCH`、`AI_CHUNK_MAX_CHARS`。

**绝对不要**把 service role key / AI key 写进前端、GitHub 或 `config.js`。

### E. 前端配置
编辑 `public/config.js`：

```js
window.RA_CONFIG = {
  supabaseUrl: 'https://你的项目.supabase.co',
  supabaseAnonKey: '你的 anon/publishable key',
  demoMode: false,
  appVersion: '3.0.0'
};
```

### F. Vercel
Build Command：`npm run build`。输出目录已固定为 `public`，解决之前的 `No Output Directory named "public"` 问题。

## AI 长篇分析

建议 `AI_JOB_BATCH=2~3`。每次任务只处理有限 chunk，避免单次函数超时。Vercel Cron 每 5 分钟尝试处理一个任务；用户打开网页时也会继续轮询。

如果作品达到几十万字甚至百万字，建议后续把任务层升级到专用 Workflow/Queue，并在分析完成后清理 `document_chunks.analysis.raw_chunk`，避免数据库膨胀。

## 长期数据安全

- GitHub 仓库建议设为 Private。
- Supabase Storage 必须保持 `private-manuscripts` 为 Private。
- 定期使用设置页导出 JSON，并另外备份 Supabase 数据库与 Storage。
- 为 AI provider 设置费用/额度告警。
- 不要在 localStorage 中保存生产密码、AI Key 或 service role key。
