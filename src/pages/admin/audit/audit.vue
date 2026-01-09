<template>
  <view class="audit-container">
    <!-- 顶部统计 -->
    <view class="stats-bar">
      <text class="stats-text">待审核: {{ total }} 条</text>
    </view>

    <!-- 审核列表 -->
    <scroll-view 
      class="list-container" 
      scroll-y
      @scrolltolower="loadMore"
    >
      <uni-list v-if="auditList.length > 0">
        <uni-list-item 
          v-for="item in auditList" 
          :key="item.itemID"
          clickable
        >
          <template v-slot:body>
            <view class="audit-item">
              <view class="item-header">
                <text class="item-id">ID: {{ item.itemID }}</text>
                <text class="submit-time">{{ item.submitTime }}</text>
              </view>
              
              <view class="item-info">
                <view class="info-row">
                  <text class="label">发布者:</text>
                  <text class="value">{{ item.publisherNickname }}</text>
                </view>
                <view class="info-row">
                  <text class="label">描述:</text>
                  <text class="value">{{ item.description }}</text>
                </view>
              </view>

              <view class="action-buttons">
                <button 
                  class="btn btn-reject" 
                  @click.stop="handleAudit(item.itemID, 'REJECT')"
                >
                  拒绝
                </button>
                <button 
                  class="btn btn-approve" 
                  @click.stop="handleAudit(item.itemID, 'APPROVE')"
                >
                  通过
                </button>
              </view>
            </view>
          </template>
        </uni-list-item>
      </uni-list>
      
      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-state">
        <uni-icons type="checkmarkempty" size="60" color="#ccc"></uni-icons>
        <text>暂无待审核内容</text>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="auditList.length > 0" class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="hasMore">下拉加载更多</text>
        <text v-else class="no-more">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { http } from '@/utils/http'

// 审核项数据类型
interface AuditItem {
  itemID: string
  publisherNickname: string
  description: string
  submitTime: string
}

interface ApiResponse {
  code: number
  msg: string
  data: any
}

interface AuditPageResult {
  total: number
  list: AuditItem[]
}

// 数据状态
const auditList = ref<AuditItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const hasMore = ref(true)

// 加载审核列表
const loadAuditList = async (page: number = 1) => {
  if (loading.value) return
  
  try {
    loading.value = true
    
    const response = await http.request({
      url: 'http://127.0.0.1:8082/api/v1/admin/audit/pending-list',
      method: 'GET',
      data: {
        page: page,
        pageSize: pageSize.value
      }
    })

    const resData = response as ApiResponse
    console.log('审核列表响应数据:', response)

    if (resData.code === 200) {
      const result = resData.data as AuditPageResult
      
      if (page === 1) {
        auditList.value = result.list
      } else {
        auditList.value = [...auditList.value, ...result.list]
      }
      
      total.value = result.total
      // console.log('审核列表加载成功:', resData.data)
      currentPage.value = page
      hasMore.value = auditList.value.length < result.total
    } else {
      uni.showToast({
        title: resData.msg || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
    console.error('加载审核列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadAuditList(currentPage.value + 1)
  }
}

// 处理审核
const handleAudit = (itemID: string, decision: 'APPROVE' | 'REJECT') => {
  const actionText = decision === 'APPROVE' ? '通过' : '拒绝'
  
  uni.showModal({
    title: '确认审核',
    content: `确定要${actionText}这条内容吗？`,
    success: async (res) => {
      if (res.confirm) {
        await submitAudit(itemID, decision)
      }
    }
  })
}

// 提交审核决策
const submitAudit = async (itemID: string, decision: string) => {
  try {
    uni.showLoading({ title: '提交中...' })
    
    const response = await http.request({
      url: 'http://127.0.0.1:8082/api/v1/admin/audit/action',
      method: 'PUT',
      data: {
        itemID: itemID,
        decision: decision
      }
    })

    uni.hideLoading()
    const resData = response as ApiResponse

    if (resData.code === 200) {
      uni.showToast({
        title: '审核成功',
        icon: 'success'
      })
      
      // 从列表中移除已审核的项
      auditList.value = auditList.value.filter(item => item.itemID !== itemID)
      total.value = Math.max(0, total.value - 1)
      
      // 如果当前页面项少于pageSize且还有更多数据，自动加载下一页
      if (auditList.value.length < pageSize.value && hasMore.value) {
        loadAuditList(currentPage.value)
      }
    } else {
      uni.showToast({
        title: resData.msg || '审核失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
    console.error('提交审核失败:', error)
  }
}

onMounted(() => {
  loadAuditList(1)
})
</script>

<style lang="scss" scoped>
.audit-container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.stats-bar {
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #eee;
  
  .stats-text {
    font-size: 28rpx;
    color: #666;
  }
}

.list-container {
  height: calc(100vh - 80rpx);
}

.audit-item {
  padding: 30rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    min-height: 40rpx;
    gap: 20rpx;
    width: 600rpx;
    
    .item-id {
      font-size: 24rpx;
      color: #999;
      min-width: 200rpx;
      max-width: 400rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .submit-time {
      font-size: 24rpx;
      color: #999;
      flex-shrink: 0;
      width: 280rpx;
      text-align: right;
    }
  }
  
  .item-info {
    margin-bottom: 30rpx;
    flex: 1;
    
    .info-row {
      display: flex;
      margin-bottom: 16rpx;
      font-size: 28rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        color: #666;
        margin-right: 10rpx;
        flex-shrink: 0;
      }
      
      .value {
        color: #333;
        flex: 1;
      }
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 20rpx;
    width: 100%;
    
    .btn {
      width: calc(50% - 10rpx);
      flex-shrink: 0;
      padding: 12rpx 0;
      border-radius: 6rpx;
      font-size: 24rpx;
      border: none;
      line-height: 1.4;
      
      &::after {
        border: none;
      }
      
      &.btn-reject {
        background-color: #fff;
        color: #ff3b30;
        border: 1rpx solid #ff3b30;
        width: 200rpx;
      }
      
      &.btn-approve {
        background-color: #007aff;
        color: #fff;
        width: 200rpx;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  
  text {
    margin-top: 20rpx;
    color: #999;
    font-size: 28rpx;
  }
}

.load-more {
  padding: 40rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999;
  
  .no-more {
    color: #ccc;
  }
}
</style>
