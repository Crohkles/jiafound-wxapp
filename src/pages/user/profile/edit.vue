<template>
  <view class="edit-page">
    <!-- 头像编辑区 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @click="handleChooseAvatar">
        <image 
          class="avatar" 
          :src="formData.avatarUrl || '/static/default-avatar.png'" 
          mode="aspectFill"
        ></image>
        <view class="upload-mask">
          <text class="upload-icon">📷</text>
          <text class="upload-text">点击更换</text>
        </view>
      </view>
    </view>

    <!-- 表单编辑区 -->
    <view class="form-section">
      <!-- 昵称 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">昵称</text>
          <text class="required">*</text>
        </view>
        <input 
          class="item-input" 
          v-model="formData.nickName" 
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>

      <!-- 学号（不可修改） -->
      <view class="form-item disabled">
        <view class="item-label">
          <text class="label-text">学号</text>
        </view>
        <input 
          class="item-input" 
          :value="userStore.userInfo?.studentId || '未绑定'" 
          disabled
          placeholder="实名认证后不可修改"
        />
      </view>

      <!-- 邮箱 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">邮箱</text>
        </view>
        <view class="item-input-wrapper">
          <input 
            class="item-input flex" 
            v-model="formData.email" 
            placeholder="请输入邮箱"
            type="text"
          />
          <button 
            v-if="isEmailChanged"
            class="code-btn" 
            :class="{ disabled: countdown > 0 }"
            :disabled="countdown > 0"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
          </button>
        </view>
      </view>

      <!-- 验证码（仅修改邮箱时显示） -->
      <view v-if="isEmailChanged" class="form-item">
        <view class="item-label">
          <text class="label-text">验证码</text>
          <text class="required">*</text>
        </view>
        <input 
          class="item-input" 
          v-model="formData.verifyCode" 
          placeholder="请输入邮箱验证码"
          maxlength="6"
          type="number"
        />
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="tips">
      <text class="tips-icon">💡</text>
      <text class="tips-text">修改邮箱需要验证新邮箱的验证码</text>
    </view>

    <!-- 保存按钮 -->
    <view class="button-section">
      <button class="save-btn" @click="handleSave">
        保存修改
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi, authApi, uploadApi } from '@/api/user'
import type { UpdateProfileParams } from '@/types/user'

const userStore = useUserStore()

/** 表单数据 */
const formData = ref({
  avatarUrl: '',
  nickName: '',
  email: '',
  verifyCode: ''
})

/** 初始邮箱（用于判断是否修改） */
const initialEmail = ref('')

/** 验证码倒计时 */
const countdown = ref(0)

/** 倒计时定时器 */
let countdownTimer: number | null = null

/**
 * 判断邮箱是否被修改
 */
const isEmailChanged = computed(() => {
  return formData.value.email !== initialEmail.value && formData.value.email.trim() !== ''
})

/**
 * 页面加载时初始化数据
 */
onMounted(() => {
  if (userStore.userInfo) {
    // 深拷贝用户信息
    formData.value = {
      avatarUrl: userStore.userInfo.avatarUrl || '',
      nickName: userStore.userInfo.nickname || '',
      email: userStore.userInfo.email || '',
      verifyCode: ''
    }
    initialEmail.value = userStore.userInfo.email || ''
  }
})

/**
 * 选择并上传头像
 */
const handleChooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      
      // 显示上传中
      uni.showLoading({
        title: '上传中...',
        mask: true
      })

      try {
        // 调用上传接口
        const result = await uploadApi.uploadImage(tempFilePath)
        
        if (result.code === 200 && result.data) {
          // 更新头像 URL（后端直接返回URL字符串）
          formData.value.avatarUrl = result.data
          
          uni.showToast({
            title: '头像上传成功',
            icon: 'success'
          })
        }
      } catch (error: any) {
        console.error('上传头像失败:', error)
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
    }
  })
}

/**
 * 发送验证码
 */
const handleSendCode = async () => {
  // 校验邮箱格式
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(formData.value.email)) {
    uni.showToast({
      title: '请输入正确的邮箱格式',
      icon: 'none'
    })
    return
  }

  try {
    // 调用发送验证码接口
    const result = await authApi.sendCode({
      email: formData.value.email,
      type: 'update'
    })

    if (result.code === 200) {
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      })

      // 开始倒计时
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          if (countdownTimer) {
            clearInterval(countdownTimer)
            countdownTimer = null
          }
        }
      }, 1000) as unknown as number
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    uni.showToast({
      title: error.message || '发送失败',
      icon: 'none'
    })
  }
}

/**
 * 保存修改
 */
const handleSave = async () => {
  // 校验昵称
  if (!formData.value.nickName.trim()) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }

  // 如果修改了邮箱，校验验证码
  if (isEmailChanged.value && !formData.value.verifyCode.trim()) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    })
    return
  }

  // 构建更新参数
  const updateParams: UpdateProfileParams = {
    nickName: formData.value.nickName,
    avatarUrl: formData.value.avatarUrl
  }

  // 如果修改了邮箱，添加邮箱和验证码
  if (isEmailChanged.value) {
    updateParams.email = formData.value.email
    updateParams.verifyCode = formData.value.verifyCode
  }

  uni.showLoading({
    title: '保存中...',
    mask: true
  })

  try {
    // 调用更新接口
    const result = await userApi.updateProfile(updateParams)

    if (result.code === 200) {
      // 刷新用户信息
      await userStore.refreshUserInfo()

      uni.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      })

      // 延时返回
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

/**
 * 页面卸载时清理定时器
 */
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style lang="scss" scoped>
.edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 头像编辑区 */
.avatar-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 0 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;

  &:active {
    opacity: 0.9;
  }
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  background-color: #ffffff;
}

.upload-mask {
  position: absolute;
  bottom: -40rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.upload-icon {
  font-size: 32rpx;
}

.upload-text {
  font-size: 22rpx;
  color: #ffffff;
  white-space: nowrap;
}

/* 表单区 */
.form-section {
  margin: 32rpx 32rpx 24rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 16rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.form-item {
  padding: 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &.disabled {
    opacity: 0.6;
  }
}

.item-label {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.label-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.required {
  font-size: 28rpx;
  color: #ff4d4f;
  margin-left: 4rpx;
}

.item-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.item-input {
  width: 100%;
  height: 80rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;

  &.flex {
    flex: 1;
  }

  &::placeholder {
    color: #999999;
  }

  &:disabled {
    color: #999999;
  }
}

.code-btn {
  flex-shrink: 0;
  height: 80rpx;
  padding: 0 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 24rpx;
  border-radius: 12rpx;
  border: none;
  white-space: nowrap;

  &::after {
    border: none;
  }

  &:active:not(.disabled) {
    opacity: 0.8;
  }

  &.disabled {
    background: #e8e8e8;
    color: #999999;
  }
}

/* 提示信息 */
.tips {
  margin: 0 32rpx 24rpx;
  padding: 24rpx;
  background-color: #e6f7ff;
  border-radius: 12rpx;
  border-left: 4rpx solid #1890ff;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.tips-icon {
  font-size: 32rpx;
  line-height: 40rpx;
}

.tips-text {
  flex: 1;
  font-size: 24rpx;
  color: #666666;
  line-height: 40rpx;
}

/* 保存按钮 */
.button-section {
  padding: 0 32rpx;
  margin-top: 32rpx;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 12rpx;
  border: none;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);

  &::after {
    border: none;
  }

  &:active {
    opacity: 0.9;
  }
}
</style>
