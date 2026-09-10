# Reading Archive · Personal Writing Lab 2.2 — 最终部署方案

## A. 你需要下载的文件

只需要下载：

`Reading-Archive-Personal-Writing-Lab-v2.2-production.zip`

解压后，把**里面的项目文件夹中的全部内容**上传/推送到 GitHub 仓库 `SANMIAO0101/reading-archive` 的 `main` 分支。

不要把 zip 文件本身作为网站文件放进 GitHub；要上传解压后的文件和文件夹。

## B. Vercel 项目设置（解决你当前的 public 报错）

本版本已经采用 `public/` 作为静态输出目录，因此与你截图中的 Vercel Output Directory = `public` 相匹配。

推荐设置：
- Framework Preset：Other
- Root Directory：仓库根目录 `./`
- Build Command：`npm run build`
- Output Directory：`public`
- Install Command：`npm install`

保存后 Redeploy。

构建日志应该出现：

`Reading Archive build OK: public/ output is ready.`

然后不应该再出现：

`No Output Directory named "public" found`

## C. Supabase 一次性配置

1. 新建 Supabase 项目。
2. SQL Editor 执行 `supabase-schema.sql` 全部内容。
3. Authentication 创建你自己的第一个账户。
4. 把自己的 auth user UUID 设置成 admin：

```sql
update profiles set role='admin' where id='你的 auth user uuid';
```

5. Storage 中确认 `private-manuscripts` bucket 存在并且是 Private。SQL 已包含 bucket 创建和对象 RLS。
6. 不要把 Service Role Key 放进前端或 GitHub。

## D. Vercel Environment Variables

设置 Production（必要时同时设置 Preview/Development）：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY`
- `AI_API_URL`（可选）
- `AI_MODEL`

前端 `public/config.js` 只放：
- `supabaseUrl`
- `supabaseAnonKey`
- `demoMode:false`

Anon Key 可以放前端；Service Role Key 和 AI Key 绝不能放前端。

## E. 邀请制

Supabase Authentication 里关闭公开注册（不要允许任何人自行注册）。

开发者账户进入：设置 → 开发者邀请。

邀请码由服务端生成并写入 `invitations`，普通成员不能生成邀请码。

## F. 上传小说的真实保存链路

TXT / DOCX / EPUB
→ Vercel API 接收
→ 解析正文
→ Supabase Private Storage 保存原文件
→ writing_documents 保存元数据
→ document_chunks 保存分析片段
→ analysis_jobs 保存任务状态
→ AI 片段分析
→ 章节级报告
→ 卷级报告
→ 全书级报告

网页不会展开小说正文。

删除上传文档时应同时删除 Storage 原文件和数据库关联记录。

## G. 长篇作品

前端采用任务轮询而不是等待整本书一次请求完成。任务分批处理 chunk，并保存 progress。

如果后续需要真正无人值守（即关闭浏览器后仍继续分析），建议把 `process-analysis-job` 进一步迁移到 Supabase Edge Function + Scheduler/Queue；Vercel 轮询版适合当前第一阶段生产使用。

## H. 最后检查清单

- [ ] GitHub 已上传解压后的全部项目文件
- [ ] `public/index.html` 存在
- [ ] `public/styles.css` 存在
- [ ] `public/app.js` 存在
- [ ] `public/config.js` 已填写 Supabase URL/Anon Key
- [ ] Vercel Output Directory = `public`
- [ ] `npm run build` 成功
- [ ] Supabase SQL 已执行
- [ ] 第一个用户已设为 admin
- [ ] Storage bucket 为 Private
- [ ] Vercel 已设置 Service Role Key
- [ ] Vercel 已设置 AI Key
- [ ] Supabase 关闭公开注册
- [ ] 用邀请码创建第二个测试成员
- [ ] 测试 TXT / DOCX / EPUB 上传
- [ ] 测试文档删除后 Storage 文件是否同步删除

