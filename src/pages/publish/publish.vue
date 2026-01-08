<template>
    <view class="container">
      <view class="form-group">
        <view class="form-item">
          <text class="label">上传图片</text>
          <view class="upload-box" @tap="chooseImage">
            <image v-if="formData.image" :src="formData.image" mode="aspectFill" />
            <view v-else class="upload-placeholder">
              <text class="plus">+</text>
              <text>点击上传</text>
            </view>
          </view>
        </view>
  
        <view class="form-item">
          <text class="label">物品名称</text>
          <input class="input" v-model="formData.title" placeholder="请输入物品名称" @input="saveDraft" />
        </view>
  
        <view class="form-item">
          <text class="label">物品位置</text>
          <view class="location-input" @tap="getLocation">
            <text :class="{ 'placeholder': !formData.location }">{{ formData.location || '点击获取当前位置' }}</text>
            <text class="loc-icon">📍</text>
          </view>
        </view>
  
        <view v-if="isLost" class="form-item reward-section">
          <view class="reward-header">
            <text class="label">开启悬赏 (可选)</text>
            <switch :checked="formData.rewardEnabled" @change="toggleReward" color="#007aff" />
          </view>
          <view v-if="formData.rewardEnabled" class="reward-input-box">
            <input type="number" class="input" v-model="formData.rewardPoints" placeholder="输入悬赏积分" />
            <text class="balance">当前余额: {{ userBalance }}</text>
          </view>
        </view>
      </view>
  
      <button class="submit-btn" :loading="isSubmitting" @tap="handleSubmit">立即发布</button>
    </view>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  
  const isLost = ref(true)
  const isSubmitting = ref(false)
  const userBalance = ref(100) // 模拟余额
  
  const formData = reactive({
    title: '',
    location: '',
    latitude: 0,
    longitude: 0,
    image: '',
    rewardEnabled: false,
    rewardPoints: 0
  })
  
  // 自动填充缓存（应对网络故障）
  onMounted(() => {
    const draft = uni.getStorageSync('publish_draft')
    if (draft) Object.assign(formData, draft)
  })
  
  const saveDraft = () => uni.setStorageSync('publish_draft', formData)
  
  const chooseImage = () => {
    uni.chooseImage({
      count: 1,
      success: (res) => {
        formData.image = res.tempFilePaths[0]
        saveDraft()
      }
    })
  }
  
  const handleSubmit = async () => {
    // 1. 校验
    if (!formData.title || !formData.image) {
      return uni.showToast({ title: '请完善图片和名称', icon: 'none' })
    }
  
    // 2. 余额检查
    if (formData.rewardEnabled && formData.rewardPoints > userBalance.value) {
      return uni.showModal({
        title: '余额不足',
        content: '您的余额不足以支付悬赏，请充值或修改金额',
        confirmText: '去充值'
      })
    }
  
    isSubmitting.value = true
    uni.showLoading({ title: 'AI 匹配中...' })
  
    try {
      // 模拟接口请求
      // const res = await request('/item/publish', 'POST', formData);
      
      // 模拟匹配成功情况
      setTimeout(() => {
        uni.hideLoading()
        isSubmitting.value = false
        uni.showModal({
          title: '发布成功',
          content: 'AI 以为您找到可能匹配的物品，快去看看吧！',
          success: () => uni.redirectTo({ url: '/pages/detail/detail' })
        })
        uni.removeStorageSync('publish_draft')
      }, 1500)
    } catch (e) {
      uni.showToast({ title: '网络异常，已自动保存草稿', icon: 'none' })
      isSubmitting.value = false
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .container { padding: 30rpx; background: #fff; min-height: 100vh; }
  .form-group { margin-bottom: 60rpx; }
  .form-item { margin-bottom: 40rpx; }
  .label { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; display: block; }
  .upload-box {
    width: 200rpx; height: 200rpx; background: #f4f4f4; border-radius: 12rpx;
    display: flex; align-items: center; justify-content: center;
    image { width: 100%; height: 100%; border-radius: 12rpx; }
    .upload-placeholder { color: #999; font-size: 22rpx; text-align: center; .plus { font-size: 50rpx; display: block; } }
  }
  .input, .location-input {
    background: #f8f8f8; padding: 24rpx; border-radius: 12rpx; font-size: 28rpx;
  }
  .location-input { display: flex; justify-content: space-between; align-items: center; .placeholder { color: #ccc; } }
  .reward-header { display: flex; justify-content: space-between; align-items: center; }
  .balance { font-size: 22rpx; color: #ff9800; margin-top: 10rpx; display: block; }
  .submit-btn {
    background: #007aff; color: #fff; border-radius: 50rpx; font-size: 32rpx; height: 90rpx; line-height: 90rpx;
  }
  </style>