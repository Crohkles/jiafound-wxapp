<template>
  <view class="my-disputes-container">
    <!-- 列表内容 -->
    <scroll-view 
      scroll-y 
      class="dispute-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="disputeList.length > 0" class="list-content">
        <view 
          v-for="item in disputeList" 
          :key="item.ticketId"
          class="dispute-item"
          @click="viewDetail(item)"
        >
          <!-- 工单头部 -->
          <view class="item-header">
            <view class="ticket-info">
              <text class="ticket-id">工单号: {{ item.ticketId.slice(0, 12) }}...</text>
              <view :class="['status-badge', getStatusClass(item.status)]">
                {{ getStatusText(item.status) }}
              </view>
            </view>
            <view class="relation-type">
              <uni-icons 
                :type="item.relationType === 'Initiated by Me' ? 'upload' : 'download'" 
                size="14" 
                :color="item.relationType === 'Initiated by Me' ? '#007aff' : '#ff9500'"
              ></uni-icons>
              <text>{{ item.relationType === 'Initiated by Me' ? '我发起' : '对方发起' }}</text>
            </view>
          </view>

          <!-- 维权理由 -->
          <view class="reason-section">
            <text class="reason-label">维权理由:</text>
            <text class="reason-text">{{ item.reasonSummary }}</text>
          </view>

          <!-- 时间信息 -->
          <view class="time-section">
            <view class="time-item">
              <uni-icons type="calendar" size="14" color="#999"></uni-icons>
              <text>创建: {{ formatTime(item.createTime) }}</text>
            </view>
            <view class="time-item deadline">
              <uni-icons type="loop" size="14" color="#ff3b30"></uni-icons>
              <text>截止: {{ formatTime(item.deadline) }}</text>
            </view>
          </view>

          <!-- 箭头 -->
          <view class="arrow-icon">
            <uni-icons type="right" size="16" color="#ccc"></uni-icons>
          </view>
        </view>

        <!-- 加载提示 -->
        <view v-if="hasMore" class="loading-tip">
          <uni-icons type="spinner-cycle" size="20" color="#999"></uni-icons>
          <text>加载中...</text>
        </view>
        <view v-else-if="disputeList.length > 0" class="no-more">
          没有更多了
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <uni-icons type="folder-add" size="80" color="#ccc"></uni-icons>
        <text class="empty-text">暂无纠纷记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface DisputeItem {
  claimId: string
  createTime: string
  deadline: string
  initiatorRole: string | null
  reasonSummary: string
  relationType: string
  status: string
  ticketId: string
}

interface ApiResponse {
  code: number
  msg: string
  data: {
    list: DisputeItem[]
    total: number
  }
}

const disputeList = ref<DisputeItem[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(true)
const loading = ref(false)
const refreshing = ref(false)

// 页面加载
onMounted(() => {
  loadDisputeList()
})

// 加载列表
const loadDisputeList = async () => {
  if (loading.value || !hasMore.value) return

  try {
    loading.value = true
    
    const response = await uni.request({
      url: 'http://localhost:8082/api/v1/disputes/my-disputes',
      method: 'GET',
      data: {
        pageNum: pageNum.value,
        pageSize: pageSize.value
      }
    })

    const resData = response.data as ApiResponse

    if (resData.code === 200) {
      const newList = resData.data.list || []
      
      if (pageNum.value === 1) {
        disputeList.value = newList
      } else {
        disputeList.value.push(...newList)
      }
      
      total.value = resData.data.total
      hasMore.value = disputeList.value.length < total.value
    } else {
      uni.showToast({
        title: resData.msg || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载纠纷列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!hasMore.value || loading.value) return
  pageNum.value++
  loadDisputeList()
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  pageNum.value = 1
  hasMore.value = true
  loadDisputeList()
}

// 查看详情
const viewDetail = (item: DisputeItem) => {
  const isInitiator = item.relationType === 'Initiated by Me'
  uni.navigateTo({
    url: `/pages/dispute/disputeDetails?ticketId=${item.ticketId}&isInitiator=${isInitiator}`
  })
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'Reviewing': '审核中',
    'Completed': '已完成',
    'Rejected': '已驳回',
    'Processing': '处理中',
    'Revoked': '已撤销'
  }
  return statusMap[status] || status
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    'Reviewing': 'reviewing',
    'Completed': 'completed',
    'Rejected': 'rejected',
    'Processing': 'processing',
    'Revoked': 'revoked'
  }
  return classMap[status] || ''
}
</script>

<style lang="scss" scoped>
.my-disputes-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.dispute-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.list-content {
  .dispute-item {
    position: relative;
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    padding-right: 60rpx; // 为箭头留出空间
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    width: 80%;
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;
      
      .ticket-info {
        flex: 1;
        min-width: 0; // 允许内容收缩
        margin-right: 20rpx;
        
        .ticket-id {
          display: block;
          font-size: 24rpx;
          color: #999;
          margin-bottom: 10rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4rpx 12rpx;
          border-radius: 4rpx;
          font-size: 22rpx;
          
          &.reviewing {
            background-color: #fff3e0;
            color: #ff9500;
          }
          
          &.completed {
            background-color: #e8f5e9;
            color: #4caf50;
          }
          
          &.rejected {
            background-color: #ffebee;
            color: #f44336;
          }
          
          &.processing {
            background-color: #e3f2fd;
            color: #2196f3;
          }
          
          &.revoked {
            background-color: #f5f5f5;
            color: #999;
          }
        }
      }
      
      .relation-type {
        display: flex;
        align-items: center;
        gap: 5rpx;
        font-size: 24rpx;
        color: #666;
        white-space: nowrap;
        flex-shrink: 0; // 防止被压缩
      }
    }
    
    .reason-section {
      padding: 20rpx 0;
      border-top: 1rpx solid #f0f0f0;
      border-bottom: 1rpx solid #f0f0f0;
      
      .reason-label {
        font-size: 26rpx;
        color: #999;
        margin-right: 10rpx;
      }
      
      .reason-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2; // 限制为2行
        -webkit-box-orient: vertical;
      }
    }
    
    .time-section {
      display: flex;
      justify-content: space-between;
      gap: 20rpx;
      margin-top: 20rpx;
      
      .time-item {
        display: flex;
        align-items: center;
        gap: 5rpx;
        font-size: 24rpx;
        color: #999;
        flex: 1;
        min-width: 0; // 允许收缩
        
        text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        &.deadline {
          color: #ff3b30;
        }
      }
    }
    
    .arrow-icon {
      position: absolute;
      right: 30rpx;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}

.loading-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}

.no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  
  .empty-text {
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #999;
  }
}
</style>
