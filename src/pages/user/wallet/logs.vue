<template>
  <view class="logs-page">
    <!-- 流水列表 -->
    <view class="logs-list">
      <view v-if="loading && logs.length === 0" class="loading">
        <text>加载中...</text>
      </view>

      <view v-else-if="logs.length === 0" class="empty">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无流水记录</text>
      </view>

      <view v-else>
        <view
          v-for="log in logs"
          :key="log.logId"
          class="log-item"
        >
          <view class="log-info">
            <view class="log-type">{{ getTypeName(log.type) }}</view>
            <view class="log-time">{{ formatTime(log.createTime) }}</view>
          </view>
          <view
            class="log-amount"
            :class="{ 'positive': log.amount > 0, 'negative': log.amount < 0 }"
          >
            {{ log.amount > 0 ? '+' : '' }}{{ log.amount }}
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
      <text>加载更多</text>
    </view>

    <view v-if="loading && logs.length > 0" class="loading-more">
      <text>加载中...</text>
    </view>

    <view v-if="!hasMore && logs.length > 0" class="no-more">
      <text>没有更多了</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { coinApi } from '@/api/user'
import type { CoinLog } from '@/types/user'

// 状态
const loading = ref(false)
const logs = ref<CoinLog[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 是否有更多数据
const hasMore = ref(true)

/**
 * 页面加载时获取第一页数据
 */
onMounted(() => {
  fetchLogs()
})

/**
 * 获取流水记录
 */
const fetchLogs = async () => {
  try {
    loading.value = true
    const res = await coinApi.getLogs({
      page: currentPage.value,
      pageSize: pageSize.value
    })

    if (currentPage.value === 1) {
      logs.value = res.data.list
    } else {
      logs.value = [...logs.value, ...res.data.list]
    }

    total.value = res.data.total
    hasMore.value = logs.value.length < total.value
  } catch (error) {
    console.error('获取流水失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 加载更多
 */
const loadMore = () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  fetchLogs()
}

/**

 * 流水类型名称
 */
const getTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'RECHARGE': '充值',
    'WITHDRAW': '提现',
    'FREEZE': '冻结',
    'REWARD': '悬赏支出',
    'SETTLE': '结算收入',
    'UNFREEZE': '解冻',
    // 兼容旧格式
    'Recharge': '充值',
    'Withdraw': '提现',
    'Freeze': '冻结',
    'Reward': '悬赏支出',
    'Settle': '结算收入'
  }
  return typeMap[type] || type
}

/**
 * 时间格式化
 */
const formatTime = (time: string): string => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}`
}
</script>

<style lang="scss" scoped>
.logs-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx 30rpx;
}

.log-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.log-info {
  flex: 1;

  .log-type {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 10rpx;
  }

  .log-time {
    font-size: 24rpx;
    color: #999;
  }
}

.log-amount {
  font-size: 34rpx;
  font-weight: bold;

  &.positive {
    color: #07c160;
  }

  &.negative {
    color: #fa5151;
  }
}

/* 加载状态 */
.loading,
.loading-more,
.no-more {
  padding: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}

.load-more {
  padding: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #576b95;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

/* 空状态 */
.empty {
  padding: 200rpx 0;
  text-align: center;

  .empty-icon {
    display: block;
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

  .empty-text {
    display: block;
    font-size: 28rpx;
    color: #999;
  }
}
</style>
