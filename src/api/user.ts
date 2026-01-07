/**
 * 用户子系统 API
 * 封装所有用户相关的接口请求
 */
import http from '@/utils/http'
import type {
  ApiResponse,
  LoginParams,
  LoginResponse,
  BindParams,
  UpdateProfileParams,
  SendCodeParams,
  RechargeParams,
  WithdrawParams,
  CoinLogsParams,
  UserInfo,
  CoinLog,
  PageResponse,
  UploadImageResponse
} from '@/types/user'
import { isMockEnabled, mockAuthApi, mockUserApi, mockCoinApi, mockUploadApi } from './user.mock'

/**
 * 用户认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   * @param params - 登录参数（微信code和用户信息）
   * @returns 返回 token 和用户信息
   * 
   * @example
   * ```ts
   * const res = await authApi.login({
   *   code: 'wx_code_xxx',
   *   userInfo: { nickName: '张三', avatarUrl: 'https://...' }
   * })
   * ```
   */
  login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    if (isMockEnabled()) {
      return mockAuthApi.login(params) as Promise<ApiResponse<LoginResponse>>
    }
    return http.post<LoginResponse>('/user/login', params, {
      showLoading: true,
      loadingText: '登录中...'
    })
  },

  /**
   * 实名认证（绑定学号和真实姓名）
   * @param params - 认证参数
   * @returns 认证结果
   * 
   * @example
   * ```ts
   * const res = await authApi.bind({
   *   studentID: '2021001',
   *   realName: '张三',
   *   email: 'zhangsan@example.com',
   *   verifyCode: '123456'
   * })
   * ```
   */
  bind(params: BindParams): Promise<ApiResponse<void>> {
    if (isMockEnabled()) {
      return mockAuthApi.bind(params) as Promise<ApiResponse<void>>
    }
    return http.post<void>('/user/bind', params, {
      showLoading: true,
      loadingText: '认证中...'
    })
  },

  /**
   * 发送验证码
   * @param params - 验证码参数
   * @returns 发送结果
   * 
   * @example
   * ```ts
   * // 绑定邮箱时发送验证码
   * await authApi.sendCode({
   *   email: 'user@example.com',
   *   type: 'bind'
   * })
   * 
   * // 修改邮箱时发送验证码
   * await authApi.sendCode({
   *   email: 'new@example.com',
   *   type: 'update'
   * })
   * ```
   */
  sendCode(params: SendCodeParams): Promise<ApiResponse<void>> {
    if (isMockEnabled()) {
      return mockAuthApi.sendCode(params) as Promise<ApiResponse<void>>
    }
    return http.post<void>('/auth/send-code', params, {
      showLoading: true,
      loadingText: '发送中...'
    })
  }
}

/**
 * 用户信息相关 API
 */
export const userApi = {
  /**
   * 获取个人信息
   * @returns 用户详细信息
   * 
   * @example
   * ```ts
   * const res = await userApi.getProfile()
   * console.log(res.data) // UserInfo
   * ```
   */
  getProfile(): Promise<ApiResponse<UserInfo>> {
    if (isMockEnabled()) {
      return mockUserApi.getProfile()
    }
    return http.get<UserInfo>('/user/profile')
  },

  /**
   * 修改个人信息
   * @param params - 要修改的信息（支持部分更新）
   * @returns 更新后的用户信息
   * 
   * @example
   * ```ts
   * // 仅修改昵称
   * await userApi.updateProfile({ nickName: '新昵称' })
   * 
   * // 修改邮箱（需要验证码）
   * await userApi.updateProfile({
   *   email: 'new@example.com',
   *   verifyCode: '123456'
   * })
   * 
   * // 同时修改多个字段
   * await userApi.updateProfile({
   *   nickName: '新昵称',
   *   avatarUrl: 'https://...'
   * })
   * ```
   */
  updateProfile(params: UpdateProfileParams): Promise<ApiResponse<UserInfo>> {
    if (isMockEnabled()) {
      return mockUserApi.updateProfile(params)
    }
    return http.put<UserInfo>('/user/profile/update', params, {
      showLoading: true,
      loadingText: '更新中...'
    })
  }
}

/**
 * 赏币相关 API
 */
export const coinApi = {
  /**
   * 充值赏币
   * @param params - 充值参数（金额仅限 1, 2, 5, 10）
   * @returns 充值结果（包含新余额）
   * 
   * @example
   * ```ts
   * const res = await coinApi.recharge({ amount: 10 })
   * console.log(res.data.coin_balance) // 充值后的余额
   * ```
   */
  recharge(params: RechargeParams): Promise<ApiResponse<{ coin_balance: number }>> {
    if (isMockEnabled()) {
      return mockCoinApi.recharge(params)
    }
    return http.post<{ coin_balance: number }>('/coin/recharge', params, {
      showLoading: true,
      loadingText: '充值中...'
    })
  },

  /**
   * 提现赏币
   * @param params - 提现参数
   * @returns 提现结果（包含新余额）
   * 
   * @example
   * ```ts
   * const res = await coinApi.withdraw({ coinAmount: 50 })
   * console.log(res.data.coin_balance) // 提现后的余额
   * ```
   */
  withdraw(params: WithdrawParams): Promise<ApiResponse<{ coin_balance: number }>> {
    if (isMockEnabled()) {
      return mockCoinApi.withdraw(params)
    }
    return http.post<{ coin_balance: number }>('/coin/withdraw', params, {
      showLoading: true,
      loadingText: '提现中...'
    })
  },

  /**
   * 获取赏币流水记录
   * @param params - 分页参数和筛选条件
   * @returns 流水记录列表（分页）
   * 
   * @example
   * ```ts
   * // 获取第一页流水（每页20条）
   * const res = await coinApi.getLogs({ page: 1, pageSize: 20 })
   * 
   * // 筛选特定类型的流水
   * const res = await coinApi.getLogs({
   *   page: 1,
   *   pageSize: 20,
   *   type: 'Recharge'
   * })
   * ```
   */
  getLogs(params: CoinLogsParams): Promise<ApiResponse<PageResponse<CoinLog>>> {
    if (isMockEnabled()) {
      return mockCoinApi.getLogs(params)
    }
    return http.get<PageResponse<CoinLog>>('/coin/logs', params, {
      showLoading: true,
      loadingText: '加载中...'
    })
  }
}

/**
 * 文件上传相关 API
 */
export const uploadApi = {
  /**
   * 上传图片
   * @param filePath - 本地文件路径
   * @returns 上传后的图片 URL 和文件信息
   * 
   * @example
   * ```ts
   * const res = await uploadApi.uploadImage(tempFilePath)
   * console.log(res.data.url) // 图片访问地址
   * ```
   */
  uploadImage(filePath: string): Promise<ApiResponse<UploadImageResponse>> {
    if (isMockEnabled()) {
      return mockUploadApi.uploadImage(filePath)
    }

    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: http.getBaseUrl() + '/upload/image',
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${http.getToken()}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              const result = JSON.parse(res.data) as ApiResponse<UploadImageResponse>
              resolve(result)
            } catch (error) {
              reject(new Error('解析响应失败'))
            }
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }
}

/**
 * 统一导出所有 API
 */
export default {
  auth: authApi,
  user: userApi,
  coin: coinApi,
  upload: uploadApi
}
