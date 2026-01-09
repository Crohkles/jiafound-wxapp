<template>
  <view class="wallet-page">
    <!-- 资产概览卡片 -->
    <view class="balance-card">
      <view class="balance-bg"></view>
      <view class="balance-content">
        <text class="balance-label">账户余额（赏币）</text>
        <text class="balance-value">{{ userStore.coinBalance.toFixed(2) }}</text>
        <view class="balance-row">
          <view class="balance-item">
            <text class="item-label">可用</text>
            <text class="item-value">{{ userStore.coinBalance.toFixed(2) }}</text>
          </view>
          <view class="balance-divider"></view>
          <view class="balance-item">
            <text class="item-label">冻结</text>
            <text class="item-value">{{ userStore.frozenBalance.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 充值区域 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">💰 充值赏币（公益限额）</text>
        <text class="section-desc">支持微信支付</text>
      </view>
      
      <view class="recharge-grid">
        <view
          v-for="amount in rechargeAmounts"
          :key="amount"
          class="recharge-item"
          :class="{ active: selectedAmount === amount }"
          @click="selectedAmount = amount"
        >
          <text class="amount-value">{{ amount }}</text>
          <text class="amount-unit">元</text>
        </view>
      </view>

      <button 
        class="action-btn primary"
        :disabled="recharging || !selectedAmount"
        @click="handleRecharge"
      >
        {{ recharging ? '处理中...' : '立即充值' }}
      </button>
    </view>

    <!-- 提现区域 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">💸 提现赏币</text>
        <text class="section-desc">提现到微信零钱</text>
      </view>

      <view class="withdraw-form">
        <view class="form-item">
          <text class="form-label">提现金额（赏币）</text>
          <view class="input-wrapper">
            <input
              class="form-input"
              v-model.number="withdrawAmount"
              type="digit"
              placeholder="请输入提现金额"
              placeholder-class="placeholder"
            />
            <text class="input-unit">币</text>
          </view>
        </view>

        <view class="rate-tip">
          <text class="tip-icon">ℹ️</text>
          <text class="tip-text">当前汇率：100赏币 = 1元</text>
        </view>

        <view class="withdraw-info">
          <text class="info-text">预计到账：¥{{ withdrawMoney }}</text>
        </view>
      </view>

      <button 
        class="action-btn"
        :disabled="withdrawing || !withdrawAmount"
        @click="handleWithdraw"
      >
        {{ withdrawing ? '处理中...' : '确认提现' }}
      </button>
    </view>

    <!-- 近期流水 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">📊 近期流水</text>
        <text class="section-link" @click="handleViewMore">查看全部 ›</text>
      </view>

      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="logs.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无流水记录</text>
      </view>

      <view v-else class="log-list">
        <view
          v-for="log in logs.slice(0, 5)"
          :key="log.logId"
          class="log-item"
        >
          <view class="log-left">
            <text class="log-type">{{ getTypeName(log.type) }}</text>
            <text class="log-time">{{ formatTime(log.createTime) }}</text>
          </view>
          <text 
            class="log-amount"
            :class="log.amount > 0 ? 'income' : 'expense'"
          >
            {{ log.amount > 0 ? '+' : '' }}{{ log.amount }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { coinApi } from '@/api/user'
import { useUserStore } from '@/stores/user'
import type { CoinLog } from '@/types/user'

const userStore = useUserStore()

// 充值金额选项
const rechargeAmounts = [1, 2, 5, 10] as const
const selectedAmount = ref<1 | 2 | 5 | 10 | null>(null)
const recharging = ref(false)

// 提现相关
const withdrawAmount = ref<number | null>(null)
const withdrawing = ref(false)

// 预计到账金额（100赏币 = 1元）
const withdrawMoney = computed(() => {
  if (!withdrawAmount.value) return '0.00'
  return (withdrawAmount.value / 100).toFixed(2)
})

// 流水记录
const logs = ref<CoinLog[]>([])
const loading = ref(false)

/**
 * 加载流水记录
 */
const fetchLogs = async () => {
  try {
    loading.value = true
    const res = await coinApi.getLogs({
      page: 1,
      pageSize: 5
    })
    logs.value = res.data.list
  } catch (error) {
    console.error('获取流水失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 充值
 */
const handleRecharge = async () => {
  if (!selectedAmount.value) {
    uni.showToast({
      title: '请选择充值金额',
      icon: 'none'
    })
    return
  }

  try {
    recharging.value = true

    // 调用充值接口（后端已模拟，无返回余额）
    await coinApi.recharge({
      amount: selectedAmount.value
    })

    // 模拟微信支付
    // 注意：实际开发中，后端应该返回支付参数（prepay_id等）
    uni.showModal({
      title: '支付确认',
      content: `确认支付 ${selectedAmount.value} 元充值赏币？`,
      success: async (modalRes) => {
        if (modalRes.confirm) {
          // 后端已模拟支付，这里直接视为成功，无需调起微信收银台
          uni.showToast({
            title: '充值成功',
            icon: 'success'
          })

          // 刷新数据
          await userStore.refreshUserInfo()
          await fetchLogs()
          selectedAmount.value = null
        }
      }
    })
  } catch (error: any) {
    console.error('充值失败:', error)
    // 错误已在 http 工具中处理
  } finally {
    recharging.value = false
  }
}

/**
 * 提现
 */
const handleWithdraw = async () => {
  if (!withdrawAmount.value) {
    uni.showToast({
      title: '请输入提现金额',
      icon: 'none'
    })
    return
  }

  if (withdrawAmount.value <= 0) {
    uni.showToast({
      title: '提现金额必须大于0',
      icon: 'none'
    })
    return
  }

  // 检查余额
  if (withdrawAmount.value > userStore.coinBalance) {
    uni.showToast({
      title: '余额不足',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 最小提现金额限制（100赏币 = 1元）
  if (withdrawAmount.value < 100) {
    uni.showToast({
      title: '最小提现100赏币',
      icon: 'none'
    })
    return
  }

  // 二次确认
  uni.showModal({
    title: '提现确认',
    content: `确认提现 ${withdrawAmount.value} 赏币（约 ¥${withdrawMoney.value}）到微信零钱？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          withdrawing.value = true

          // 调用提现接口（后端已模拟，无返回余额）
          await coinApi.withdraw({
            coinAmount: withdrawAmount.value!
          })

          uni.showToast({
            title: '提现成功',
            icon: 'success'
          })

          // 刷新数据
          await userStore.refreshUserInfo()
          await fetchLogs()
          withdrawAmount.value = null
        } catch (error: any) {
          console.error('提现失败:', error)
          // 错误已在 http 工具中处理
        } finally {
          withdrawing.value = false
        }
      }
    }
  })
}

/**
 * 查看更多流水
 */
const handleViewMore = () => {
  uni.navigateTo({
    url: '/pages/user/wallet/logs'
  })
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
  if (!time) return ''
  
  const date = new Date(time)
  // 检查日期是否有效
  if (isNaN(date.getTime())) return time
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 一分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 一小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 其他日期
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 页面显示时刷新数据
 */
onShow(async () => {
  // 刷新用户信息（余额）
  if (userStore.isLoggedIn) {
    await userStore.refreshUserInfo().catch(error => {
      console.error('刷新用户信息失败:', error)
    })
  }
  // 刷新流水记录
  await fetchLogs()
})
</script>

<style lang="scss" scoped>
.wallet-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 资产概览卡片 */
.balance-card {
  position: relative;
  margin: 0 0 24rpx;
  overflow: hidden;
}

.balance-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.balance-content {
  position: relative;
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.balance-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 16rpx;
}

.balance-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 32rpx;
}

.balance-row {
  display: flex;
  align-items: center;
  gap: 48rpx;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.item-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.item-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.balance-divider {
  width: 2rpx;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.3);
}

/* 区块卡片 */
.section-card {
  margin: 0 32rpx 24rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.section-desc {
  font-size: 24rpx;
  color: #999999;
}

.section-link {
  font-size: 26rpx;
  color: #667eea;
}

/* 充值网格 */
.recharge-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.recharge-item {
  height: 160rpx;
  background-color: #f8f8f8;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;

    .amount-value,
    .amount-unit {
      color: #ffffff;
    }
  }
}

.amount-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
}

.amount-unit {
  font-size: 24rpx;
  color: #666666;
}

/* 提现表单 */
.withdraw-form {
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 16rpx;
  display: block;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  height: 88rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 80rpx 0 24rpx;
  font-size: 32rpx;
  color: #333333;
}

.input-unit {
  position: absolute;
  right: 24rpx;
  font-size: 28rpx;
  color: #999999;
}

.placeholder {
  color: #999999;
}

.rate-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  background-color: #fff9e6;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.tip-icon {
  font-size: 28rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #999999;
}

.withdraw-info {
  padding: 16rpx 0;
  text-align: center;
}

.info-text {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
}

/* 操作按钮 */
.action-btn {
  width: 100%;
  height: 88rpx;
  background-color: #f8f8f8;
  color: #333333;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 12rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }

  &:active:not([disabled]) {
    opacity: 0.8;
  }

  &[disabled] {
    opacity: 0.5;
  }
}

/* 流水列表 */
.loading-state,
.empty-state {
  padding: 80rpx 0;
  text-align: center;
  color: #999999;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.log-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.log-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.log-type {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.log-time {
  font-size: 24rpx;
  color: #999999;
}

.log-amount {
  font-size: 32rpx;
  font-weight: bold;

  &.income {
    color: #52c41a;
  }

  &.expense {
    color: #ff4757;
  }
}
</style>
