<template>
  <!-- Figma: 1280x1024, 侧边栏 220px + 右侧 1060px -->
  <el-container class="layout-container">
    <!-- ===== 侧边栏 ===== -->
    <el-aside width="220px" class="layout-aside">
      <!-- Logo 区 (Figma: 50px 高) -->
      <div class="aside-logo">
        <img src="/assets/CodeBuddyAssets/3_328/18.svg" alt="logo" class="logo-icon" />
        <span class="logo-text">TeamMatch</span>
      </div>

      <!-- 菜单 (Figma: 菜单项 42px 高, 选中态蓝色) -->
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#0A1C30"
        text-color="#B6C8E2"
        active-text-color="#D3E4FF"
        class="aside-menu"
      >
        <el-menu-item index="/board">
          <img src="/assets/CodeBuddyAssets/3_328/19.svg" class="menu-icon" />
          <span>板块管理</span>
        </el-menu-item>
        <el-menu-item index="/reports">
          <img src="/assets/CodeBuddyAssets/3_328/20.svg" class="menu-icon" />
          <span>举报处理</span>
        </el-menu-item>
        <el-menu-item index="/appeals">
          <img src="/assets/CodeBuddyAssets/3_328/21.svg" class="menu-icon" />
          <span>申诉处理</span>
        </el-menu-item>
        <el-menu-item index="/evaluations">
          <img src="/assets/CodeBuddyAssets/3_328/22.svg" class="menu-icon" />
          <span>评价复核</span>
        </el-menu-item>
        <el-menu-item index="/penalties">
          <img src="/assets/CodeBuddyAssets/3_328/23.svg" class="menu-icon" />
          <span>处罚管理</span>
        </el-menu-item>
      </el-menu>

      <!-- 底部用户区 (Figma: border-top #37485D) -->
      <div class="aside-footer">
        <div class="aside-user">
          <img src="/assets/CodeBuddyAssets/3_328/29.svg" class="user-avatar" />
          <div class="user-info">
            <span class="user-name">Admin_Console</span>
            <span class="user-role">SUPER ADMINISTRATOR</span>
          </div>
        </div>
        <div class="aside-actions">
          <button class="aside-btn" title="设置">
            <img src="/assets/CodeBuddyAssets/3_328/25.svg" />
          </button>
          <button class="aside-btn" title="退出" @click="handleLogout">
            <img src="/assets/CodeBuddyAssets/3_328/26.svg" />
          </button>
        </div>
      </div>
    </el-aside>

    <!-- ===== 右侧主区域 ===== -->
    <el-container class="layout-main">
      <!-- 顶部栏 (Figma: 50px, 白色, border-bottom #C0C7D4) -->
      <el-header height="50px" class="layout-header">
        <!-- 面包屑 -->
        <el-breadcrumb separator="/" class="header-breadcrumb">
          <el-breadcrumb-item :to="{ path: '/board' }">
            <img src="/assets/CodeBuddyAssets/3_328/1.svg" class="breadcrumb-home" />
          </el-breadcrumb-item>
          <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 右侧: 通知 + 用户 -->
        <div class="header-right">
          <div class="header-icons">
            <img src="/assets/CodeBuddyAssets/3_328/3.svg" class="header-icon" />
            <img src="/assets/CodeBuddyAssets/3_328/4.svg" class="header-icon" />
            <img src="/assets/CodeBuddyAssets/3_328/5.svg" class="header-icon" />
          </div>
          <div class="header-user">
            <span>系统管理员</span>
          </div>
        </div>
      </el-header>

      <!-- 内容区 (Figma: #F5F7FA, padding 24px) -->
      <el-main class="layout-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const items = []
  const matched = route.matched.filter(r => r.meta && r.meta.title)
  for (const m of matched) {
    items.push({ name: m.meta.title, path: m.path })
  }
  return items
})

const handleLogout = () => {
  localStorage.removeItem('adminToken')
  router.push('/login')
}
</script>

<style scoped>
/* ================================================================
 * 所有色值、间距严格从 Figma 3_328 提取
 * 侧边栏: 220px, bg #0A1C30
 * 顶部栏: 50px, bg white, border #C0C7D4
 * 内容区: bg #F5F7FA
 * ================================================================ */

.layout-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* ========== 侧边栏 ========== */
.layout-aside {
  background: #0A1C30;
  box-shadow: 0px 4px 6px -4px rgba(0,0,0,0.10), 0px 10px 15px -3px rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Logo (Figma: 50px, 文字白色 24px Inter Bold) */
.aside-logo {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 6px;
  flex-shrink: 0;
}
.logo-icon {
  width: 18px;
  height: 18px;
}
.logo-text {
  font-size: 24px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  color: #fff;
}

/* 菜单 */
.aside-menu {
  flex: 1;
  overflow-y: auto;
  border-right: none;
  padding-top: 16px;
}
.aside-menu :deep(.el-menu-item) {
  height: 42px;
  line-height: 42px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12px;
  padding-left: 16px !important;
}
.aside-menu :deep(.el-menu-item:hover) {
  background: rgba(64,158,255,0.10);
}
.aside-menu :deep(.el-menu-item.is-active) {
  background: rgba(64,158,255,0.20);
  border-right: 4px solid #409EFF;
  color: #D3E4FF;
}
.menu-icon {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  vertical-align: middle;
}

/* 底部用户区 */
.aside-footer {
  flex-shrink: 0;
  border-top: 1px solid #37485D;
  padding: 17px 16px;
}
.aside-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}
.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.user-name {
  font-size: 12px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  letter-spacing: 0.12px;
  color: #fff;
}
.user-role {
  font-size: 10px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  letter-spacing: 0.5px;
  color: #B6C8E2;
}
.aside-actions {
  display: flex;
  gap: 8px;
}
.aside-btn {
  width: 90px;
  height: 28px;
  background: #37485D;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.aside-btn:hover {
  background: #4a5f78;
}
.aside-btn img {
  width: 16px;
  height: 16px;
}

/* ========== 右侧主区 ========== */
.layout-main {
  flex-direction: column;
  background: #F5F7FA;
}

/* 顶部栏 (Figma: 50px, white, border-bottom #C0C7D4) */
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #C0C7D4;
  padding: 0 24px;
  flex-shrink: 0;
}

/* 面包屑 */
.header-breadcrumb :deep(.el-breadcrumb__item .el-breadcrumb__inner) {
  font-size: 13px;
  color: #404752;
  font-weight: 400;
}
.header-breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #0060A9;
  font-weight: 700;
}
.header-breadcrumb :deep(.el-breadcrumb__separator) {
  color: #C0C7D4;
}
.breadcrumb-home {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

/* 右侧图标+用户 */
.header-right {
  display: flex;
  align-items: center;
  gap: 0;
}
.header-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-icon {
  width: 34px;
  height: 34px;
  cursor: pointer;
}
.header-user {
  margin-left: 24px;
  padding-left: 24px;
  border-left: 1px solid #C0C7D4;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12px;
  color: #191C1E;
  white-space: nowrap;
}

/* 内容区 (Figma: #F5F7FA, padding 24px) */
.layout-content {
  background: #F5F7FA;
  padding: 24px;
  overflow-y: auto;
}
</style>
