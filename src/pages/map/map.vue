<template>
    <view class="map-container">
      <map 
        id="itemMap"
        class="full-map"
        :latitude="latitude" 
        :longitude="longitude" 
        :markers="markers" 
        @markertap="onMarkerTap"
        show-location
      >
        <cover-view v-if="activeItem" class="item-pop-card">
          <cover-view class="pop-header">
            <cover-image :src="activeItem.image" class="pop-img" />
            <cover-view class="pop-main">
              <cover-view class="pop-title">{{ activeItem.title }}</cover-view>
              <cover-view class="pop-tag" :class="activeItem.type === 'LOST' ? 'red' : 'blue'">
                {{ activeItem.type === 'LOST' ? '寻找中' : '待认领' }}
              </cover-view>
            </cover-view>
          </cover-view>
          <cover-view class="pop-detail">
            <cover-view>时间：{{ activeItem.time }}</cover-view>
            <cover-view>位置：{{ activeItem.location }}</cover-view>
          </cover-view>
          <button class="pop-btn" @tap="viewDetail">查看详情</button>
        </cover-view>
      </map>
    </view>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  
  const latitude = ref(31.28345) // 嘉定校区默认中心
  const longitude = ref(121.50423)
  const markers = ref<any[]>([])
  const activeItem = ref<any>(null)
  
  onMounted(() => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        latitude.value = res.latitude
        longitude.value = res.longitude
        fetchMarkers()
      },
      fail: () => {
        uni.showToast({ title: '授权失败，加载默认视图', icon: 'none' })
        fetchMarkers()
      }
    })
  })
  
  const fetchMarkers = () => {
    // 模拟从 /item/hall 获取的数据
    markers.value = [
      {
        id: 1, latitude: 31.284, longitude: 121.505,
        title: '丢失耳机', iconPath: '/static/marker_red.png', width: 40, height: 40
      }
    ]
  }
  
  const onMarkerTap = (e: any) => {
    // 根据 ID 获取详情并赋值给 activeItem
    activeItem.value = {
      title: '丢失黑色耳机', image: 'https://via.placeholder.com/100',
      type: 'LOST', time: '10:00', location: '教学楼A'
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .map-container { width: 100vw; height: 100vh; }
  .full-map { width: 100%; height: 100%; }
  .item-pop-card {
    position: absolute; bottom: 60rpx; left: 30rpx; right: 30rpx;
    background: #fff; border-radius: 20rpx; padding: 24rpx;
    box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.2);
  }
  .pop-header { display: flex; .pop-img { width: 100rpx; height: 100rpx; border-radius: 10rpx; margin-right: 20rpx; } }
  .pop-title { font-size: 30rpx; font-weight: bold; }
  .pop-tag { 
    font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 6rpx; display: inline-block;
    &.red { background: #fff1f0; color: #ff4d4f; }
    &.blue { background: #e6f7ff; color: #1890ff; }
  }
  .pop-detail { font-size: 24rpx; color: #666; margin: 20rpx 0; }
  .pop-btn { background: #007aff; color: #fff; font-size: 24rpx; height: 60rpx; line-height: 60rpx; }
  </style>