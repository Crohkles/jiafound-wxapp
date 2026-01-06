<template>
  <view class="dispute-container">
    <!-- 顶部标签切换 -->
    <view class="tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        <text>{{ tab.name }}</text>
        <text class="badge" v-if="tab.count > 0">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 纠纷工单列表 -->
    <scroll-view 
      v-if="!selectedTicket" 
      class="list-container" 
      scroll-y
    >
      <uni-list v-if="disputeList.length > 0">
        <uni-list-item 
          v-for="item in disputeList" 
          :key="item.ticket_id"
          :title="item.item_name"
          :note="`工单ID: ${item.ticket_id}`"
          clickable
          @click="selectTicket(item)"
        >
          <template v-slot:header>
            <view class="ticket-status" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </view>
          </template>
          <template v-slot:footer>
            <view class="ticket-info">
              <text class="time">{{ item.create_time }}</text>
              <text class="deadline" v-if="item.deadline">
                截止: {{ item.deadline }}
              </text>
            </view>
          </template>
        </uni-list-item>
      </uni-list>
      
      <view v-else class="empty-state">
        <uni-icons type="info" size="60" color="#ccc"></uni-icons>
        <text>暂无纠纷工单</text>
      </view>
    </scroll-view>

    <!-- 纠纷详情页 -->
    <scroll-view v-else class="detail-container" scroll-y>
      <view class="detail-header">
        <view class="back-btn" @click="selectedTicket = null">
          <uni-icons type="back" size="20"></uni-icons>
          <text>返回列表</text>
        </view>
        <view class="ticket-title">
          <text class="item-name">{{ selectedTicket.item_name }}</text>
          <view class="status-tag" :class="getStatusClass(selectedTicket.status)">
            {{ getStatusText(selectedTicket.status) }}
          </view>
        </view>
      </view>

      <!-- 基本信息 -->
      <uni-section title="基本信息" type="line">
        <view class="info-section">
          <view class="info-row">
            <text class="label">工单编号:</text>
            <text class="value">{{ selectedTicket.ticket_id }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请人:</text>
            <text class="value">{{ selectedTicket.applicant_name }}</text>
          </view>
          <view class="info-row">
            <text class="label">对方:</text>
            <text class="value">{{ selectedTicket.respondent_name }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间:</text>
            <text class="value">{{ selectedTicket.create_time }}</text>
          </view>
          <view class="info-row">
            <text class="label">截止时间:</text>
            <text class="value deadline">{{ selectedTicket.deadline }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请原因:</text>
            <text class="value">{{ selectedTicket.reason }}</text>
          </view>
        </view>
      </uni-section>

      <!-- 申请人证据 -->
      <uni-section title="申请人证据" type="line">
        <view class="evidence-section">
          <view class="evidence-images" v-if="selectedTicket.applicant_evidence.length > 0">
            <image 
              v-for="(img, idx) in selectedTicket.applicant_evidence" 
              :key="idx"
              :src="img" 
              class="evidence-img"
              mode="aspectFill"
              @click="previewImage(selectedTicket.applicant_evidence, idx)"
            />
          </view>
          <view v-else class="no-evidence">
            <text>暂无证据</text>
          </view>
          <view class="evidence-remark" v-if="selectedTicket.applicant_remark">
            <text class="remark-label">补充说明:</text>
            <text>{{ selectedTicket.applicant_remark }}</text>
          </view>
        </view>
      </uni-section>

      <!-- 对方证据 -->
      <uni-section title="对方证据" type="line">
        <view class="evidence-section">
          <view class="evidence-images" v-if="selectedTicket.respondent_evidence.length > 0">
            <image 
              v-for="(img, idx) in selectedTicket.respondent_evidence" 
              :key="idx"
              :src="img" 
              class="evidence-img"
              mode="aspectFill"
              @click="previewImage(selectedTicket.respondent_evidence, idx)"
            />
          </view>
          <view v-else class="no-evidence">
            <text>暂无证据</text>
          </view>
          <view class="evidence-remark" v-if="selectedTicket.respondent_remark">
            <text class="remark-label">补充说明:</text>
            <text>{{ selectedTicket.respondent_remark }}</text>
          </view>
        </view>
      </uni-section>

      <!-- 管理员裁决区 -->
      <uni-section v-if="selectedTicket.status === 'Pending'" title="管理员裁决" type="line">
        <view class="ruling-section">
          <view class="form-item">
            <text class="form-label">裁决结果:</text>
            <picker 
              :range="rulingOptions" 
              range-key="label"
              @change="onRulingChange"
              :value="rulingForm.result"
            >
              <view class="picker">
                {{ rulingOptions[rulingForm.result].label }}
                <uni-icons type="arrow-down" size="14"></uni-icons>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label">扣除信用分:</text>
            <input 
              v-model.number="rulingForm.deductCredit" 
              type="number" 
              class="form-input"
              placeholder="请输入扣除信用分"
            />
          </view>

          <view class="form-item">
            <text class="form-label">裁决说明:</text>
            <textarea 
              v-model="rulingForm.remark" 
              class="form-textarea"
              placeholder="请输入裁决说明..."
              :maxlength="500"
            />
            <text class="char-count">{{ rulingForm.remark.length }}/500</text>
          </view>

          <button class="submit-btn" @click="submitRuling">提交裁决</button>
        </view>
      </uni-section>

      <!-- 裁决结果展示 -->
      <uni-section v-if="selectedTicket.status === 'Closed'" title="裁决结果" type="line">
        <view class="ruling-result">
          <view class="result-row">
            <text class="label">裁决结果:</text>
            <text class="value highlight">{{ getRulingText(selectedTicket.ruling_result || '') }}</text>
          </view>
          <view class="result-row">
            <text class="label">扣除信用分:</text>
            <text class="value">{{ selectedTicket.deduct_credit }}分</text>
          </view>
          <view class="result-row">
            <text class="label">裁决说明:</text>
            <text class="value">{{ selectedTicket.ruling_remark }}</text>
          </view>
          <view class="result-row">
            <text class="label">裁决时间:</text>
            <text class="value">{{ selectedTicket.ruling_time }}</text>
          </view>
        </view>
      </uni-section>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 标签页
const tabs = ref([
  { name: '待处理', count: 3 },
  { name: '已裁决', count: 0 },
  { name: '全部', count: 3 }
])

const currentTab = ref(0)

// 纠纷工单列表
interface DisputeTicket {
  ticket_id: string
  claim_id: string
  item_name: string
  applicant_name: string
  respondent_name: string
  reason: string
  status: 'Pending' | 'Closed' | 'Revoked'
  create_time: string
  deadline?: string
  applicant_evidence: string[]
  applicant_remark?: string
  respondent_evidence: string[]
  respondent_remark?: string
  ruling_result?: string
  ruling_remark?: string
  ruling_time?: string
  deduct_credit?: number
}

interface ApiResponse {
  code: number;
  msg: string;
  data: any;
}

const disputeList = ref<DisputeTicket[]>([])
const selectedTicket = ref<DisputeTicket | null>(null)

// 裁决选项
const rulingOptions = ref([
  { label: '失主胜诉 (OwnerWin)', value: 'OwnerWin' },
  { label: '拾主胜诉 (FinderWin)', value: 'FinderWin' },
  { label: '按比例分配 (Split)', value: 'Split' }
])

// 裁决表单
const rulingForm = ref({
  result: 0,
  remark: '',
  deductCredit: 0
})

// 切换标签
const switchTab = (index: number) => {
  currentTab.value = index
  loadDisputeList()
}

// 选择工单
const selectTicket = (ticket: DisputeTicket) => {
  selectedTicket.value = ticket
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    'Pending': 'status-pending',
    'Closed': 'status-closed',
    'Revoked': 'status-revoked'
  }
  return classMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'Pending': '待裁决',
    'Closed': '已裁决',
    'Revoked': '已撤销'
  }
  return textMap[status] || status
}

// 获取裁决结果文本
const getRulingText = (result: string) => {
  const textMap: Record<string, string> = {
    'OwnerWin': '失主胜诉',
    'FinderWin': '拾主胜诉',
    'Split': '按比例分配'
  }
  return textMap[result] || result
}

// 裁决结果变更
const onRulingChange = (e: any) => {
  rulingForm.value.result = e.detail.value
}

// 预览图片
const previewImage = (urls: string[], current: number) => {
  uni.previewImage({
    urls: urls,
    current: current
  })
}

// 提交裁决
const submitRuling = async () => {
  if (!rulingForm.value.remark) {
    uni.showToast({
      title: '请填写裁决说明',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '确认裁决',
    content: '裁决提交后将无法修改，确定要提交吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '提交中...' })
          
          // 调用裁决接口
          const response = await uni.request({
            url: '/api/v1/admin/disputes/ruling',
            method: 'POST',
            data: {
              ticket_id: selectedTicket.value?.ticket_id,
              ruling_result: rulingOptions.value[rulingForm.value.result].value,
              remark: rulingForm.value.remark,
              deduct_credit: rulingForm.value.deductCredit
            }
          })

          uni.hideLoading()
          const resData = response.data as ApiResponse

          if (resData.code === 200) {
            uni.showToast({
              title: '裁决已提交',
              icon: 'success'
            })
            
            // 重置表单
            rulingForm.value = {
              result: 0,
              remark: '',
              deductCredit: 0
            }
            
            // 返回列表并刷新
            selectedTicket.value = null
            loadDisputeList()
          } else {
            uni.showToast({
              title: resData.msg || '提交失败',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
          console.error('提交裁决失败:', error)
        }
      }
    }
  })
}

// 加载纠纷列表
const loadDisputeList = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    
    // 模拟数据，实际应调用接口
    setTimeout(() => {
      const mockData: DisputeTicket[] = [
        {
          ticket_id: 'ticket_uuid_123',
          claim_id: 'claim_uuid_456',
          item_name: 'MacBook Air',
          applicant_name: '张三',
          respondent_name: '李四',
          reason: '发布者拒绝确认交接，但我确认这是我的物品',
          status: 'Pending',
          create_time: '2026-01-06 10:30:00',
          deadline: '2026-01-08 22:30:00',
          applicant_evidence: [
            'https://via.placeholder.com/400',
            'https://via.placeholder.com/400'
          ],
          applicant_remark: '这是补充的购买发票截图',
          respondent_evidence: [
            'https://via.placeholder.com/400'
          ],
          respondent_remark: '拾取时的现场照片'
        },
        {
          ticket_id: 'ticket_uuid_124',
          claim_id: 'claim_uuid_457',
          item_name: '同济学生卡',
          applicant_name: '王五',
          respondent_name: '赵六',
          reason: '对方要求过高赏金',
          status: 'Pending',
          create_time: '2026-01-06 14:20:00',
          deadline: '2026-01-08 14:20:00',
          applicant_evidence: [],
          respondent_evidence: []
        },
        {
          ticket_id: 'ticket_uuid_125',
          claim_id: 'claim_uuid_458',
          item_name: 'AirPods Pro',
          applicant_name: '孙七',
          respondent_name: '周八',
          reason: '物品与描述不符',
          status: 'Closed',
          create_time: '2026-01-05 09:00:00',
          deadline: '2026-01-07 09:00:00',
          applicant_evidence: [
            'https://via.placeholder.com/400'
          ],
          respondent_evidence: [
            'https://via.placeholder.com/400'
          ],
          ruling_result: 'OwnerWin',
          ruling_remark: '经查证，申请人提供的序列号与发布物品一致，判定归还失主并退还赏币。',
          ruling_time: '2026-01-07 15:30:00',
          deduct_credit: 10
        }
      ]

      // 根据标签筛选
      if (currentTab.value === 0) {
        disputeList.value = mockData.filter(item => item.status === 'Pending')
      } else if (currentTab.value === 1) {
        disputeList.value = mockData.filter(item => item.status === 'Closed')
      } else {
        disputeList.value = mockData
      }

      // 更新标签计数
      tabs.value[0].count = mockData.filter(item => item.status === 'Pending').length
      tabs.value[1].count = mockData.filter(item => item.status === 'Closed').length
      tabs.value[2].count = mockData.length

      uni.hideLoading()
    }, 500)

    /*
    // 实际接口调用示例
    const response = await uni.request({
      url: '/api/v1/admin/disputes/list',
      method: 'GET',
      data: {
        status: currentTab.value === 0 ? 'Pending' : currentTab.value === 1 ? 'Closed' : undefined
      }
    })
    
    if (response.data.code === 200) {
      disputeList.value = response.data.data
    }
    uni.hideLoading()
    */
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    console.error('加载纠纷列表失败:', error)
  }
}

onMounted(() => {
  loadDisputeList()
})
</script>

<style lang="scss" scoped>
.dispute-container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

// 标签栏
.tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 30rpx 0;
    position: relative;
    color: #666;
    font-size: 28rpx;
    
    &.active {
      color: #007aff;
      font-weight: bold;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #007aff;
        border-radius: 2rpx;
      }
    }
    
    .badge {
      margin-left: 8rpx;
      padding: 0 12rpx;
      background-color: #ff3b30;
      color: #fff;
      border-radius: 20rpx;
      font-size: 20rpx;
      line-height: 32rpx;
    }
  }
}

// 列表容器
.list-container {
  height: calc(100vh - 88rpx);
}

// 工单状态
.ticket-status {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  
  &.status-pending {
    background-color: #fff3e0;
    color: #ff9800;
  }
  
  &.status-closed {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  &.status-revoked {
    background-color: #f5f5f5;
    color: #999;
  }
}

.ticket-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 24rpx;
  color: #999;
  
  .deadline {
    margin-top: 8rpx;
    color: #ff3b30;
  }
}

// 空状态
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

// 详情容器
.detail-container {
  height: calc(100vh - 88rpx);
  padding-bottom: 40rpx;
}

.detail-header {
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #eee;
  
  .back-btn {
    display: flex;
    align-items: center;
    color: #007aff;
    font-size: 28rpx;
    margin-bottom: 20rpx;
    
    text {
      margin-left: 8rpx;
    }
  }
  
  .ticket-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .item-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .status-tag {
    padding: 8rpx 20rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
  }
}

// 信息区域
.info-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  
  .info-row {
    display: flex;
    margin-bottom: 24rpx;
    font-size: 28rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      width: 180rpx;
      color: #666;
      flex-shrink: 0;
    }
    
    .value {
      flex: 1;
      color: #333;
      
      &.deadline {
        color: #ff3b30;
      }
    }
  }
}

// 证据区域
.evidence-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  
  .evidence-images {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .evidence-img {
      width: 200rpx;
      height: 200rpx;
      border-radius: 8rpx;
      background-color: #f5f5f5;
    }
  }
  
  .no-evidence {
    padding: 40rpx 0;
    text-align: center;
    color: #999;
    font-size: 28rpx;
  }
  
  .evidence-remark {
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 8rpx;
    font-size: 26rpx;
    line-height: 1.6;
    
    .remark-label {
      color: #666;
      margin-right: 10rpx;
    }
  }
}

// 裁决区域
.ruling-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  
  .form-item {
    margin-bottom: 40rpx;
    
    .form-label {
      display: block;
      margin-bottom: 20rpx;
      color: #333;
      font-size: 28rpx;
      font-weight: bold;
    }
    
    .picker {
      padding: 20rpx 30rpx;
      background-color: #f8f8f8;
      border-radius: 8rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 28rpx;
    }
    
    .form-input {
      width: 100%;
      padding: 20rpx 30rpx;
      background-color: #f8f8f8;
      border-radius: 8rpx;
      font-size: 28rpx;
    }
    
    .form-textarea {
      width: 100%;
      min-height: 200rpx;
      padding: 20rpx 30rpx;
      background-color: #f8f8f8;
      border-radius: 8rpx;
      font-size: 28rpx;
      line-height: 1.6;
    }
    
    .char-count {
      display: block;
      text-align: right;
      margin-top: 10rpx;
      color: #999;
      font-size: 24rpx;
    }
  }
  
  .submit-btn {
    width: 100%;
    padding: 24rpx 0;
    background-color: #007aff;
    color: #fff;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    
    &::after {
      border: none;
    }
  }
}

// 裁决结果展示
.ruling-result {
  padding: 20rpx 30rpx;
  background-color: #fff;
  
  .result-row {
    display: flex;
    margin-bottom: 24rpx;
    font-size: 28rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      width: 180rpx;
      color: #666;
      flex-shrink: 0;
    }
    
    .value {
      flex: 1;
      color: #333;
      
      &.highlight {
        color: #007aff;
        font-weight: bold;
      }
    }
  }
}
</style>
