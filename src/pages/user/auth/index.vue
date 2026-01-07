<template>
  <view class="auth-page">
    <!-- 顶部提示 -->
    <view class="header">
      <view class="header-icon">
        <image class="icon" src="/static/auth-icon.png" mode="aspectFit"></image>
      </view>
      <view class="header-title">实名认证</view>
      <view class="header-desc">为保障账户安全，请完成实名认证</view>
    </view>

    <!-- 表单区域 -->
    <view class="form-container">
      <!-- 真实姓名 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>真实姓名</text>
        </view>
        <input
          class="form-input"
          v-model="formData.realName"
          placeholder="请输入真实姓名"
          placeholder-class="placeholder"
          maxlength="20"
        />
      </view>

      <!-- 学号 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>学号</text>
        </view>
        <input
          class="form-input"
          v-model="formData.studentID"
          placeholder="请输入学号"
          placeholder-class="placeholder"
          maxlength="20"
        />
      </view>

      <!-- 学校邮箱 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>学校邮箱</text>
        </view>
        <input
          class="form-input"
          v-model="formData.email"
          type="text"
          placeholder="请输入学校邮箱"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 验证码 -->
      <view class="form-item">
        <view class="form-label">
          <text class="required">*</text>
          <text>邮箱验证码</text>
        </view>
        <view class="code-input-wrapper">
          <input
            class="form-input code-input"
            v-model="formData.verifyCode"
            type="number"
            placeholder="请输入验证码"
            placeholder-class="placeholder"
            maxlength="6"
          />
          <button
            class="code-btn"
            :class="{ disabled: countdown > 0 || sendingCode }"
            :disabled="countdown > 0 || sendingCode"
            @click="handleSendCode"
          >
            {{ codeButtonText }}
          </button>
        </view>
      </view>

      <!-- 提示信息 -->
      <view class="form-tips">
        <text class="tips-icon">ℹ️</text>
        <text class="tips-text">认证信息将加密存储，仅用于身份验证</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-container">
      <button
        class="submit-btn"
        :class="{ loading: submitting }"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '认证中...' : '立即认证' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { authApi } from '@/api/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 表单数据
const formData = reactive({
  realName: '',
  studentID: '',
  email: '',
  verifyCode: ''
})

// 状态
const countdown = ref(0) // 倒计时秒数
const sendingCode = ref(false) // 是否正在发送验证码
const submitting = ref(false) // 是否正在提交
let countdownTimer: number | null = null

// 验证码按钮文本
const codeButtonText = computed(() => {
  if (sendingCode.value) return '发送中...'
  if (countdown.value > 0) return `${countdown.value}s`
  return '发送验证码'
})

/**
 * 表单验证
 */
const validateForm = (): { valid: boolean; message: string } => {
  // 真实姓名验证
  if (!formData.realName.trim()) {
    return { valid: false, message: '请输入真实姓名' }
  }
  if (formData.realName.trim().length < 2) {
    return { valid: false, message: '姓名至少2个字符' }
  }

  // 学号验证
  if (!formData.studentID.trim()) {
    return { valid: false, message: '请输入学号' }
  }
  if (!/^[A-Za-z0-9]+$/.test(formData.studentID)) {
    return { valid: false, message: '学号格式不正确' }
  }

  // 邮箱验证
  if (!formData.email.trim()) {
    return { valid: false, message: '请输入邮箱' }
  }
  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailReg.test(formData.email)) {
    return { valid: false, message: '邮箱格式不正确' }
  }

  return { valid: true, message: '' }
}

/**
 * 发送验证码
 */
const handleSendCode = async () => {
  // 验证邮箱
  if (!formData.email.trim()) {
    uni.showToast({
      title: '请先输入邮箱',
      icon: 'none',
      duration: 2000
    })
    return
  }

  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailReg.test(formData.email)) {
    uni.showToast({
      title: '邮箱格式不正确',
      icon: 'none',
      duration: 2000
    })
    return
  }

  try {
    sendingCode.value = true

    // 调用发送验证码接口
    await authApi.sendCode({
      email: formData.email,
      type: 'bind'
    })

    uni.showToast({
      title: '验证码已发送',
      icon: 'success',
      duration: 2000
    })

    // 开始倒计时
    startCountdown()
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    // 错误已在 http 工具中处理
  } finally {
    sendingCode.value = false
  }
}

/**
 * 开始倒计时
 */
const startCountdown = () => {
  countdown.value = 60

  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

/**
 * 提交认证
 */
const handleSubmit = async () => {
  if (submitting.value) return

  // 表单验证
  const validation = validateForm()
  if (!validation.valid) {
    uni.showToast({
      title: validation.message,
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 验证码验证
  if (!formData.verifyCode.trim()) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none',
      duration: 2000
    })
    return
  }
  if (formData.verifyCode.length !== 6) {
    uni.showToast({
      title: '验证码为6位数字',
      icon: 'none',
      duration: 2000
    })
    return
  }

  try {
    submitting.value = true

    // 调用认证接口
    await authApi.bind({
      studentID: formData.studentID.trim(),
      realName: formData.realName.trim(),
      email: formData.email.trim(),
      verifyCode: formData.verifyCode.trim()
    })

    // 刷新用户信息
    await userStore.refreshUserInfo()

    // 认证成功提示
    uni.showModal({
      title: '认证成功',
      content: '您已完成实名认证，现在可以使用全部功能',
      showCancel: false,
      success: () => {
        // 跳转到首页
        uni.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  } catch (error: any) {
    console.error('认证失败:', error)
    // 错误已在 http 工具中处理
  } finally {
    submitting.value = false
  }
}

// 页面卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<script lang="ts">
import { onUnmounted } from 'vue'
export default {
  name: 'UserAuth'
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 顶部区域 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 80rpx;
  text-align: center;
  border-radius: 0 0 40rpx 40rpx;

  .header-icon {
    margin-bottom: 24rpx;

    .icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 24rpx;
      background-color: rgba(255, 255, 255, 0.2);
      padding: 20rpx;
    }
  }

  .header-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 16rpx;
  }

  .header-desc {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.85);
  }
}

/* 表单容器 */
.form-container {
  margin: -40rpx 40rpx 40rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

/* 表单项 */
.form-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;

  .required {
    color: #ff4757;
    margin-right: 4rpx;
  }
}

.form-input {
  width: 100%;
  height: 88rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;

  &.code-input {
    flex: 1;
  }
}

.placeholder {
  color: #999999;
  font-size: 28rpx;
}

/* 验证码输入区域 */
.code-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-btn {
  width: 200rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 26rpx;
  border-radius: 12rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &::after {
    border: none;
  }

  &.disabled {
    background: #e8e8e8;
    color: #999999;
  }

  &:active:not(.disabled) {
    opacity: 0.8;
  }
}

/* 提示信息 */
.form-tips {
  margin-top: 32rpx;
  padding: 20rpx;
  background-color: #fff9e6;
  border-radius: 12rpx;
  display: flex;
  align-items: flex-start;

  .tips-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
    line-height: 1;
  }

  .tips-text {
    flex: 1;
    font-size: 24rpx;
    color: #999999;
    line-height: 1.5;
  }
}

/* 提交按钮 */
.submit-container {
  padding: 0 40rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }

  &:active:not([disabled]) {
    transform: scale(0.98);
  }

  &[disabled] {
    opacity: 0.6;
  }

  &.loading {
    opacity: 0.8;
  }
}
</style>
