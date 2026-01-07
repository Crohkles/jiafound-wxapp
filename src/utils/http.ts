/**
 * HTTP 请求工具
 * 基于 uni.request 封装，支持拦截器和统一错误处理
 */
import type { ApiResponse } from '@/types/user'
import { useUserStore } from '@/stores/user'

/** 请求配置 */
interface RequestConfig extends UniApp.RequestOptions {
  /** 是否显示加载提示 */
  showLoading?: boolean
  /** 加载提示文本 */
  loadingText?: string
  /** 是否显示错误提示 */
  showError?: boolean
}

/** 基础URL - 需根据实际环境配置 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/**
 * HTTP 请求类
 */
class Http {
  /**
   * 通用请求方法
   */
  request<T = any>(options: RequestConfig): Promise<ApiResponse<T>> {
    const {
      url,
      method = 'GET',
      data,
      header = {},
      showLoading = false,
      loadingText = '加载中...',
      showError = true,
      ...restOptions
    } = options

    // 显示加载提示
    if (showLoading) {
      uni.showLoading({
        title: loadingText,
        mask: true
      })
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: BASE_URL + url,
        method,
        data,
        header: this.getHeaders(header),
        ...restOptions,
        success: (res) => {
          // 隐藏加载提示
          if (showLoading) {
            uni.hideLoading()
          }

          const result = res.data as ApiResponse<T>

          // HTTP状态码检查
          if (res.statusCode !== 200) {
            this.handleHttpError(res.statusCode, showError)
            reject(new Error(`HTTP ${res.statusCode}`))
            return
          }

          // 业务状态码检查
          if (result.code === 200) {
            resolve(result)
          } else {
            this.handleBusinessError(result.code, result.msg, showError)
            reject(new Error(result.msg || '请求失败'))
          }
        },
        fail: (err) => {
          // 隐藏加载提示
          if (showLoading) {
            uni.hideLoading()
          }

          if (showError) {
            uni.showToast({
              title: '网络请求失败',
              icon: 'none',
              duration: 2000
            })
          }

          console.error('请求失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      data,
      ...config
    })
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      data,
      ...config
    })
  }

  /**
   * 获取请求头
   * 自动添加 Authorization token
   */
  private getHeaders(customHeader: any = {}): any {
    const headers: any = {
      'Content-Type': 'application/json',
      ...customHeader
    }

    // 添加 token
    try {
      const userStore = useUserStore()
      if (userStore.token) {
        headers['Authorization'] = `Bearer ${userStore.token}`
      }
    } catch (error) {
      console.warn('获取token失败:', error)
    }

    return headers
  }

  /**
   * 处理 HTTP 错误
   */
  private handleHttpError(statusCode: number, showError: boolean): void {
    if (!showError) return

    const errorMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '拒绝访问',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时'
    }

    const message = errorMessages[statusCode] || `请求失败 (${statusCode})`

    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })

    // 401 自动登出
    if (statusCode === 401) {
      setTimeout(() => {
        const userStore = useUserStore()
        userStore.logout()
      }, 1500)
    }
  }

  /**
   * 处理业务错误
   */
  private handleBusinessError(code: number, message: string, showError: boolean): void {
    if (!showError) return

    // 特殊业务错误码处理
    switch (code) {
      case 401:
        // Token 失效
        uni.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          const userStore = useUserStore()
          userStore.logout()
        }, 1500)
        break

      case 403:
        // 无权限
        uni.showToast({
          title: '无权限访问',
          icon: 'none',
          duration: 2000
        })
        break

      default:
        // 显示错误消息
        uni.showToast({
          title: message || '请求失败',
          icon: 'none',
          duration: 2000
        })
    }
  }

  /**
   * 获取基础 URL（供文件上传使用）
   */
  getBaseUrl(): string {
    return BASE_URL
  }

  /**
   * 获取当前 token（供文件上传使用）
   */
  getToken(): string {
    try {
      const userStore = useUserStore()
      return userStore.token || ''
    } catch (error) {
      console.warn('获取token失败:', error)
      return ''
    }
  }
}

// 导出实例
export const http = new Http()

// 默认导出
export default http
