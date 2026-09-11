# Reading Archive v3.0.1 · Vercel + Supabase 部署

## 1. Supabase

- 新项目：执行 `supabase-schema.sql`
- v2.x 老项目：先执行 `supabase-v3-migration.sql`
- Storage bucket `private-manuscripts` 必须为 Private
- Authentication 关闭公开注册
- 第一个管理员：建立账号后执行 `update profiles set role='admin' where id='UUID';`

## 2. Vercel Environment Variables

设置：

`SUPABASE_URL`
`SUPABASE_SERVICE_ROLE_KEY`
`AI_API_KEY`
`AI_API_URL`
`AI_MODEL`
`CRON_SECRET`

可选：`OPENAI_API_KEY`、`GEMINI_API_KEY`、`XAI_API_KEY`。

## 3. 前端

编辑 `public/config.js`，填入 Supabase URL 与 anon/publishable key，保持 `demoMode:false`。

## 4. Build

Build Command：`npm run build`
Output Directory：`public`

项目已经在 `vercel.json` 固定 outputDirectory 为 `public`。

## 5. 生产验收

- [ ] 未登录不能进入主界面
- [ ] 普通成员不能生成邀请码
- [ ] 普通成员不能把 profile role 改成 admin
- [ ] 邀请码并发兑换不会生成两个账号
- [ ] TXT / DOCX / EPUB 上传成功
- [ ] 页面不展开原稿正文
- [ ] 章节 / 卷 / 全书报告均可查看
- [ ] 原创作品 AI 评分会写入训练记录和能力档案
- [ ] 删除文档会删除 Private Storage 原稿
- [ ] Vercel Cron 能推进队列
