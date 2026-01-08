<template>
  <view class="container">
    <view class="header">
      <text class="title">嘉园失物招领</text>
      <text class="subtitle">AI 智能匹配，让温暖不再迷路</text>
    </view>

    <view class="main-buttons">
      <view class="btn-box lost" @tap="goPublish('LOST')">
        <view class="icon-circle">🔍</view>
        <text class="btn-text">寻找失物</text>
        <text class="btn-desc">发布寻物启事</text>
      </view>
      <view class="btn-box found" @tap="goPublish('FOUND')">
        <view class="icon-circle">🎁</view>
        <text class="btn-text">拾到物品</text>
        <text class="btn-desc">发布招领信息</text>
      </view>
    </view>

    <view class="map-entry" @tap="goMap">
      <view class="map-card">
        <view class="map-info">
          <text class="map-title">📍 地图模式</text>
          <text class="map-desc">查看周边待领或寻找中的物品</text>
        </view>
        <text class="arrow">></text>
      </view>
    </view>

    <view class="module-section">
      <view class="module-card latest" @tap="goList('latest')">
        <view class="module-content">
          <text class="module-title">最新动态</text>
          <text class="module-desc">最新丢失与招领</text>
        </view>
        <view class="module-icon">🆕</view>
      </view>
      
      <view class="module-card urgent" @tap="goList('urgent')">
        <view class="module-content">
          <text class="module-title">30天未领</text>
          <text class="module-desc">紧急寻找失主/主</text>
        </view>
        <view class="module-icon">⚠️</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const goPublish = (type: string) => {
  uni.navigateTo({
    url: `/pages/publish/publish?type=${type}`
  })
}

const goMap = () => {
  uni.navigateTo({
    url: '/pages/map/map'
  })
}

// 跳转到列表页，携带 type 参数区分模块
const goList = (mode: string) => {
  uni.navigateTo({
    url: `/pages/list/list?mode=${mode}`
  })
}

const goMockTest = () => {
  uni.navigateTo({
    url: '/pages/test/mock/index'
  })
}
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
  .header {
    margin-bottom: 60rpx;
    .title { font-size: 48rpx; font-weight: bold; color: #333; display: block; }
    .subtitle { font-size: 26rpx; color: #999; margin-top: 10rpx; display: block; }
  }
  .main-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40rpx;
    .btn-box {
      width: 46%;
      height: 320rpx;
      border-radius: 30rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.05);
      &.lost { background: #fff1f0; border: 1px solid #ffccc7; }
      &.found { background: #e6f7ff; border: 1px solid #91d5ff; }
    }
    .icon-circle {
      width: 100rpx; height: 100rpx; border-radius: 50%; background: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 50rpx; margin-bottom: 20rpx;
    }
    .btn-text { font-size: 34rpx; font-weight: bold; color: #333; }
    .btn-desc { font-size: 22rpx; color: #888; margin-top: 8rpx; }
  }
  .map-card {
    background: #fff; padding: 40rpx; border-radius: 24rpx;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
    .map-title { font-size: 30rpx; font-weight: bold; color: #444; display: block; }
    .map-desc { font-size: 24rpx; color: #999; margin-top: 6rpx; }
    .arrow { color: #ccc; }
  }
}

.module-section {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
  
  .module-card {
    width: 44%;
    padding: 30rpx 20rpx;
    border-radius: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
    background: #ffffff;
    
    &.latest { border-left: 8rpx solid #52c41a; }
    &.urgent { border-left: 8rpx solid #faad14; }
    
    .module-title { font-size: 28rpx; font-weight: bold; color: #333; display: block; }
    .module-desc { font-size: 20rpx; color: #999; margin-top: 8rpx; display: block; }
    .module-icon { font-size: 40rpx; }
  }
}
</style>