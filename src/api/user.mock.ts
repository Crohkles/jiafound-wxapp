/**
 * Mock API 适配器
 * 开发环境下拦截 API 请求，返回模拟数据
 */
import type { 
  LoginParams, 
  BindParams, 
  UpdateProfileParams,
  SendCodeParams,
  RechargeParams,
  WithdrawParams,
  CoinLogsParams,
  ApiResponse,
  UserInfo,
  PageResponse,
  CoinLog,
  UploadImageResponse
} from '@/types/user'
import { 
  mockUserCertified, 
  mockUserUncertified,
  mockCoinLogs,
  mockLoginResponse,
  mockSendCodeResponse,
  mockBindResponse,
  mockRechargeResponse,
  mockWithdrawResponse,
  mockPageResponse,
  mockResponse,
  mockDelay,
  mockUploadImageResponse
} from '@/utils/mock'

/** 
 * 是否启用 Mock 模式
 * 注意：环境变量值为字符串类型，需判断是否等于 'true'
 */
const ENABLE_MOCK = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true'

/**
 * Mock Auth API
 */
export const mockAuthApi = {
  /**
   * 登录
   */
  async login(params: LoginParams): Promise<ApiResponse<{ token: string; userInfo: UserInfo }>> {
    console.log('🎭 Mock API - 登录:', params)
    await mockDelay(800)
    
    // 模拟：如果 code 包含 'uncertified'，返回未认证用户
    if (params.code.includes('uncertified')) {
      return mockLoginResponse(mockUserUncertified)
    }
    
    return mockLoginResponse(mockUserCertified)
  },

  /**
   * 绑定/认证
   */
  async bind(params: BindParams): Promise<ApiResponse<UserInfo>> {
    console.log('🎭 Mock API - 绑定认证:', params)
    await mockDelay(1000)
    
    // 模拟验证码校验
    if (params.verifyCode !== '123456') {
      return {
        code: 400,
        msg: '验证码错误',
        data: null
      }
    }
    
    const certifiedUser = {
      ...mockUserCertified,
      student_id: params.studentID,
      real_name: params.realName,
      email: params.email,
      is_certified: true
    }
    
    return mockBindResponse(certifiedUser)
  },

  /**
   * 发送验证码
   */
  async sendCode(params: SendCodeParams): Promise<ApiResponse<null>> {
    console.log('🎭 Mock API - 发送验证码:', params)
    await mockDelay(500)
    
    // 模拟：特定邮箱返回错误
    if (params.email.includes('error')) {
      return {
        code: 400,
        msg: '邮箱格式不正确',
        data: null
      }
    }
    
    console.log('💡 Mock验证码: 123456')
    return mockSendCodeResponse()
  }
}

/**
 * Mock User API
 */
export const mockUserApi = {
  /**
   * 获取用户信息
   */
  async getProfile(): Promise<ApiResponse<UserInfo>> {
    console.log('🎭 Mock API - 获取用户信息')
    await mockDelay(300)
    return mockResponse(mockUserCertified)
  },

  /**
   * 更新用户信息
   */
  async updateProfile(params: UpdateProfileParams): Promise<ApiResponse<UserInfo>> {
    console.log('🎭 Mock API - 更新用户信息:', params)
    await mockDelay(500)
    
    const updatedUser = {
      ...mockUserCertified,
      ...params,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    return mockResponse(updatedUser, '更新成功')
  }
}

/**
 * Mock Coin API
 */
export const mockCoinApi = {
  /**
   * 充值
   */
  async recharge(params: RechargeParams): Promise<ApiResponse<{ coin_balance: number; frozen_balance: number }>> {
    console.log('🎭 Mock API - 充值:', params)
    await mockDelay(1000)
    
    const currentBalance = mockUserCertified.coin_balance
    return mockRechargeResponse(params.amount, currentBalance)
  },

  /**
   * 提现
   */
  async withdraw(params: WithdrawParams): Promise<ApiResponse<{ coin_balance: number; frozen_balance: number }>> {
    console.log('🎭 Mock API - 提现:', params)
    await mockDelay(1000)
    
    const currentBalance = mockUserCertified.coin_balance
    
    // 模拟余额不足
    if (params.coinAmount > currentBalance) {
      return {
        code: 400,
        msg: '余额不足',
        data: null
      }
    }
    
    return mockWithdrawResponse(params.coinAmount, currentBalance)
  },

  /**
   * 获取赏币流水
   */
  async getLogs(params: CoinLogsParams): Promise<ApiResponse<PageResponse<CoinLog>>> {
    console.log('🎭 Mock API - 获取赏币流水:', params)
    await mockDelay(500)
    
    let logs = mockCoinLogs
    
    // 按类型筛选
    if (params.type) {
      logs = logs.filter(log => log.type === params.type)
    }
    
    return mockPageResponse(logs, params.page, params.pageSize)
  }
}

/**
 * Mock Upload API
 */
export const mockUploadApi = {
  /**
   * 上传图片
   */
  async uploadImage(filePath: string): Promise<ApiResponse<UploadImageResponse>> {
    console.log('🎭 Mock API - 上传图片:', filePath)
    await mockDelay(800)
    
    // 从文件路径提取文件名
    const fileName = filePath.split('/').pop() || 'image.jpg'
    
    return mockUploadImageResponse(fileName)
  }
}

/**
 * 检查是否启用 Mock
 */
export const isMockEnabled = (): boolean => {
  return ENABLE_MOCK
}

/**
 * 设置 Mock 模式
 */
export const setMockMode = (enabled: boolean): void => {
  console.log(`🎭 Mock模式: ${enabled ? '已启用' : '已禁用'}`)
  // 注意：这只是运行时标记，需要配合环境变量
}

/**
 * 打印 Mock 状态
 */
export const printMockStatus = (): void => {
  console.log('='.repeat(50))
  console.log('🎭 Mock 模式状态')
  console.log('='.repeat(50))
  console.log('启用状态:', ENABLE_MOCK ? '✅ 已启用' : '❌ 未启用')
  console.log('开发模式:', import.meta.env.DEV ? '✅ 是' : '❌ 否')
  console.log('VITE_ENABLE_MOCK:', import.meta.env.VITE_ENABLE_MOCK)
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
  console.log('='.repeat(50))
  console.log('可用的 Mock 用户:')
  console.log('  • 已认证用户:', mockUserCertified.nickname, `(学号: ${mockUserCertified.student_id})`)
  console.log('  • 未认证用户:', mockUserUncertified.nickname)
  console.log('默认验证码: 123456')
  console.log('='.repeat(50))
}
