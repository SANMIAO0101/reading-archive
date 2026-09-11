# v3.0.1 生产部署清单

1. Supabase 执行 `supabase-schema.sql`。
2. Authentication 关闭公开注册。
3. 第一个管理员账号建立后，将其 profile role 设置为 admin。
4. Vercel 配置 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、至少一个 AI provider key、`CRON_SECRET`。
5. `public/config.js` 填入 Supabase URL + anon/publishable key，并保持 `demoMode:false`。
6. GitHub 仓库建议设为 Private。
7. 部署后测试：登录、邀请码兑换、普通成员不可生成邀请码、上传 TXT/DOCX/EPUB、章节/卷/全书报告、原创 AI 评分、技能历史、删除文档时原稿是否一并删除。
8. 如果使用 Vercel Hobby，Cron 频率/能力可能受计划限制；网页端轮询仍可推进分析。
9. 不要把任何 service role key、AI key 放进前端或 GitHub。
