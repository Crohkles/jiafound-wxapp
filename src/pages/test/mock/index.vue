<template>
  <view class="mock-test-page">
    <!-- 顶部状态栏 -->
    <view class="status-bar">
      <view class="status-item">
        <text class="label">Mock模式:</text>
        <text :class="['value', mockEnabled ? 'enabled' : 'disabled']">
          {{ mockEnabled ? '✅ 已启用' : '❌ 未启用' }}
        </text>
      </view>
      <view class="status-item">
        <text class="label">登录状态:</text>
        <text :class="['value', userStore.isLoggedIn ? 'enabled' : 'disabled']">
          {{ userStore.isLoggedIn ? '✅ 已登录' : '❌ 未登录' }}
        </text>
      </view>
    </view>

    <!-- 当前用户信息 -->
    <view v-if="userStore.isLoggedIn" class="user-section">
      <view class="section-title">当前用户</view>
      <view class="user-card">
        <image class="avatar" :src="userStore.userInfo?.avatarUrl" mode="aspectFill"></image>
        <view class="user-info">
          <text class="nickname">{{ userStore.userInfo?.nickname }}</text>
          <text class="student-id">学号: {{ userStore.userInfo?.studentId || '未绑定' }}</text>
          <text class="balance">余额: {{ userStore.coinBalance }} 赏币</text>
          <view class="badges">
            <text v-if="userStore.userInfo?.isCertified" class="badge cert">✓ 已认证</text>
            <text v-if="userStore.isAdmin" class="badge admin">👑 管理员</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Mock 用户切换 -->
    <view class="section">
      <view class="section-title">快速登录 (Mock)</view>
      <view class="button-group">
        <button class="test-btn primary" @click="loginAsCertified">
          <text class="btn-icon">✅</text>
          <view class="btn-content">
            <text class="btn-title">已认证用户</text>
            <text class="btn-desc">张小明 (学号: 2021001234)</text>
          </view>
        </button>
        
        <button class="test-btn" @click="loginAsUncertified">
          <text class="btn-icon">⚠️</text>
          <view class="btn-content">
            <text class="btn-title">未认证用户</text>
            <text class="btn-desc">微信用户 (未绑定学号)</text>
          </view>
        </button>
        
        <button class="test-btn admin" @click="loginAsAdmin">
          <text class="btn-icon">👑</text>
          <view class="btn-content">
            <text class="btn-title">管理员</text>
            <text class="btn-desc">李管理 (Admin权限)</text>
          </view>
        </button>
      </view>
    </view>

    <!-- 页面导航 -->
    <view class="section">
      <view class="section-title">页面测试</view>
      <view class="nav-grid">
        <view class="nav-item" @click="navigateTo('/pages/user/login/index')">
          <text class="nav-icon">🔑</text>
          <text class="nav-text">登录页</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/user/auth/index')">
          <text class="nav-icon">📝</text>
          <text class="nav-text">认证页</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/user/profile/index')">
          <text class="nav-icon">👤</text>
          <text class="nav-text">个人中心</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/user/wallet/index')">
          <text class="nav-icon">💰</text>
          <text class="nav-text">钱包</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="section">
      <view class="section-title">其他操作</view>
      <button class="action-btn" @click="printMockInfo">
        <text class="btn-icon">📋</text>
        <text>打印 Mock 状态 (控制台)</text>
      </button>
      <button v-if="userStore.isLoggedIn" class="action-btn danger" @click="handleLogout">
        <text class="btn-icon">🚪</text>
        <text>退出登录</text>
      </button>
    </view>

    <!-- 提示信息 -->
    <view class="tips">
      <text class="tips-title">💡 使用提示</text>
      <text class="tips-item">• Mock验证码统一为: 123456</text>
      <text class="tips-item">• 所有API请求会自动返回模拟数据</text>
      <text class="tips-item">• 可在控制台查看Mock API调用日志</text>
      <text class="tips-item">• 修改 .env.development 中 VITE_ENABLE_MOCK 可关闭Mock</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { printMockStatus } from '@/api/user.mock'

const userStore = useUserStore()
// 环境变量值为字符串，判断是否等于 'true'
const mockEnabled = ref(import.meta.env.VITE_ENABLE_MOCK === 'true')

onMounted(() => {
  console.log('🎭 Mock测试页面已加载')
  printMockStatus()
})

/**
 * 以已认证用户身份登录
 */
const loginAsCertified = () => {
  userStore.mockLogin('certified')
  uni.showToast({
    title: '已切换为已认证用户',
    icon: 'success'
  })
}

/**
 * 以未认证用户身份登录
 */
const loginAsUncertified = () => {
  userStore.mockLogin('uncertified')
  uni.showToast({
    title: '已切换为未认证用户',
    icon: 'none'
  })
}

/**
 * 以管理员身份登录
 */
const loginAsAdmin = () => {
  userStore.mockLogin('admin')
  uni.showToast({
    title: '已切换为管理员',
    icon: 'success'
  })
}

/**
 * 页面导航
 */
const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

/**
 * 打印 Mock 信息
 */
const printMockInfo = () => {
  printMockStatus()
  uni.showToast({
    title: '已输出到控制台',
    icon: 'success'
  })
}

/**
 * 退出登录
 */
const handleLogout = () => {
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
</script>

<style lang="scss" scoped>
.mock-test-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 32rpx;
}

/* 状态栏 */
.status-bar {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.status-item {
  display: flex;
  align-items: center;
  padding: 12rpx 0;

  .label {
    font-size: 28rpx;
    color: #666666;
    margin-right: 16rpx;
  }

  .value {
    font-size: 28rpx;
    font-weight: bold;

    &.enabled {
      color: #52c41a;
    }

    &.disabled {
      color: #999999;
    }
  }
}

/* 用户信息卡片 */
.user-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.user-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50rpx;
    margin-right: 24rpx;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .nickname {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
    }

    .student-id,
    .balance {
      font-size: 24rpx;
      color: #666666;
    }

    .badges {
      display: flex;
      gap: 12rpx;
      margin-top: 8rpx;

      .badge {
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        
        &.cert {
          background: #e6f7ff;
          color: #1890ff;
        }

        &.admin {
          background: #fff7e6;
          color: #fa8c16;
        }
      }
    }
  }
}

/* 分组 */
.section {
  margin-bottom: 24rpx;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.test-btn {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid #e8e8e8;
  
  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }

  &.primary {
    border-color: #52c41a;
    background: #f6ffed;
  }

  &.admin {
    border-color: #fa8c16;
    background: #fff7e6;
  }

  .btn-icon {
    font-size: 48rpx;
    margin-right: 24rpx;
  }

  .btn-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    align-items: flex-start;

    .btn-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333333;
    }

    .btn-desc {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

/* 导航网格 */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.nav-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &:active {
    opacity: 0.8;
  }

  .nav-icon {
    font-size: 56rpx;
  }

  .nav-text {
    font-size: 26rpx;
    color: #333333;
  }
}

/* 操作按钮 */
.action-btn {
  width: 100%;
  background: #ffffff;
  color: #333333;
  font-size: 28rpx;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.8;
  }

  &.danger {
    background: #fff1f0;
    color: #ff4d4f;
  }

  .btn-icon {
    font-size: 32rpx;
  }
}

/* 提示信息 */
.tips {
  background: #e6f7ff;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #1890ff;

  .tips-title {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: #1890ff;
    margin-bottom: 16rpx;
  }

  .tips-item {
    display: block;
    font-size: 24rpx;
    color: #666666;
    line-height: 40rpx;
    margin-bottom: 8rpx;
  }
}
</style>
