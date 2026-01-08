/**
 * 用户与激励子系统 - TypeScript 类型定义
 * 基于数据库设计的前端接口定义
 */

// ============ 枚举类型定义 ============

/** 用户角色类型 */
export type RoleType = 'User' | 'Admin' | 'SuperAdmin'

/** 账户状态 */
export type AccountStatus = 'Normal' | 'Frozen'

/** 赏币流水类型 */
export type CoinLogType = 'Recharge' | 'Withdraw' | 'Freeze' | 'Reward' | 'Settle'

// ============ 用户信息相关 ============

/** 用户信息 */
export interface User {
  /** 用户ID (char32) */
  user_id: string
  /** 微信OpenID */
  open_id: string
  /** 学号（加密） */
  student_id: string
  /** 真实姓名（加密） */
  real_name: string
  /** 昵称 */
  nickname: string
  /** 头像URL */
  avatar_url: string
  /** 邮箱（加密） */
  email: string
  /** 是否已认证 (0/1) */
  is_certified: number
  /** 角色类型 */
  role_type: RoleType
  /** 账户状态 */
  account_status: AccountStatus
  /** 解冻时间 */
  unfreeze_time?: string
  /** 赏币余额 */
  coin_balance: number
  /** 冻结余额 */
  frozen_balance: number
  /** 创建时间 */
  create_time: string
  /** 更新时间 */
  update_time: string
}

/** 用户信息（前端精简版） */
export interface UserInfo {
  userId: string
  nickname: string
  avatarUrl: string
  roleType: RoleType
  isCertified: boolean
  accountStatus: AccountStatus
  coinBalance: number
  frozenBalance: number
  studentId?: string
  email?: string
}

// ============ 赏币流水相关 ============

/** 赏币流水记录 */
export interface CoinLog {
  /** 流水ID */
  logId: string
  /** 流水类型 */
  type: CoinLogType
  /** 金额（正数表示收入，负数表示支出） */
  amount: number
  /** 关联物品ID（可选） */
  relatedItemId?: string
  /** 创建时间 */
  createTime: string
}

// ============ API 响应结构 ============

/** 通用API响应结构 */
export interface ApiResponse<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}

/** 登录响应数据 */
export interface LoginResponse {
  /** 访问令牌 */
  token: string
  /** 用户信息 */
  userInfo: UserInfo
}

/** 分页查询参数 */
export interface PageParams {
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
}

/** 分页响应数据 */
export interface PageResponse<T> {
  /** 数据列表 */
  list: T[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
}

// ============ API 请求参数 ============

/** 登录请求参数 */
export interface LoginParams {
  /** 微信登录凭证 */
  code: string
  /** 用户信息（微信返回） */
  userInfo: {
    /** 昵称 */
    nickName: string
    /** 头像 */
    avatarUrl: string
  }
}

/** 实名认证请求参数 */
export interface BindParams {
  /** 学号 */
  studentID: string
  /** 真实姓名 */
  realName: string
  /** 邮箱 */
  email: string
  /** 验证码 */
  verifyCode: string
}

/** 修改信息请求参数 */
export interface UpdateProfileParams {
  /** 昵称（可选） */
  nickname?: string
  /** 头像URL（可选） */
  avatarUrl?: string
  /** 邮箱（可选） */
  email?: string
  /** 验证码（修改邮箱时必填） */
  verifyCode?: string
}

/** 发送验证码请求参数 */
export interface SendCodeParams {
  /** 邮箱地址 */
  email: string
  /** 验证码类型 */
  type: 'bind' | 'update' | 'reset'
}

/** 充值请求参数 */
export interface RechargeParams {
  /** 充值金额（仅限 1, 2, 5, 10） */
  amount: 1 | 2 | 5 | 10
}

/** 提现请求参数 */
export interface WithdrawParams {
  /** 提现赏币数量 */
  coinAmount: number
}

/** 获取流水请求参数 */
export interface CoinLogsParams extends PageParams {
  /** 流水类型（可选） */
  type?: CoinLogType
}

/** 图片上传响应 */
export interface UploadImageResponse {
  /** 图片URL */
  url: string
  /** 文件大小（字节） */
  size: number
  /** 文件类型 */
  type: string
}
