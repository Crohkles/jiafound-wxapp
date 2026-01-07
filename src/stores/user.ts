/**
 * 用户状态管理 Store
 * 管理用户登录状态、用户信息和赏币余额
 */
import { defineStore } from 'pinia'
import type { UserInfo, LoginResponse, ApiResponse } from '@/types/user'
import { authApi, userApi } from '@/api/user'
import { mockUserCertified, mockUserUncertified, mockUserAdmin } from '@/utils/mock'

interface UserState {
  /** 访问令牌 */
  token: string
  /** 用户信息 */
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  // ============ State ============
  state: (): UserState => ({
    token: '',
    userInfo: null
  }),

  // ============ Getters ============
  getters: {
    /**
     * 判断用户是否已登录
     */
    isLoggedIn: (state): boolean => {
      return !!state.token && !!state.userInfo
    },

    /**
     * 判断用户是否为管理员
     */
    isAdmin: (state): boolean => {
      if (!state.userInfo) return false
      return state.userInfo.role_type === 'Admin' || state.userInfo.role_type === 'SuperAdmin'
    },

    /**
     * 判断用户是否为超级管理员
     */
    isSuperAdmin: (state): boolean => {
      if (!state.userInfo) return false
      return state.userInfo.role_type === 'SuperAdmin'
    },

    /**
     * 判断账户是否被冻结
     */
    isFrozen: (state): boolean => {
      if (!state.userInfo) return false
      return state.userInfo.account_status === 'Frozen'
    },

    /**
     * 获取用户赏币余额
     */
    coinBalance: (state): number => {
      return state.userInfo?.coin_balance || 0
    },

    /**
     * 获取用户冻结余额
     */
    frozenBalance: (state): number => {
      return state.userInfo?.frozen_balance || 0
    }
  },

  // ============ Actions ============
  actions: {
    /**
     * 用户登录
     * @param code 微信登录凭证
     * @param userInfo 微信用户信息
     */
    async login(code: string, userInfo: { nickName: string; avatarUrl: string }): Promise<void> {
      try {
        // 调用登录接口
        const result = await authApi.login({ code, userInfo })

        if (result.code === 200 && result.data) {
          // 保存token和用户信息（自动持久化）
          this.token = result.data.token
          this.userInfo = result.data.userInfo

          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
        }
      } catch (error: any) {
        console.error('登录失败:', error)
        throw error
      }
    },

    /**
     * 用户登出
     */
    logout(): void {
      // 清除状态（自动清除持久化数据）
      this.token = ''
      this.userInfo = null

      // 提示用户
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })

      // 跳转到登录页（需根据实际页面路径调整）
      uni.reLaunch({
        url: '/pages/login/index'
      })
    },

    /**
     * 更新赏币余额
     * @param newBalance 新的余额
     */
    updateBalance(newBalance: number): void {
      if (this.userInfo) {
        this.userInfo.coin_balance = newBalance
      }
    },

    /**
     * 更新冻结余额
     * @param newFrozenBalance 新的冻结余额
     */
    updateFrozenBalance(newFrozenBalance: number): void {
      if (this.userInfo) {
        this.userInfo.frozen_balance = newFrozenBalance
      }
    },

    /**
     * 更新用户信息
     * @param userInfo 新的用户信息
     */
    updateUserInfo(userInfo: Partial<UserInfo>): void {
      if (this.userInfo) {
        this.userInfo = {
          ...this.userInfo,
          ...userInfo
        }
      }
    },

    /**
     * 刷新用户信息
     * 从服务器获取最新的用户信息
     */
    async refreshUserInfo(): Promise<void> {
      try {
        if (!this.token) {
          throw new Error('未登录')
        }

        // 调用获取用户信息接口
        const result = await userApi.getProfile()

        if (result.code === 200 && result.data) {
          this.userInfo = result.data
        }
      } catch (error: any) {
        console.error('刷新用户信息失败:', error)
        
        // 如果token失效，清除登录状态
        if (error.statusCode === 401) {
          this.logout()
        }
        
        throw error
      }
    },

    /**
     * 检查登录状态
     * 验证token是否有效
     */
    async checkLoginStatus(): Promise<boolean> {
      if (!this.isLoggedIn) {
        return false
      }

      try {
        await this.refreshUserInfo()
        return true
      } catch (error) {
        return false
      }
    },

    /**
     * 【开发环境】使用 Mock 数据登录
     * @param type 用户类型：'certified' | 'uncertified' | 'admin'
     */
    mockLogin(type: 'certified' | 'uncertified' | 'admin' = 'certified'): void {
      const userMap = {
        certified: mockUserCertified,
        uncertified: mockUserUncertified,
        admin: mockUserAdmin
      }

      const mockUser = userMap[type]
      this.token = 'mock_token_' + Date.now()
      this.userInfo = mockUser

      uni.showToast({
        title: `Mock登录成功 (${mockUser.nickname})`,
        icon: 'success',
        duration: 2000
      })

      console.log('🎭 Mock登录成功:', {
        type,
        user: mockUser,
        token: this.token
      })
    }
  },

  // ============ 持久化配置 ============
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-store',
        storage: {
          getItem(key: string) {
            return uni.getStorageSync(key)
          },
          setItem(key: string, value: string) {
            uni.setStorageSync(key, value)
          }
        }
      }
    ]
  }
})
