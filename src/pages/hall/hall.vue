<template>
    <view class="container">
      <view class="tab-header">
        <view 
          v-for="tab in ['全部', '寻物', '招领']" 
          :key="tab" 
          class="tab-item"
          :class="{ active: currentTab === tab }"
          @tap="currentTab = tab"
        >
          {{ tab }}
        </view>
      </view>
  
      <scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore">
        <view class="item-card" v-for="item in displayList" :key="item.itemID">
          <image :src="item.images[0]" mode="aspectFill" class="item-cover" />
          <view class="item-content">
            <view class="item-title">{{ item.title }}</view>
            <view class="item-info">
              <text class="tag" :class="item.type">{{ item.type === 'LOST' ? '寻物' : '招领' }}</text>
              <text class="loc">{{ item.location }}</text>
            </view>
            <view class="item-footer">
              <text class="time">{{ item.publishTime }}</text>
              <text v-if="item.rewardPoints > 0" class="reward">💰 {{ item.rewardPoints }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  
  const currentTab = ref('全部')
  const allItems = ref([
    // 模拟从 /item/hall 获取的数据
    { itemID: '1', title: '丢失黑色耳机', type: 'LOST', location: '图书馆三楼', publishTime: '10:00', images: ['https://via.placeholder.com/150'], rewardPoints: 100 },
    { itemID: '2', title: '捡到学生证', type: 'FOUND', location: '食堂二楼', publishTime: '11:30', images: ['https://via.placeholder.com/150'], rewardPoints: 0 }
  ])
  
  const displayList = computed(() => {
    if (currentTab.value === '全部') return allItems.value
    const typeMap = { '寻物': 'LOST', '招领': 'FOUND' }
    return allItems.value.filter(item => item.type === typeMap[currentTab.value])
  })
  
  const loadMore = () => { /* 触发分页加载 /item/hall?page=... */ }
  </script>
  
  <style lang="scss" scoped>
  .container { background: #f8f8f8; height: 100vh; display: flex; flex-direction: column; }
  .tab-header {
    display: flex; background: #fff; padding: 20rpx 0;
    .tab-item {
      flex: 1; text-align: center; font-size: 28rpx; color: #666;
      &.active { color: #007aff; font-weight: bold; position: relative; }
      &.active::after {
        content: ''; position: absolute; bottom: -10rpx; left: 40%; width: 20%; height: 4rpx; background: #007aff;
      }
    }
  }
  .list-scroll { flex: 1; padding: 20rpx; box-sizing: border-box; }
  .item-card {
    background: #fff; border-radius: 16rpx; display: flex; padding: 20rpx; margin-bottom: 20rpx;
    .item-cover { width: 160rpx; height: 160rpx; border-radius: 12rpx; }
    .item-content {
      flex: 1; margin-left: 20rpx; display: flex; flex-direction: column; justify-content: space-between;
      .item-title { font-size: 30rpx; font-weight: bold; }
      .item-info {
        display: flex; align-items: center; margin: 10rpx 0;
        .tag {
          font-size: 20rpx; padding: 2rpx 10rpx; border-radius: 4rpx; margin-right: 15rpx;
          &.LOST { background: #fff1f0; color: #ff4d4f; }
          &.FOUND { background: #e6f7ff; color: #1890ff; }
        }
        .loc { font-size: 24rpx; color: #888; }
      }
      .item-footer {
        display: flex; justify-content: space-between;
        .time { font-size: 22rpx; color: #bbb; }
        .reward { font-size: 24rpx; color: #ff9800; font-weight: bold; }
      }
    }
  }
  </style>