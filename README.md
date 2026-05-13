# TeamMatch 前端（shixun12_frontend）

TeamMatch 校园组队与互评平台 - 微信小程序前端项目。

> **⚠️ 当前状态（W10）**
> 以下页面均为**静态 Mock 页面**，仅完成了 UI 布局和 Mock 数据的展示逻辑。
> **尚未实现的功能**：页面间跳转、真实接口联调、表单校验的完整覆盖、错误处理、页面美化等。
> 这些内容将在 W10-W13 的联调和优化阶段逐步补全。

---

## 技术栈

- 微信小程序原生框架（未使用第三方框架）
- Mock 数据内联在各页面的 `Page()` 方法中，联调时将替换为 `wx.request` 调用

---

## 项目结构

\`\`\`
├── pages/
│   ├── login/                    # 登录页
│   ├── index/                    # 首页-微信登录入口
│   ├── function-hub/             # 功能选择界面
│   ├── team-requests/            # 组队请求管理
│   ├── project-members/          # 项目成员列表
│   ├── profile/
│   │   ├── edit/                 # 个人档案编辑页
│   │   ├── skills/               # 技能标签选择页
│   │   └── profile/              # 跳转验收的占位 Profile 页面
│   ├── email-verify/             # 邮箱认证页
│   ├── projects/
│   │   ├── list/                 # 项目列表页
│   │   ├── detail/               # 项目详情页
│   │   └── create/               # 发布项目表单
│   └── logs/                     # 占位页
├── utils/
│   ├── util.js                   # 通用工具
│   └── team-service.js           # 组队相关服务
├── docs/
│   └── alignment-T003-token.md   # Token 存储规则对齐记录
├── app.js / app.json / app.wxss  # 全局配置
├── .gitignore
└── readme.md
\`\`\`


---

## M1 已完成页面清单（均为静态 Mock 版本）

| 任务ID | 页面名称 | 文件路径 | 说明 |
|:---|:---|:---|:---|
| T-002 | 登录引导页 | `pages/login/login` | 欢迎页，点击跳转首页进行微信登录 |
| T-006 | 邮箱认证页 | `pages/email-verify/email-verify` | 邮箱输入、验证码发送/校验（Mock: 输入 654321 成功） |
| T-008 | 个人档案编辑页 | `pages/profile/edit/edit` | 昵称、学校、专业、年级、简介表单 |
| T-010 | 技能标签选择页 | `pages/profile/skills/skills` | 按分类展示预置标签，多选后全量替换保存 |
| T-012 | 项目列表页 | `pages/projects/list/list` | 项目卡片列表，包含状态、人数、技能标签 |
| T-014 | 项目详情页 | `pages/projects/detail/detail` | 项目完整信息、成员列表、技能需求 |
| T-016 | 发布项目表单 | `pages/projects/create/create` | 标题、描述、板块、人数、技能、截止日期 |

---

## 待完成内容

以下内容将在 W10-W13 逐步实现：

- [ ] **页面间跳转**：如首页 → 档案页、项目列表 → 项目详情 → 申请加入等
- [ ] **真实接口联调**（T-005/T-007/T-009/T-011/T-013/T-015/T-017）
- [ ] **请求封装**：创建 `utils/request.js`，统一处理 Token 携带、401 拦截
- [ ] **错误处理**：reasonCode 统一提示（T-024）
- [ ] **页面美化**：与 M2 统一 UI 风格，计划引入 WeUI 组件库
- [ ] **搜索/筛选**（T-023）
- [ ] **冷启动榜单/画像页面**（T-018/T-019/T-020）

---

## 本地开发指南

### 环境要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（最新版）
- 一个微信小程序 AppID（测试号即可，不影响开发）

### 使用步骤

1. 克隆本项目到本地：
   \`\`\`bash
   git clone "https://你的学号@gerrit.lilingkun.com/a/shixun12_frontend"
   \`\`\`

2. 打开**微信开发者工具**，点击 **“导入项目”**。

3. 填写项目信息：
   | 字段 | 内容 |
   |:---|:---|
   | 项目名称 | 任意，如 `TeamMatch 前端` |
   | 目录 | 选择克隆后的 `shixun12_frontend` 文件夹 |
   | AppID | 使用你自己的测试号，或从 `project.config.json` 获取 |

4. 点击 **“确定”**，工具会自动加载项目并编译。

5. 如果编译后没有看到期望的页面，可以在顶部工具栏**“编译模式”**中选择要预览的页面路径，例如：
   - `pages/login/login`
   - `pages/projects/list/list`
   - `pages/profile/skills/skills`

6. 开始开发和调试。

---

## Git 提交规范

所有代码需通过 Gerrit 评审后合并：

\`\`\`bash
git add .
git commit -m "feat: 功能描述"
git push origin HEAD:refs/for/master
\`\`\`

提交说明需写清影响范围。