<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
    </view>

    <!-- 主要内容 -->
    <view class="content">
      <!-- Logo 区域 -->
      <view class="logo-section">
        <image 
          class="logo" 
          src="/static/logo.png" 
          mode="aspectFit"
        ></image>
        <text class="app-name">校园失物招领</text>
        <text class="app-slogan">让每一件失物都能回家</text>
      </view>

      <!-- 登录按钮区域 -->
      <view class="login-section">
        <button 
          class="login-btn" 
          type="primary"
          :loading="loading"
          @click="handleWechatLogin"
        >
          <view class="btn-content">
            <image 
              v-if="!loading"
              class="wechat-icon" 
              src="/static/wechat-icon.png"
              mode="aspectFit"
            ></image>
            <text>{{ loading ? '登录中...' : '微信一键登录' }}</text>
          </view>
        </button>

        <view class="tips">
          <text class="tips-text">登录即代表同意</text>
          <text class="tips-link">《用户协议》</text>
          <text class="tips-text">和</text>
          <text class="tips-link">《隐私政策》</text>
        </view>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="footer">
      <text class="footer-text">为师生提供便捷的失物招领服务</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)

/**
 * 微信一键登录
 */
const handleWechatLogin = async () => {
  if (loading.value) return

  try {
    loading.value = true

    // 1. 获取微信用户信息
    // 注意：uni.getUserProfile 需要在用户点击事件中调用
    const userProfileRes = await uni.getUserProfile({
      desc: '用于完善用户资料',
      lang: 'zh_CN'
    })

    if (!userProfileRes.userInfo) {
      throw new Error('获取用户信息失败')
    }

    // 2. 获取微信登录凭证
    const loginRes = await uni.login({
      provider: 'weixin'
    })

    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }

    // 3. 调用登录接口
    await userStore.login(loginRes.code, {
      nickName: userProfileRes.userInfo.nickName,
      avatarUrl: userProfileRes.userInfo.avatarUrl
    })

    // 4. 登录成功后跳转
    handleLoginSuccess()

  } catch (error: any) {
    console.error('登录失败:', error)
    
    // 用户拒绝授权
    if (error.errMsg && error.errMsg.includes('cancel')) {
      uni.showToast({
        title: '您取消了授权',
        icon: 'none',
        duration: 2000
      })
    } else {
      uni.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  } finally {
    loading.value = false
  }
}

/**
 * 登录成功后的跳转逻辑
 */
const handleLoginSuccess = () => {
  const userInfo = userStore.userInfo

  if (!userInfo) {
    uni.showToast({
      title: '登录异常，请重试',
      icon: 'none'
    })
    return
  }

  // 判断是否已实名认证
  if (!userInfo.isCertified) {
    // 未认证，跳转到实名认证页面
    uni.showModal({
      title: '温馨提示',
      content: '为了保障您的权益，请先完成实名认证',
      showCancel: false,
      success: () => {
        uni.redirectTo({
          url: '/pages/user/auth/index'
        })
      }
    })
  } else {
    // 已认证，跳转到首页
    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    
    &.circle-1 {
      width: 400rpx;
      height: 400rpx;
      top: -100rpx;
      right: -100rpx;
    }

    &.circle-2 {
      width: 300rpx;
      height: 300rpx;
      bottom: -50rpx;
      left: -50rpx;
    }
  }
}

/* 主要内容 */
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 60rpx;
}

/* Logo 区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 32rpx;
    background-color: #ffffff;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    margin-bottom: 40rpx;
  }

  .app-name {
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 16rpx;
    letter-spacing: 2rpx;
  }

  .app-slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 1rpx;
  }
}

/* 登录按钮区域 */
.login-section {
  display: flex;
  flex-direction: column;
  align-items: center;

  .login-btn {
    width: 100%;
    height: 96rpx;
    background: #ffffff;
    border-radius: 48rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    font-size: 32rpx;
    font-weight: 500;
    color: #667eea;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    margin-bottom: 40rpx;

    &::after {
      border: none;
    }

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;

      .wechat-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 16rpx;
      }
    }
  }

  .tips {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;

    .tips-text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.7);
    }

    .tips-link {
      font-size: 24rpx;
      color: #ffffff;
      text-decoration: underline;
      margin: 0 4rpx;
    }
  }
}

/* 底部 */
.footer {
  position: relative;
  z-index: 1;
  padding: 40rpx 0;
  text-align: center;

  .footer-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 1rpx;
  }
}
</style>
