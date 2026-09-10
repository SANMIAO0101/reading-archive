# Reading Archive · Personal Writing Lab — Production Build

## 1. 这版修复了什么

- 修复主内容被左侧固定栏遮挡/横向溢出的布局问题：主栏宽度、page-head grid、overflow-x 均重新处理。
- 首页五个“我的写作档案”数据全部是真正按钮：阅读记录、摘抄片段、写作练习、完成练习、我的作品。
- 成长档案三个数据卡片可跳转。
- 能力变化每一条都是可点击历史档案；掌握度统一使用 0–5 实体星星。
- 文笔技巧库每个技巧都能进入训练历史。
- 仿写练习支持进入、编辑、删除、AI 点评。
- 原创作品支持编辑、删除、保存、AI 分析。
- 上传作品支持 TXT / DOCX / EPUB；页面不展开正文。
- 上传文档支持编辑分析重点、重新分析、查看完整报告、删除。
- 设置里的“AI 教练”是有效卡片，并能直接跳转“已上传文档”。
- 上传作品的 AI 流程按“切块 → 片段事实 → 人物/关系 → 剧情 → 伏笔 → 悬念 → 钩子 → 技法 → 总编 → 完整报告”设计。
- 分析报告支持章节级 / 卷级 / 全书级三个层次。

## 2. Demo 与 Cloud

默认 `config.js` 为 Demo 模式，数据保存在浏览器 localStorage，方便直接打开测试 UI。

正式使用：

1. 创建 Supabase 项目。
2. 执行 `supabase-schema.sql`。
3. 在 Storage 创建 PRIVATE bucket：`private-manuscripts`。
4. 配置 Storage policies，只允许用户访问自己的 UUID 文件夹。
5. 填写 `config.js`：`supabaseUrl`、`supabaseAnonKey`、`demoMode:false`。
6. 关闭 Supabase 公共注册；账号只由管理员邀请。
7. 第一个管理员在 `profiles.role` 设为 `admin`。

## 3. AI

AI 密钥绝不能写入 `app.js`、`config.js` 或 GitHub。

生产环境应只放在 Vercel Environment Variables：

- `AI_API_KEY`
- `AI_API_URL`（可选）
- `AI_MODEL`
- 以及备用 provider keys

## 4. 长篇作品分析

生产推荐任务结构：

上传 → Private Storage → writing_documents → document_chunks → analysis_jobs → 章节级报告 → 卷级报告 → 全书报告。

前端只轮询任务状态，不等待整本小说一次请求完成。这样几十万字作品可以分批处理，失败可以从某个 chunk 继续，而不需要重新上传。

## 5. 注意

当前压缩包包含完整 UI、Demo 数据、生产数据库蓝图和 AI API 原型。真正 Cloud 模式必须完成 Supabase 配置后才能跨设备保存数据；没有真实项目密钥时不能声称已经连接到云数据库。

## 6. 第一个开发者管理员

首次建立项目后，先创建你自己的 Supabase Auth 用户，然后在 SQL Editor 执行：

```sql
update profiles set role='admin' where id='你的 auth user uuid';
```

之后进入网站“设置 → 开发者邀请”，邀请码由 `/api/create-invite` 服务端生成，不能靠修改浏览器 localStorage 绕过。

## 7. 数据删除

普通数据删除会通过 RLS 限制在当前用户自己的记录。上传文档删除时，客户端同时删除 Private Storage 原文件；数据库上的 document_chunks / document_reports / analysis_jobs 会因 `on delete cascade` 一并清理。
