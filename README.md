# TeamMatch 前端（teammatch-frontend）

TeamMatch 校园组队与互评平台的前端代码，包含两个子项目：

- `miniprogram/`：微信小程序用户端（微信原生框架，未使用第三方框架）
- `admin-web/`：Vue 3 + Element Plus 管理后台（Vite 构建）

---

## 当前状态

> 本节依据仓库代码整理，功能的完成度以代码为准。

- **小程序**：`app.json` 注册了 33 个页面，底部 tabBar 包含 `index`、`team-center`、`credit-center`、`my-center` 四个页面。`utils/api-service.js` 为统一请求封装（基于 `wx.request`，携带 Bearer Token，按统一响应码处理）；`utils/team-service.js` 封装了组队、互评、信誉、举报、申诉等接口。
- **请求模式**：两个文件中的 `USE_MOCK` 默认为 `false`，即默认请求后端。在 `api-service.js` 中设为 `true` 后，经该模块的请求改走本地 `MOCK_MAP`。`team-service.js` 直接调用 `wx.request`，不经过该开关（其中同名变量当前未被引用）。
- **管理后台**：已有登录、板块管理、板块项目、举报处理、申诉处理、评价复核、处罚管理等页面，接口统一以 `/api` 为前缀（开发环境由 Vite 代理到后端）。「信誉分审计」路由目前为占位页。
- **未使用**：小程序端目前未引入 WeUI 等第三方组件库。

---

## 技术栈

- 小程序：微信小程序原生框架（见 `miniprogram/app.json`、`miniprogram/project.config.json`）
- 管理后台：Vue 3、Vue Router 4、Element Plus、Axios、Vite 5（见 `admin-web/package.json`）

---

## 项目结构

```
├── miniprogram/                     # 微信小程序（用户端）
│   ├── pages/                       # 页面（已在 app.json 中注册）
│   ├── utils/
│   │   ├── api-service.js           # 统一请求封装（Token、响应码、Mock 开关）
│   │   ├── team-service.js          # 组队 / 互评 / 信誉 / 举报 / 申诉等接口
│   │   ├── util.js                  # 通用工具
│   │   └── render-fix.wxss
│   ├── docs/                        # 对齐记录文档
│   ├── app.js / app.json / app.wxss
│   ├── project.config.json          # 微信开发者工具项目配置
│   └── sitemap.json
├── admin-web/                       # Vue 3 管理后台
│   ├── src/
│   │   ├── api/                     # 按业务模块封装的接口
│   │   ├── components/ composables/
│   │   ├── router/                  # 路由（meta.title 为页面标题）
│   │   ├── utils/request.js         # axios 实例（baseURL: /api）
│   │   └── views/                   # 页面
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
├── M2后端接口对照.md                  # M2 阶段后端接口对照
├── M2admin管理后台后端接口对照.md       # 管理后台接口对照
├── package.json                     # 根目录仅声明 sharp 开发依赖
├── package-lock.json
└── README.md
```

### 小程序页面（app.json 注册，共 33 个）

```
login/login                  index/index                  function-hub/function-hub
team-center/index            credit-center/index          my-center/my-center
profile/profile              profile/edit/edit            profile/skills/skills
profile-auth/profile-auth    profile-claim/profile-claim  email-verify/email-verify
agreement/user-agreement/user-agreement                   agreement/privacy-policy/privacy-policy
projects/list/list           projects/detail/detail       projects/create/create
initiate-vote/initiate-vote  vote-management/vote-management
team-requests/team-requests  project-members/project-members  member-match/member-match
exit-project/exit-project    exit-vote-detail/exit-vote-detail
evaluation-list/evaluation-list  evaluation/evaluation    credit-history/credit-history
leaderboard/leaderboard      report/report                appeal/appeal
my-reports/my-reports        my-appeals/my-appeals        logs/logs
```

---

## 本地开发

### 小程序（miniprogram/）

1. 安装并打开[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（最新版）。
2. 点击「导入项目」，项目目录选择仓库中的 `miniprogram/` 文件夹（不是仓库根目录）。
3. AppID 在 `miniprogram/project.config.json` 的 `appid` 字段中配置，可使用测试号或自己的 AppID。
4. 后端地址为 `utils/api-service.js` 与 `utils/team-service.js` 中的 `BASE_URL`。`api-service.js` 中注释掉的 `http://localhost:8080/api` 为本地联调示例。
5. 更多对接说明见 `miniprogram/docs/` 下的相关文档。

### 管理后台（admin-web/）

```bash
cd admin-web
npm install
npm run dev        # 开发服务器（端口 5173），/api 代理到 vite.config.js 中配置的后端
npm run build      # 生产构建
npm run preview    # 预览构建结果
```

---

## 相关文档

| 文件 | 说明 |
|:---|:---|
| `miniprogram/docs/alignment-T003-token.md` | T-003：Token 存取与携带约定 |
| `miniprogram/docs/T-036-对齐记录.md` | T-036：状态字段对齐记录 |
| `M2后端接口对照.md` | M2 阶段后端接口对照 |
| `M2admin管理后台后端接口对照.md` | 管理后台接口对照 |

---

## 里程碑页面记录

> 以下内容写于 W10，描述的是当时的页面清单，具体实现状态以代码为准。

### M1 页面清单

| 任务ID | 页面名称 | 文件路径 | 说明 |
|:---|:---|:---|:---|
| T-002 | 登录引导页 | `pages/login/login` | 欢迎页，点击跳转首页进行微信登录 |
| T-006 | 邮箱认证页 | `pages/email-verify/email-verify` | 邮箱输入、验证码发送/校验 |
| T-008 | 个人档案编辑页 | `pages/profile/edit/edit` | 昵称、学校、专业、年级、简介表单 |
| T-010 | 技能标签选择页 | `pages/profile/skills/skills` | 按分类展示预置标签，多选后全量替换保存 |
| T-012 | 项目列表页 | `pages/projects/list/list` | 项目卡片列表，包含状态、人数、技能标签 |
| T-014 | 项目详情页 | `pages/projects/detail/detail` | 项目完整信息、成员列表、技能需求 |
| T-016 | 发布项目表单 | `pages/projects/create/create` | 标题、描述、板块、人数、技能、截止日期 |

### M2 页面清单

| 任务ID | 页面名称 | 文件路径 | 说明 |
|:---|:---|:---|:---|
| T-031 | 组队请求页 | `pages/team-requests/team-requests` | 收到/发出请求列表，状态标签，操作按钮 |
| T-032 | 项目成员列表 | `pages/project-members/project-members` | 角色标签、ACTIVE/EXITED、Trust 分、退出原因 |
| T-033 | 请求列表联调准备 | `pages/team-requests/team-requests` | Service 层封装，加载/错误/空状态 |
| T-034 | 接受/拒绝/取消联调 | `pages/team-requests/team-requests` | 防重复点击，操作 loading 状态 |
| T-035 | 成员列表联调 | `pages/project-members/project-members` | Service 层接入，加载/错误/空状态 |
| T-036 | 状态字段对齐 | `miniprogram/docs/T-036-对齐记录.md` | 与 M4 对齐记录文档 |
| T-037 | 成员主动退出页 | `pages/exit-project/exit-project` | 退出原因、确认弹窗、扣分提示 |
| T-038 | 退出投票详情页 | `pages/exit-vote-detail/exit-vote-detail` | 倒计时、票数统计、投票按钮（曾出现 timeout，见已知问题） |
| T-039 | 退出投票联调 | `pages/exit-vote-detail/exit-vote-detail` | Service 层真实接口预留 |
| T-040 | 互评页 | `pages/evaluation/evaluation` | 四维评分、标签选择、技能点赞 |
| T-041 | 互评资格/提交联调 | `pages/evaluation/evaluation` | 资格校验、错误码处理 |
| T-042 | 信誉分变化记录页 | `pages/credit-history/credit-history` | 当前分数总览、变化流水列表 |
| T-043 | 举报入口页 | `pages/report/report` | 类型选择、对象搜索、原因标签 |
| T-044 | 申诉入口页 | `pages/appeal/appeal` | 评价/处罚申诉、对象选择 |
| T-045 | 举报申诉联调 | `pages/report/report`、`pages/appeal/appeal` | Service 层完善，My List 接口预留 |

### M2 Service 层主要方法（`utils/team-service.js`）

以下为 M2 阶段梳理的主要方法，`team-service.js` 中已导出更多方法，以代码为准。

| 方法 | 用途 |
|------|------|
| `getRequests(type)` | 获取组队请求列表 |
| `acceptRequest(id)` | 接受请求 |
| `rejectRequest(id)` | 拒绝请求 |
| `cancelRequest(id)` | 取消请求 |
| `getMembers(projectId)` | 获取项目成员 |
| `selfExit(projectId, reason)` | 主动退出 |
| `getExitVoteDetail(voteId)` | 获取退出投票详情 |
| `submitExitVote(voteId, choice)` | 提交投票 |
| `closeExitVote(voteId)` | 关闭投票 |
| `checkEvaluationEligibility(projectId, targetUserId)` | 检查互评资格 |
| `submitEvaluation(params)` | 提交互评 |
| `getCurrentCreditScore()` | 获取当前信誉分 |
| `getCreditHistory()` | 获取信誉变化记录 |
| `submitReport(params)` | 提交举报 |
| `getMyReports()` | 获取我的举报列表 |
| `getAppealTargets(type)` | 获取可申诉对象 |
| `submitAppeal(params)` | 提交申诉 |
| `getMyAppeals()` | 获取我的申诉列表 |

---

## 待完成内容

> 写于 W10，现状以代码为准。

- 管理后台「信誉分审计」页面（当前为占位页）
- 小程序页面美化与组件库统一（原计划引入 WeUI，当前代码中未引用）
- `exit-vote-detail` 的 timeout 问题（见下方已知问题）
- 搜索/筛选、冷启动榜单与画像等 W10 时期的待办，完成情况以代码为准

---

## 已知问题

| 问题 | 影响范围 | 状态 |
|------|----------|------|
| `exit-vote-detail` 曾出现 `Error: timeout` | 退出投票详情页 | W10 时记录为待修复，当前以代码为准 |
| 部分页面文件中仍保留 Mock 相关代码 | 小程序 | 默认请求后端（`USE_MOCK` 默认为 `false`），以代码为准 |

---

## 提交规范

提交说明需写清影响范围，格式参考历史提交，例如：`feat: 功能描述`、`fix(frontend): 问题描述`。

原团队使用 Gerrit 进行评审（`git push origin HEAD:refs/for/master`），本公开副本不包含 Gerrit 远程配置。

---

## 仓库说明

- 本仓库为团队共同开发项目的公开副本。
- 历史提交中的密钥已按规则替换为 `<REDACTED>`（按规则扫描，未检出需替换的内容）。
- 提交者邮箱已匿名化（统一为 GitHub noreply 地址或匿名占位地址）。
- 如需完整开发记录，请联系团队成员。
