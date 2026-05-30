<template>
  <div class="projects-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/board' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/board' }">板块管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ boardName }} 的项目</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="projects-header">
      <div class="projects-header-left">
        <h1 class="page-title">{{ boardName }}</h1>
        <p class="page-subtitle">板块下的所有项目，共 {{ projectList.length }} 个</p>
      </div>
    </div>

    <div class="table-card">
      <el-table :data="projectList" stripe border class="projects-table" header-cell-class-name="table-header-cell">
        <template #empty>
          <el-empty description="该板块暂无项目" :image-size="80" />
        </template>
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="leader" label="队长" width="120" />
        <el-table-column prop="memberCount" label="成员数" width="100" align="center" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', row.status === 'active' ? 'status-active' : 'status-done']">
              {{ row.status === 'active' ? '进行中' : '已结束' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="140" align="center">
          <template #default="{ row }">
            <span class="cell-date">{{ row.createdDate }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const boardName = computed(() => {
  const name = route.query.name || '未知板块'
  return name
})

const boardId = computed(() => parseInt(route.params.id) || 0)

// ===== Mock 项目数据 =====
const allProjects = {
  1: [
    { id: 101, name: '校园失物招领小程序', leader: '张明远', memberCount: 5, status: 'active', createdDate: '2024-03-20' },
    { id: 102, name: '在线选课系统', leader: '李晓华', memberCount: 4, status: 'active', createdDate: '2024-04-05' },
    { id: 103, name: '学生社团管理平台', leader: '王志坚', memberCount: 6, status: 'done', createdDate: '2024-02-15' },
    { id: 104, name: '校园二手交易', leader: '张明远', memberCount: 3, status: 'active', createdDate: '2024-05-01' },
    { id: 105, name: '课表生成器', leader: '陈思雨', memberCount: 4, status: 'active', createdDate: '2024-04-20' },
    { id: 106, name: '在线考试系统', leader: '李晓华', memberCount: 5, status: 'done', createdDate: '2024-01-10' },
    { id: 107, name: '校园地图导航', leader: '赵宇航', memberCount: 3, status: 'active', createdDate: '2024-05-15' },
    { id: 108, name: '图书管理借阅', leader: '王志坚', memberCount: 4, status: 'active', createdDate: '2024-03-01' },
    { id: 109, name: '自习室预约系统', leader: '张明远', memberCount: 5, status: 'active', createdDate: '2024-04-10' },
    { id: 110, name: '校园论坛', leader: '陈思雨', memberCount: 6, status: 'active', createdDate: '2024-02-20' },
    { id: 111, name: '成绩管理系统', leader: '李晓华', memberCount: 3, status: 'done', createdDate: '2024-01-25' },
    { id: 112, name: '活动报名平台', leader: '赵宇航', memberCount: 4, status: 'active', createdDate: '2024-05-08' },
  ],
  2: [
    { id: 201, name: 'API 网关服务', leader: '王志坚', memberCount: 4, status: 'active', createdDate: '2024-03-18' },
    { id: 202, name: '用户认证中心', leader: '张明远', memberCount: 3, status: 'active', createdDate: '2024-04-02' },
    { id: 203, name: '数据同步中间件', leader: '李晓华', memberCount: 5, status: 'done', createdDate: '2024-02-10' },
    { id: 204, name: '消息推送服务', leader: '陈思雨', memberCount: 4, status: 'active', createdDate: '2024-04-22' },
    { id: 205, name: '日志收集分析', leader: '赵宇航', memberCount: 3, status: 'active', createdDate: '2024-05-05' },
    { id: 206, name: '分布式任务调度', leader: '张明远', memberCount: 4, status: 'done', createdDate: '2024-01-15' },
    { id: 207, name: '文件存储服务', leader: '王志坚', memberCount: 5, status: 'active', createdDate: '2024-03-28' },
    { id: 208, name: '配置中心', leader: '李晓华', memberCount: 3, status: 'active', createdDate: '2024-04-18' },
  ],
  3: [
    { id: 301, name: '智能问答机器人', leader: '陈思雨', memberCount: 4, status: 'active', createdDate: '2024-04-05' },
    { id: 302, name: '图像识别平台', leader: '赵宇航', memberCount: 5, status: 'active', createdDate: '2024-04-15' },
    { id: 303, name: '推荐系统引擎', leader: '张明远', memberCount: 4, status: 'done', createdDate: '2024-03-01' },
    { id: 304, name: '自然语言处理工具', leader: '李晓华', memberCount: 3, status: 'active', createdDate: '2024-05-10' },
    { id: 305, name: '数据可视化大屏', leader: '王志坚', memberCount: 4, status: 'active', createdDate: '2024-04-28' },
  ],
  4: [
    { id: 401, name: '校园助手 APP', leader: '赵宇航', memberCount: 5, status: 'active', createdDate: '2024-04-08' },
    { id: 402, name: '教务小程序', leader: '陈思雨', memberCount: 4, status: 'active', createdDate: '2024-04-20' },
    { id: 403, name: '健身打卡 App', leader: '张明远', memberCount: 3, status: 'done', createdDate: '2024-02-25' },
    { id: 404, name: '外卖配送小程序', leader: '李晓华', memberCount: 4, status: 'active', createdDate: '2024-05-02' },
    { id: 405, name: '社团管理 App', leader: '王志坚', memberCount: 5, status: 'active', createdDate: '2024-03-15' },
    { id: 406, name: '成绩查询小程序', leader: '赵宇航', memberCount: 3, status: 'active', createdDate: '2024-04-12' },
  ],
  5: [
    { id: 501, name: '校园品牌 VI 设计', leader: '陈思雨', memberCount: 3, status: 'done', createdDate: '2024-03-10' },
    { id: 502, name: '官网重设计', leader: '赵宇航', memberCount: 4, status: 'active', createdDate: '2024-04-18' },
    { id: 503, name: '活动海报模板库', leader: '张明远', memberCount: 3, status: 'active', createdDate: '2024-05-05' },
  ],
}

const projectList = computed(() => allProjects[boardId.value] || [])
</script>

<style scoped>
.projects-page {
  width: 100%;
}

/* 面包屑 */
.projects-page :deep(.el-breadcrumb) {
  margin-bottom: 16px;
}
.projects-page :deep(.el-breadcrumb__inner) {
  font-size: 13px;
  color: #404752;
  font-weight: 400;
}
.projects-page :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #0060A9;
  font-weight: 700;
}

/* 头部 */
.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.page-title {
  margin: 0 0 4px;
  font-size: 30px;
  font-weight: 700;
  color: #191C1E;
  line-height: 38px;
}
.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #404752;
}

/* 表格 */
.table-card {
  background: #fff;
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(192, 199, 212, 0.30);
  overflow: hidden;
}
.projects-table :deep(.table-header-cell) {
  background: rgba(242, 244, 247, 0.50);
  font-size: 12px;
  font-weight: 500;
  color: #404752;
  letter-spacing: 0.6px;
  padding: 14px 0;
}
.projects-table :deep(.el-table__body td) {
  font-size: 14px;
  color: #191C1E;
}

/* 状态标签 */
.status-tag {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-active {
  background: rgba(85, 175, 40, 0.20);
  color: #133B00;
}
.status-done {
  background: rgba(192, 199, 212, 0.30);
  color: #404752;
}

/* 日期 */
.cell-date {
  font-size: 14px;
  font-family: Inter, sans-serif;
  color: #404752;
}
</style>
