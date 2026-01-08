<template>
    <view class="list-container">
      <view class="item-list">
        <view 
          class="item-card" 
          v-for="(item, index) in dataList" 
          :key="index"
          @tap="goDetail(item.itemID)"
        >
          <image class="item-img" :src="item.images[0]" mode="aspectFill" />
          <view class="item-info">
            <view class="info-top">
              <text class="item-name">{{ item.title }}</text>
              <text class="item-tag" :class="item.type === 'LOST' ? 'tag-red' : 'tag-blue'">
                {{ item.type === 'LOST' ? '寻物' : '招领' }}
              </text>
            </view>
            <text class="item-loc">📍 {{ item.location }}</text>
            <text class="item-time">🕐 {{ item.publishTime }}</text>
          </view>
        </view>
      </view>
      
      <view v-if="dataList.length === 0" class="empty">
        <text>暂无相关物品信息</text>
      </view>
    </view>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  
  const dataList = ref<any[]>([])
  const pageTitle = ref('')
  
  onMounted((options: any) => {
    const mode = options?.mode || 'latest'
    pageTitle.value = mode === 'latest' ? '最新动态' : '30天待处理物品'
    uni.setNavigationBarTitle({ title: pageTitle.value })
    
    loadData(mode)
  })
  
  const loadData = (mode: string) => {
    // 这里调用您提供的 /item/hall 接口
    // 模拟数据结构
    dataList.value = [
      {
        itemID: 'ITEM_001',
        type: 'LOST',
        title: '黑色遮阳伞',
        location: '通嘉楼 3 楼',
        publishTime: '2025-12-30 10:00',
        images: ['https://via.placeholder.com/150']
      },
      {
        itemID: 'ITEM_002',
        type: 'FOUND',
        title: '同济学生卡',
        location: '食堂二楼',
        publishTime: '15分钟前',
        images: ['https://via.placeholder.com/150']
      }
    ]
  }
  
  const goDetail = (id: string) => {
    uni.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
  </script>
  
  <style lang="scss" scoped>
  .list-container {
    padding: 20rpx;
    background-color: #f5f5f5;
    min-height: 100vh;
  }
  
  .item-card {
    display: flex;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03);
    
    .item-img {
      width: 180rpx;
      height: 180rpx;
      border-radius: 12rpx;
      background-color: #eee;
    }
    
    .item-info {
      flex: 1;
      margin-left: 24rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      
      .info-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .item-name { font-size: 32rpx; font-weight: bold; color: #333; }
        .item-tag {
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          &.tag-red { background: #fff1f0; color: #ff4d4f; }
          &.tag-blue { background: #e6f7ff; color: #1890ff; }
        }
      }
      
      .item-loc { font-size: 26rpx; color: #666; }
      .item-time { font-size: 24rpx; color: #999; }
    }
  }
  
  .empty { text-align: center; color: #ccc; margin-top: 100rpx; font-size: 28rpx; }
  </style>