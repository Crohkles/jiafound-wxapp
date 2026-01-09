<template>
  <view class="profile-page">
    <!-- 头部用户信息卡片 -->
    <view class="user-card">
      <!-- 背景装饰 -->
      <view class="card-bg"></view>
      
      <!-- 用户信息 -->
      <view class="user-info">
        <!-- 头像 -->
        <image 
          class="avatar" 
          :src="userStore.userInfo?.avatarUrl || '/static/default-avatar.png'" 
          mode="aspectFill"
        ></image>
        
        <!-- 信息区域 -->
        <view class="info-content">
          <view class="name-row">
            <text class="nickname">{{ userStore.userInfo?.nickname || '未登录' }}</text>
            <!-- 认证标签 -->
            <view v-if="userStore.userInfo?.isCertified" class="cert-badge">
              <text class="cert-icon">✓</text>
              <text class="cert-text">已认证</text>
            </view>
          </view>
          
          <!-- 学号（脱敏） -->
          <text v-if="userStore.userInfo" class="student-id">
            学号：{{ maskStudentId }}
          </text>
          <text v-else class="student-id">请登录使用</text>
        </view>
        
        <!-- 编辑按钮 -->
        <view class="edit-btn" @click="handleEdit">
          <text class="edit-icon">✏️</text>
        </view>
      </view>
    </view>

    <!-- 资产卡片 -->
    <view class="asset-card">
      <view class="asset-header">
        <text class="asset-title">我的资产</text>
      </view>
      
      <view class="asset-content">
        <!-- 可用赏币 -->
        <view class="asset-item">
          <text class="asset-label">可用赏币</text>
          <text class="asset-value">{{ userStore.coinBalance.toFixed(2) }}</text>
        </view>
        
        <!-- 分隔线 -->
        <view class="asset-divider"></view>
        
        <!-- 冻结赏币 -->
        <view class="asset-item">
          <text class="asset-label">冻结赏币</text>
          <text class="asset-value frozen">{{ userStore.frozenBalance.toFixed(2) }}</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="asset-actions">
        <button class="action-btn primary" @click="handleRecharge">
          <text class="btn-icon">💰</text>
          <text>充值</text>
        </button>
        <button class="action-btn" @click="handleWithdraw">
          <text class="btn-icon">💸</text>
          <text>提现</text>
        </button>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <!-- 我的发布 -->
      <view class="menu-item" @click="handleNavigation('/pages/item/my-post/index')">
        <view class="menu-left">
          <text class="menu-icon">📝</text>
          <text class="menu-text">我的发布</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <!-- 我的认领 -->
      <view class="menu-item" @click="handleNavigation('/pages/item/my-claim/index')">
        <view class="menu-left">
          <text class="menu-icon">🎯</text>
          <text class="menu-text">我的认领</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 登录/退出登录按钮 -->
    <view class="logout-container">
      <!-- 已登录：显示退出登录按钮 -->
      <button v-if="userStore.isLoggedIn" class="logout-btn" @click="handleLogout">
        退出登录
      </button>
      <!-- 未登录：显示登录按钮 -->
      <button v-else class="login-btn" @click="handleLogin">
        登录
      </button>
    </view>

    <!-- TabBar 占位 -->
    <view class="tabbar-placeholder"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

/**
 * 学号脱敏处理
 * 例如：2021001234 -> 202****234
 */
const maskStudentId = computed(() => {
  const studentId = userStore.userInfo?.studentId || ''
  if (!studentId || studentId.length < 6) return studentId
  
  const start = studentId.substring(0, 3)
  const end = studentId.substring(studentId.length - 3)
  return `${start}****${end}`
})

/**
 * 页面显示时刷新用户信息（包括余额）
 */
onShow(() => {
  if (userStore.isLoggedIn) {
    userStore.refreshUserInfo().catch(error => {
      console.error('刷新用户信息失败:', error)
    })
  }
})

// 将“我的发布”跳转逻辑修改为：
const handleMyPost = () => {
  uni.navigateTo({ url: '/pages/list/list?mode=mine' })
}

/**
 * 编辑个人资料
 */
const handleEdit = () => {
  if (!userStore.isLoggedIn) {
    handleLogin()
    return
  }

  uni.navigateTo({
    url: '/pages/user/profile/edit'
  })
}

/**
 * 充值
 */
const handleRecharge = () => {
  if (!userStore.isLoggedIn) {
    handleLogin()
    return
  }

  uni.navigateTo({
    url: '/pages/user/wallet/index?tab=recharge'
  })
}

/**
 * 提现
 */
const handleWithdraw = () => {
  if (!userStore.isLoggedIn) {
    handleLogin()
    return
  }

  uni.navigateTo({
    url: '/pages/user/wallet/index?tab=withdraw'
  })
}

// 修改 handleNavigation
const handleNavigation = (url: string) => {
  if (url.includes('my-post')) {
    // 统一跳转到 list 页面，并告知是查询个人数据
    uni.navigateTo({ url: '/pages/list/list?mode=mine' })
  } else {
    uni.navigateTo({ url })
  }
}

/**
 * 通用页面跳转
 */
// const handleNavigation = (url: string) => {
//   if (!userStore.isLoggedIn) {
//     handleLogin()
//     return
//   }

//   uni.navigateTo({ url })
// }

/**
 * 退出登录
 */
const handleLogout = () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '您还未登录',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

/**
 * 跳转登录
 */
const handleLogin = () => {
  uni.navigateTo({
    url: '/pages/user/login/index'
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20rpx;
}

/* 用户信息卡片 */
.user-card {
  position: relative;
  margin: 0 0 24rpx;
  overflow: hidden;
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-info {
  position: relative;
  padding: 60rpx 32rpx 32rpx;
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  background-color: #ffffff;
}

.info-content {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.cert-badge {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 20rpx;
}

.cert-icon {
  font-size: 20rpx;
  color: #ffffff;
}

.cert-text {
  font-size: 22rpx;
  color: #ffffff;
}

.student-id {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.edit-btn {
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  font-size: 32rpx;
}

/* 资产卡片 */
.asset-card {
  margin: 0 32rpx 24rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.asset-header {
  margin-bottom: 24rpx;
}

.asset-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.asset-content {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.asset-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.asset-label {
  font-size: 26rpx;
  color: #999999;
}

.asset-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;

  &.frozen {
    color: #999999;
  }
}

.asset-divider {
  width: 2rpx;
  height: 80rpx;
  background-color: #e8e8e8;
}

.asset-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  background-color: #f8f8f8;
  color: #333333;
  font-size: 28rpx;
  border-radius: 12rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  &::after {
    border: none;
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }

  &:active {
    opacity: 0.8;
  }
}

.btn-icon {
  font-size: 32rpx;
}

/* 功能列表 */
.menu-list {
  margin: 0 32rpx 24rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #f8f8f8;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.menu-icon {
  font-size: 40rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 48rpx;
  color: #cccccc;
  font-weight: 300;
}

/* 登录/退出登录按钮 */
.logout-container {
  padding: 0 32rpx;
}

.logout-btn,
.login-btn {
  width: 100%;
  height: 88rpx;
  font-size: 28rpx;
  border-radius: 12rpx;
  border: none;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }
}

.logout-btn {
  background-color: #ffffff;
  color: #ff4757;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

/* TabBar 占位 */
.tabbar-placeholder {
  height: 100rpx;
}
</style>
