"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * 사용자 인터페이스
 */
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  role: 'admin' | 'moderator' | 'user' | 'vip'
  status: 'active' | 'inactive' | 'suspended'
  provider: 'email' | 'google' | 'naver' | 'kakao'
  createdAt: Date
  lastLoginAt: Date
  emailVerified: boolean
  phoneVerified: boolean
  preferences: {
    notifications: boolean
    marketing: boolean
    newsletter: boolean
    language: 'ko' | 'en' | 'ja' | 'zh'
  }
  profile: {
    bio?: string
    location?: string
    interests: string[]
    favoriteSpots: string[]
  }
  stats: {
    totalOrders: number
    totalSpent: number
    totalViews: number
    totalLikes: number
    totalComments: number
    wishlistCount: number
  }
}

/**
 * 인증 컨텍스트 인터페이스
 */
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithProvider: (provider: 'google' | 'naver' | 'kakao') => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  verifyEmail: (token: string) => Promise<boolean>
  refreshUser: () => Promise<void>
}

/**
 * 회원가입 데이터 인터페이스
 */
interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  agreeToTerms: boolean
  agreeToPrivacy: boolean
  agreeToMarketing?: boolean
}

/**
 * 인증 컨텍스트 생성
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * 목업 사용자 데이터
 */
const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: '김민수',
    email: 'minsu.kim@example.com',
    avatar: '/placeholder.svg?height=100&width=100&text=김민수',
    phone: '010-1234-5678',
    role: 'user',
    status: 'active',
    provider: 'kakao',
    createdAt: new Date('2024-10-15'),
    lastLoginAt: new Date('2024-12-19'),
    emailVerified: true,
    phoneVerified: true,
    preferences: {
      notifications: true,
      marketing: true,
      newsletter: false,
      language: 'ko'
    },
    profile: {
      bio: '경주 여행을 사랑하는 여행러입니다.',
      location: '서울특별시',
      interests: ['역사', '문화재', '전통음식', '사진촬영'],
      favoriteSpots: ['불국사', '석굴암', '안압지']
    },
    stats: {
      totalOrders: 5,
      totalSpent: 125000,
      totalViews: 234,
      totalLikes: 45,
      totalComments: 12,
      wishlistCount: 8
    }
  },
  {
    id: 'admin-001',
    name: '관리자',
    email: 'admin@localuencer.com',
    avatar: '/placeholder.svg?height=100&width=100&text=관리자',
    role: 'admin',
    status: 'active',
    provider: 'email',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-12-19'),
    emailVerified: true,
    phoneVerified: true,
    preferences: {
      notifications: true,
      marketing: false,
      newsletter: false,
      language: 'ko'
    },
    profile: {
      bio: '로컬루언서 미나 서비스 관리자입니다.',
      location: '경주시',
      interests: ['서비스 운영', '사용자 경험', 'AI 기술'],
      favoriteSpots: []
    },
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      wishlistCount: 0
    }
  }
]

/**
 * 인증 프로바이더 컴포넌트
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * 로컬 스토리지에서 사용자 정보 로드
   */
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('localuencer_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          // 날짜 객체 복원
          userData.createdAt = new Date(userData.createdAt)
          userData.lastLoginAt = new Date(userData.lastLoginAt)
          setUser(userData)
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error)
        localStorage.removeItem('localuencer_user')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  /**
   * 사용자 정보 저장
   */
  const saveUser = (userData: User) => {
    try {
      localStorage.setItem('localuencer_user', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error)
      toast.error('사용자 정보 저장에 실패했습니다.')
    }
  }

  /**
   * 이메일/비밀번호 로그인
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // 시뮬레이션된 로그인 처리
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const foundUser = MOCK_USERS.find(u => u.email === email)
      
      if (!foundUser) {
        toast.error('등록되지 않은 이메일입니다.')
        return false
      }

      if (foundUser.status === 'suspended') {
        toast.error('정지된 계정입니다. 고객센터에 문의하세요.')
        return false
      }

      // 비밀번호 검증 (실제로는 서버에서 해시 비교)
      if (password !== 'password123') {
        toast.error('비밀번호가 올바르지 않습니다.')
        return false
      }

      // 로그인 성공
      const updatedUser = {
        ...foundUser,
        lastLoginAt: new Date()
      }
      
      saveUser(updatedUser)
      toast.success(`환영합니다, ${foundUser.name}님!`)
      return true
      
    } catch (error) {
      console.error('로그인 오류:', error)
      toast.error('로그인 중 오류가 발생했습니다.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 소셜 로그인
   */
  const loginWithProvider = async (provider: 'google' | 'naver' | 'kakao'): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // 시뮬레이션된 소셜 로그인
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 기존 사용자 찾기 또는 새 사용자 생성
      let foundUser = MOCK_USERS.find(u => u.provider === provider)
      
      if (!foundUser) {
        // 새 사용자 생성 시뮬레이션
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: `${provider} 사용자`,
          email: `user@${provider}.com`,
          avatar: `/placeholder.svg?height=100&width=100&text=${provider}`,
          role: 'user',
          status: 'active',
          provider,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          emailVerified: true,
          phoneVerified: false,
          preferences: {
            notifications: true,
            marketing: false,
            newsletter: false,
            language: 'ko'
          },
          profile: {
            interests: [],
            favoriteSpots: []
          },
          stats: {
            totalOrders: 0,
            totalSpent: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            wishlistCount: 0
          }
        }
        foundUser = newUser
        toast.success(`${provider} 계정으로 회원가입이 완료되었습니다!`)
      } else {
        toast.success(`${provider} 계정으로 로그인되었습니다!`)
      }

      const updatedUser = {
        ...foundUser,
        lastLoginAt: new Date()
      }
      
      saveUser(updatedUser)
      return true
      
    } catch (error) {
      console.error('소셜 로그인 오류:', error)
      toast.error(`${provider} 로그인 중 오류가 발생했습니다.`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 회원가입
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // 시뮬레이션된 회원가입 처리
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 이메일 중복 확인
      const existingUser = MOCK_USERS.find(u => u.email === data.email)
      if (existingUser) {
        toast.error('이미 등록된 이메일입니다.')
        return false
      }

      // 새 사용자 생성
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: `/placeholder.svg?height=100&width=100&text=${data.name.charAt(0)}`,
        role: 'user',
        status: 'active',
        provider: 'email',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: false,
        phoneVerified: false,
        preferences: {
          notifications: true,
          marketing: data.agreeToMarketing || false,
          newsletter: false,
          language: 'ko'
        },
        profile: {
          interests: [],
          favoriteSpots: []
        },
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          wishlistCount: 0
        }
      }
      
      saveUser(newUser)
      toast.success('회원가입이 완료되었습니다! 이메일 인증을 진행해주세요.')
      return true
      
    } catch (error) {
      console.error('회원가입 오류:', error)
      toast.error('회원가입 중 오류가 발생했습니다.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 로그아웃
   */
  const logout = () => {
    try {
      localStorage.removeItem('localuencer_user')
      setUser(null)
      toast.success('로그아웃되었습니다.')
    } catch (error) {
      console.error('로그아웃 오류:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  /**
   * 프로필 업데이트
   */
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    
    try {
      // 시뮬레이션된 프로필 업데이트
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedUser = { ...user, ...data }
      saveUser(updatedUser)
      toast.success('프로필이 업데이트되었습니다.')
      return true
      
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      toast.error('프로필 업데이트 중 오류가 발생했습니다.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 환경설정 업데이트
   */
  const updatePreferences = async (preferences: Partial<User['preferences']>): Promise<boolean> => {
    if (!user) return false
    
    try {
      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, ...preferences }
      }
      saveUser(updatedUser)
      toast.success('환경설정이 저장되었습니다.')
      return true
      
    } catch (error) {
      console.error('환경설정 업데이트 오류:', error)
      toast.error('환경설정 저장 중 오류가 발생했습니다.')
      return false
    }
  }

  /**
   * 비밀번호 재설정
   */
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // 시뮬레이션된 비밀번호 재설정
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const foundUser = MOCK_USERS.find(u => u.email === email)
      if (!foundUser) {
        toast.error('등록되지 않은 이메일입니다.')
        return false
      }
      
      toast.success('비밀번호 재설정 이메일이 전송되었습니다.')
      return true
      
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error)
      toast.error('비밀번호 재설정 중 오류가 발생했습니다.')
      return false
    }
  }

  /**
   * 이메일 인증
   */
  const verifyEmail = async (token: string): Promise<boolean> => {
    if (!user) return false
    
    try {
      // 시뮬레이션된 이메일 인증
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedUser = { ...user, emailVerified: true }
      saveUser(updatedUser)
      toast.success('이메일 인증이 완료되었습니다.')
      return true
      
    } catch (error) {
      console.error('이메일 인증 오류:', error)
      toast.error('이메일 인증 중 오류가 발생했습니다.')
      return false
    }
  }

  /**
   * 사용자 정보 새로고침
   */
  const refreshUser = async () => {
    if (!user) return
    
    try {
      // 시뮬레이션된 사용자 정보 새로고침
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 실제로는 서버에서 최신 정보를 가져옴
      const updatedUser = { ...user, lastLoginAt: new Date() }
      saveUser(updatedUser)
      
    } catch (error) {
      console.error('사용자 정보 새로고침 오류:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithProvider,
    register,
    logout,
    updateProfile,
    updatePreferences,
    resetPassword,
    verifyEmail,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * 인증 컨텍스트 훅
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.')
  }
  return context
}

/**
 * 인증된 사용자만 접근 가능한 컴포넌트
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-muted-foreground">이 페이지에 접근하려면 로그인해주세요.</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}

/**
 * 관리자만 접근 가능한 컴포넌트
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h2>
          <p className="text-muted-foreground">관리자 권한이 필요한 페이지입니다.</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}
