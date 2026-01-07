/**
 * Mock 数据工具
 * 用于开发环境测试，提供模拟用户数据
 */
import type { UserInfo, CoinLog, ApiResponse, PageResponse } from '@/types/user'

/**
 * Mock 用户信息 - 已认证用户
 */
export const mockUserCertified: UserInfo = {
  user_id: 'mock_user_001',
  openid: 'mock_openid_123456',
  nickname: '张小明',
  avatar_url: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
  student_id: '2021001234',
  real_name: '张小明',
  email: 'zhangxiaoming@example.com',
  role_type: 'User',
  is_certified: true,
  account_status: 'Active',
  coin_balance: 258.50,
  frozen_balance: 50.00,
  created_at: '2024-01-15 10:30:00',
  updated_at: '2025-12-20 15:45:00'
}

/**
 * Mock 用户信息 - 未认证用户
 */
export const mockUserUncertified: UserInfo = {
  user_id: 'mock_user_002',
  openid: 'mock_openid_654321',
  nickname: '微信用户',
  avatar_url: 'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoj0hHXhgJNOTSOFsS4uZs8x1ConecaVOB8eIl115xmJZcT4oCicvia7wMEufibKtTLqiaJeanU2Lpg3w/132',
  student_id: null,
  real_name: null,
  email: null,
  role_type: 'User',
  is_certified: false,
  account_status: 'Active',
  coin_balance: 0,
  frozen_balance: 0,
  created_at: '2025-12-25 08:20:00',
  updated_at: '2025-12-25 08:20:00'
}

/**
 * Mock 用户信息 - 管理员
 */
export const mockUserAdmin: UserInfo = {
  user_id: 'mock_admin_001',
  openid: 'mock_openid_admin',
  nickname: '系统管理员',
  avatar_url: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLL1byctY955Htv9ztzOTJzvhIV3e8GzgcP2NVvYsZihSN1IqQsORqJKib3h1fHyb78D7gFqIxk9JA/132',
  student_id: '2020000001',
  real_name: '李管理',
  email: 'admin@example.com',
  role_type: 'Admin',
  is_certified: true,
  account_status: 'Active',
  coin_balance: 9999.00,
  frozen_balance: 0,
  created_at: '2020-09-01 00:00:00',
  updated_at: '2025-12-31 23:59:59'
}

/**
 * Mock 赏币流水记录
 */
export const mockCoinLogs: CoinLog[] = [
  {
    log_id: 'log_001',
    user_id: 'mock_user_001',
    type: 'Recharge',
    coin_amount: 10.00,
    balance_after: 258.50,
    description: '充值',
    related_item_id: null,
    created_at: '2026-01-07 14:30:00'
  },
  {
    log_id: 'log_002',
    user_id: 'mock_user_001',
    type: 'Reward',
    coin_amount: -20.00,
    balance_after: 248.50,
    description: '发布悬赏：寻找校园卡',
    related_item_id: 'item_123',
    created_at: '2026-01-06 10:15:00'
  },
  {
    log_id: 'log_003',
    user_id: 'mock_user_001',
    type: 'Refund',
    coin_amount: 20.00,
    balance_after: 268.50,
    description: '悬赏退回：寻找校园卡',
    related_item_id: 'item_123',
    created_at: '2026-01-05 16:20:00'
  },
  {
    log_id: 'log_004',
    user_id: 'mock_user_001',
    type: 'Earn',
    coin_amount: 30.00,
    balance_after: 238.50,
    description: '获得悬赏：归还钥匙',
    related_item_id: 'item_456',
    created_at: '2026-01-04 09:45:00'
  },
  {
    log_id: 'log_005',
    user_id: 'mock_user_001',
    type: 'Withdraw',
    coin_amount: -100.00,
    balance_after: 208.50,
    description: '提现',
    related_item_id: null,
    created_at: '2026-01-03 11:30:00'
  },
  {
    log_id: 'log_006',
    user_id: 'mock_user_001',
    type: 'Recharge',
    coin_amount: 50.00,
    balance_after: 308.50,
    description: '充值',
    related_item_id: null,
    created_at: '2026-01-02 15:00:00'
  },
  {
    log_id: 'log_007',
    user_id: 'mock_user_001',
    type: 'Freeze',
    coin_amount: 0,
    balance_after: 258.50,
    description: '冻结赏币：审核中的悬赏',
    related_item_id: 'item_789',
    created_at: '2026-01-01 13:20:00'
  }
]

/**
 * Mock API 响应工厂函数
 */
export const mockResponse = <T>(data: T, msg = '操作成功'): ApiResponse<T> => {
  return {
    code: 200,
    msg,
    data
  }
}

/**
 * Mock 分页响应工厂函数
 */
export const mockPageResponse = <T>(
  list: T[],
  page = 1,
  pageSize = 10
): ApiResponse<PageResponse<T>> => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pageList = list.slice(start, end)
  
  return mockResponse({
    list: pageList,
    total: list.length,
    page,
    pageSize,
    totalPages: Math.ceil(list.length / pageSize)
  })
}

/**
 * 模拟延迟
 */
export const mockDelay = (ms = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock 登录响应
 */
export const mockLoginResponse = (userInfo = mockUserCertified) => {
  return mockResponse({
    token: 'mock_token_' + Date.now(),
    userInfo
  })
}

/**
 * Mock 验证码发送响应
 */
export const mockSendCodeResponse = () => {
  return mockResponse(null, '验证码已发送')
}

/**
 * Mock 绑定认证响应
 */
export const mockBindResponse = (userInfo = mockUserCertified) => {
  return mockResponse({
    ...userInfo,
    is_certified: true
  })
}

/**
 * Mock 充值响应
 */
export const mockRechargeResponse = (amount: number, currentBalance: number) => {
  return mockResponse({
    coin_balance: currentBalance + amount,
    frozen_balance: 0
  }, '充值成功')
}

/**
 * Mock 提现响应
 */
export const mockWithdrawResponse = (amount: number, currentBalance: number) => {
  return mockResponse({
    coin_balance: currentBalance - amount,
    frozen_balance: 0
  }, '提现申请已提交')
}

/**
 * Mock 图片上传响应
 */
export const mockUploadImageResponse = (fileName: string) => {
  // 生成一个模拟的图片 URL
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)
  const mockUrl = `https://picsum.photos/seed/${randomId}/400/400`
  
  return mockResponse({
    url: mockUrl,
    size: Math.floor(Math.random() * 500000) + 100000, // 100KB - 600KB
    type: 'image/jpeg'
  }, '上传成功')
}
