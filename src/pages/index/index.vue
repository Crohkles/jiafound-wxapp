<template>
  <view class="container">
    <view class="search-section">
      <uni-search-bar 
        placeholder="搜索嘉定校区失物..." 
        @confirm="onSearch" 
        border-radius="20"
      />
    </view>

    <view class="stat-card">
      <uni-grid :column="2" :show-border="false" :square="false">
        <uni-grid-item>
          <view class="stat-item">
            <text class="stat-num">12</text>
            <text class="stat-label">今日拾取</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="stat-item">
            <text class="stat-num">5</text>
            <text class="stat-label">寻物启事</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </view>

    <view class="list-section">
      <uni-section title="嘉园最新动态" type="line">
        <uni-list>
          <uni-list-item 
            title="黑色遮阳伞" 
            note="拾取地点：通嘉楼 3 楼" 
            thumb="https://via.placeholder.com/100" 
            thumb-size="lg"
            rightText="刚刚"
          />
          <uni-list-item 
            title="同济学生卡 (张*强)" 
            note="拾取地点：嘉定校区食堂二楼" 
            thumb="https://via.placeholder.com/100" 
            thumb-size="lg"
            rightText="15分钟前"
          />
        </uni-list>
      </uni-section>
    </view>

    <button class="fab-btn" @click="goPublish">
      <uni-icons type="plusempty" size="25" color="#fff"></uni-icons>
      <text>发布</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('嘉园拾遗')

const onSearch = (res: any) => {
  console.log('搜索内容：', res.value)
}

const goPublish = () => {
  uni.showToast({ title: '去发布页面', icon: 'none' })
}
</script>

<style lang="scss">
.container {
  padding: 10px;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.search-section {
  margin-bottom: 10px;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px 0;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-num {
    font-size: 40rpx;
    font-weight: bold;
    color: #007aff; // 同济大学常用的蓝色调
  }
  
  .stat-label {
    font-size: 24rpx;
    color: #666;
    margin-top: 4px;
  }
}

.fab-btn {
  position: fixed;
  bottom: 40px;
  right: 20px;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background-color: #007aff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,122,255,0.4);
  
  text {
    font-size: 20rpx;
    color: #fff;
    margin-top: -4px;
  }
}

// 隐藏原生按钮默认边框
.fab-btn::after {
  border: none;
}
</style>