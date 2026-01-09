<template>
  <view class="dispute-details-container">
    <scroll-view scroll-y class="content">
      <!-- 工单状态卡片 -->
      <view class="status-card">
        <view class="status-header">
          <view :class="['status-badge', getStatusClass(disputeDetail.status)]">
            {{ getStatusText(disputeDetail.status) }}
          </view>
          <text class="ticket-id">工单号: {{ disputeDetail.ticketId }}</text>
        </view>
        
        <view v-if="disputeDetail.deadline" class="deadline-info">
          <uni-icons type="loop" size="16" color="#ff3b30"></uni-icons>
          <text>截止时间: {{ formatTime(disputeDetail.deadline) }}</text>
        </view>
      </view>

      <!-- 维权理由 -->
      <uni-section title="维权理由" type="line" :padding="true">
        <view class="reason-content">
          <text>{{ disputeDetail.reason }}</text>
        </view>
      </uni-section>

      <!-- 发起人证据 -->
      <uni-section :title="getEvidenceTitle(true)" type="line" :padding="true">
        <view class="evidence-section">
          <view v-if="disputeDetail.initiatorEvidence?.imageUrls?.length" class="image-grid">
            <image 
              v-for="(img, index) in disputeDetail.initiatorEvidence.imageUrls" 
              :key="index"
              :src="img" 
              mode="aspectFill" 
              class="evidence-img"
              @click="previewImage(disputeDetail.initiatorEvidence.imageUrls, index)"
            />
          </view>
          
          <view v-if="disputeDetail.initiatorEvidence?.comments" class="comments">
            <text class="comments-label">补充说明:</text>
            <text class="comments-text">{{ disputeDetail.initiatorEvidence.comments }}</text>
          </view>
          
          <view v-if="!disputeDetail.initiatorEvidence" class="no-evidence">
            <text>暂无证据</text>
          </view>
        </view>
      </uni-section>

      <!-- 被投诉人证据 -->
      <uni-section :title="getEvidenceTitle(false)" type="line" :padding="true">
        <view class="evidence-section">
          <view v-if="disputeDetail.respondentEvidence?.imageUrls?.length" class="image-grid">
            <image 
              v-for="(img, index) in disputeDetail.respondentEvidence.imageUrls" 
              :key="index"
              :src="img" 
              mode="aspectFill" 
              class="evidence-img"
              @click="previewImage(disputeDetail.respondentEvidence.imageUrls, index)"
            />
          </view>
          
          <view v-if="disputeDetail.respondentEvidence?.comments" class="comments">
            <text class="comments-label">补充说明:</text>
            <text class="comments-text">{{ disputeDetail.respondentEvidence.comments }}</text>
          </view>
          
          <view v-if="!disputeDetail.respondentEvidence" class="no-evidence">
            <text>{{ canAddEvidence ? '点击下方按钮添加证据' : '暂无证据' }}</text>
          </view>
        </view>
      </uni-section>

      <!-- 裁决结果 -->
      <uni-section v-if="disputeDetail.rulingResult" title="裁决结果" type="line" :padding="true">
        <view class="ruling-content">
          <text>{{ disputeDetail.rulingResult }}</text>
        </view>
      </uni-section>

      <!-- 时间信息 -->
      <view v-if="disputeDetail.createTime" class="time-info">
        <text>创建时间: {{ formatTime(disputeDetail.createTime) }}</text>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view v-if="canAddEvidence || canRevoke" class="footer">
      <button v-if="canRevoke" class="revoke-btn" @click="confirmRevoke">
        撤销纠纷
      </button>
      <button v-if="canAddEvidence" class="add-evidence-btn" @click="showEvidenceDialog">
        添加证据
      </button>
    </view>

    <!-- 添加证据弹窗 -->
    <uni-popup ref="evidencePopup" type="bottom" :safe-area="true">
      <view class="evidence-dialog">
        <view class="dialog-header">
          <text class="dialog-title">添加证据</text>
          <view class="close-btn" @click="closeEvidenceDialog">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>

        <scroll-view scroll-y class="dialog-content">
          <!-- 上传图片 -->
          <view class="upload-section">
            <text class="section-label">上传图片</text>
            <view class="image-list">
              <view 
                v-for="(img, index) in evidenceImages" 
                :key="index"
                class="image-item"
              >
                <image :src="img" mode="aspectFill" class="preview-img" />
                <view class="delete-btn" @click="removeEvidenceImage(index)">
                  <uni-icons type="close" size="16" color="#fff"></uni-icons>
                </view>
              </view>
              
              <view 
                v-if="evidenceImages.length < 9" 
                class="upload-btn"
                @click="chooseEvidenceImage"
              >
                <uni-icons type="camera" size="40" color="#999"></uni-icons>
                <text>{{ evidenceImages.length }}/9</text>
              </view>
            </view>
          </view>

          <!-- 补充说明 -->
          <view class="comments-section">
            <text class="section-label">补充说明</text>
            <textarea 
              v-model="evidenceComments" 
              class="comments-textarea"
              placeholder="请输入补充说明..."
              :maxlength="300"
            />
            <text class="char-count">{{ evidenceComments.length }}/300</text>
          </view>
        </scroll-view>

        <view class="dialog-footer">
          <button class="cancel-btn" @click="closeEvidenceDialog">取消</button>
          <button class="submit-btn" @click="submitEvidence" :loading="submitting">提交</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface EvidenceDetail {
  imageUrls: string[]
  comments: string
}

interface DisputeDetail {
  ticketId: string
  claimId: string
  status: string
  reason: string
  rulingResult: string | null
  deadline: string | null
  createTime: string | null
  initiatorId: string
  respondentId: string
  initiatorRole: string
  initiatorEvidence: EvidenceDetail | null
  respondentEvidence: EvidenceDetail | null
}

const ticketId = ref('')
const isInitiator = ref(false) // 是否是纠纷发起人
const disputeDetail = ref<DisputeDetail>({
  ticketId: '',
  claimId: '',
  status: '',
  reason: '',
  rulingResult: null,
  deadline: null,
  createTime: null,
  initiatorId: '',
  respondentId: '',
  initiatorRole: '',
  initiatorEvidence: null,
  respondentEvidence: null
})

const evidencePopup = ref()
const evidenceImages = ref<string[]>([])
const evidenceComments = ref('')
const submitting = ref(false)

// 判断是否可以添加证据
const canAddEvidence = computed(() => {
  // 不是发起人 且 被申诉方还未添加证据
  return !isInitiator.value && !disputeDetail.value.respondentEvidence
})

// 判断是否可以撤销
const canRevoke = computed(() => {
  // 是发起人 且 状态为审核中或处理中
  return isInitiator.value && 
         (disputeDetail.value.status === 'Reviewing' || disputeDetail.value.status === 'Processing')
})

onLoad((options: any) => {
  if (options && options.ticketId) {
    ticketId.value = options.ticketId
    isInitiator.value = options.isInitiator === 'true' // 字符串转布尔值
    loadDisputeDetail()
  }
})

// 加载详情
const loadDisputeDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    
    const response = await uni.request({
      url: `http://localhost:8082/api/v1/disputes/tickets/${ticketId.value}`,
      method: 'GET'
    })

    const resData = response.data as any

    if (resData.code === 200) {
      disputeDetail.value = resData.data
    } else {
      uni.showToast({
        title: resData.msg || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
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

// 获取证据标题
const getEvidenceTitle = (isInitiator: boolean) => {
  if (isInitiator) {
    return '纠纷发起方证据'
  } else {
    return '纠纷被申诉方证据'
  }
}

// 预览图片
const previewImage = (urls: string[], current: number) => {
  uni.previewImage({
    urls: urls,
    current: current
  })
}

// 显示添加证据弹窗
const showEvidenceDialog = () => {
  evidencePopup.value.open()
}

// 关闭添加证据弹窗
const closeEvidenceDialog = () => {
  evidencePopup.value.close()
  evidenceImages.value = []
  evidenceComments.value = ''
}

// 选择证据图片
const chooseEvidenceImage = () => {
  const maxCount = 9 - evidenceImages.value.length
  
  uni.chooseImage({
    count: maxCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      evidenceImages.value.push(...res.tempFilePaths)
    }
  })
}

// 删除证据图片
const removeEvidenceImage = (index: number) => {
  evidenceImages.value.splice(index, 1)
}

// 上传证据图片
const uploadEvidenceImages = async (): Promise<string[]> => {
  if (evidenceImages.value.length === 0) {
    return []
  }

  try {
    uni.showLoading({ title: '上传图片中...' })
    
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < evidenceImages.value.length; i++) {
      const filePath = evidenceImages.value[i]
      
      const uploadResult = await uni.uploadFile({
        url: 'http://127.0.0.1:8082/api/v1/disputes/upload-images',
        filePath: filePath,
        name: 'files',
        formData: {}
      })

      const response = JSON.parse(uploadResult.data as string)
      
      if (response.code === 200 && response.data) {
        uploadedUrls.push(response.data[0])
      } else {
        throw new Error(response.msg || '上传失败')
      }
    }
    
    uni.hideLoading()
    return uploadedUrls
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '图片上传失败',
      icon: 'none'
    })
    throw error
  }
}

// 提交证据
const submitEvidence = async () => {
  if (evidenceImages.value.length === 0 && !evidenceComments.value.trim()) {
    uni.showToast({
      title: '请至少添加图片或补充说明',
      icon: 'none'
    })
    return
  }

  try {
    submitting.value = true
    
    // 上传图片
    const uploadedUrls = await uploadEvidenceImages()
    
    // 提交证据
    uni.showLoading({ title: '提交中...' })
    
    const response = await uni.request({
      url: `http://127.0.0.1:8082/api/v1/disputes/${ticketId.value}/evidence`,
      method: 'POST',
      data: {
        imageUrls: uploadedUrls,
        comments: evidenceComments.value
      }
    })

    uni.hideLoading()
    
    const resData = response.data as any

    if (resData.code === 200) {
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })
      closeEvidenceDialog()
      // 重新加载详情
      loadDisputeDetail()
    } else {
      uni.showToast({
        title: resData.msg || '提交失败',
        icon: 'none'
      })
    }
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '提交失败,请重试',
      icon: 'none'
    })
    console.error('提交证据失败:', error)
  } finally {
    submitting.value = false
  }
}

// 确认撤销
const confirmRevoke = () => {
  uni.showModal({
    title: '确认撤销',
    content: '撤销后将无法恢复，是否确认撤销纠纷工单？',
    success: (res) => {
      if (res.confirm) {
        revokeDispute()
      }
    }
  })
}

// 撤销纠纷
const revokeDispute = async () => {
  try {
    uni.showLoading({ title: '撤销中...' })
    
    const response = await uni.request({
      url: `http://127.0.0.1:8082/api/v1/disputes/tickets/${ticketId.value}/revoke`,
      method: 'PUT'
    })

    uni.hideLoading()
    
    const resData = response.data as any

    if (resData.code === 200) {
      uni.showToast({
        title: '撤销成功',
        icon: 'success',
        duration: 2000
      })
      
      // 延迟刷新详情或返回列表
      setTimeout(() => {
        loadDisputeDetail()
      }, 2000)
    } else {
      uni.showToast({
        title: resData.msg || '撤销失败',
        icon: 'none'
      })
    }
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '撤销失败,请重试',
      icon: 'none'
    })
    console.error('撤销纠纷失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.dispute-details-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding-bottom: 120rpx;
}

.status-card {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .status-header {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .status-badge {
      padding: 8rpx 16rpx;
      border-radius: 6rpx;
      font-size: 24rpx;
      font-weight: bold;
      
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
    
    .ticket-id {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .deadline-info {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 15rpx;
    background-color: #fff3e6;
    border-radius: 8rpx;
    
    text {
      font-size: 26rpx;
      color: #ff3b30;
    }
  }
}

.reason-content,
.ruling-content {
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  line-height: 1.6;
  
  text {
    font-size: 28rpx;
    color: #333;
  }
}

.evidence-section {
  .image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .evidence-img {
      width: 100%;
      height: 200rpx;
      border-radius: 8rpx;
      background-color: #f5f5f5;
    }
  }
  
  .comments {
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 8rpx;
    
    .comments-label {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 10rpx;
    }
    
    .comments-text {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
    }
  }
  
  .no-evidence {
    padding: 60rpx 0;
    text-align: center;
    
    text {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.time-info {
  padding: 20rpx 30rpx;
  text-align: center;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20rpx;
  
  .revoke-btn,
  .add-evidence-btn {
    flex: 1;
    padding: 24rpx 0;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    
    &::after {
      border: none;
    }
  }
  
  .revoke-btn {
    background-color: #ff3b30;
    color: #fff;
  }
  
  .add-evidence-btn {
    background-color: #007aff;
    color: #fff;
  }
}

.evidence-dialog {
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .dialog-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-btn {
      padding: 10rpx;
    }
  }
  
  .dialog-content {
    flex: 1;
    padding: 30rpx;
    
    .section-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      font-weight: bold;
    }
    
    .upload-section {
      margin-bottom: 40rpx;
      
      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        
        .image-item {
          position: relative;
          width: 200rpx;
          height: 200rpx;
          
          .preview-img {
            width: 100%;
            height: 100%;
            border-radius: 8rpx;
            background-color: #f5f5f5;
          }
          
          .delete-btn {
            position: absolute;
            top: -10rpx;
            right: -10rpx;
            width: 40rpx;
            height: 40rpx;
            background-color: #ff3b30;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        
        .upload-btn {
          width: 200rpx;
          height: 200rpx;
          border: 2rpx dashed #ddd;
          border-radius: 8rpx;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #fafafa;
          
          text {
            margin-top: 10rpx;
            color: #999;
            font-size: 24rpx;
          }
        }
      }
    }
    
    .comments-section {
      .comments-textarea {
        width: 100%;
        min-height: 200rpx;
        padding: 20rpx;
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
  }
  
  .dialog-footer {
    display: flex;
    gap: 20rpx;
    padding: 30rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .cancel-btn,
    .submit-btn {
      flex: 1;
      padding: 24rpx 0;
      border-radius: 8rpx;
      font-size: 32rpx;
      font-weight: bold;
      border: none;
      
      &::after {
        border: none;
      }
    }
    
    .cancel-btn {
      background-color: #f5f5f5;
      color: #666;
    }
    
    .submit-btn {
      background-color: #007aff;
      color: #fff;
    }
  }
}
</style>
