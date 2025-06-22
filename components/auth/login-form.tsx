"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/ui/icons"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"
import Link from "next/link"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const { login, loginWithProvider } = useAuth()
  const router = useRouter()

  /**
   * 이메일/비밀번호 로그인 처리
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.")
      return
    }

    setIsLoading(true)
    
    try {
      const success = await login(email, password)
      if (success) {
        // 로그인 성공 시 이전 페이지로 이동하거나 홈으로 이동
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl')
        router.push(returnUrl || '/')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      toast.error("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 소셜 로그인 처리
   */
  const handleSocialLogin = async (provider: 'google' | 'naver' | 'kakao') => {
    setIsLoading(true)
    
    try {
      const success = await loginWithProvider(provider)
      if (success) {
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl')
        router.push(returnUrl || '/')
      }
    } catch (error) {
      console.error('소셜 로그인 오류:', error)
      toast.error(`${provider} 로그인 중 오류가 발생했습니다.`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 데모 계정 로그인
   */
  const handleDemoLogin = async (type: 'user' | 'admin') => {
    setIsLoading(true)
    
    try {
      const demoEmail = type === 'admin' ? 'admin@localuencer.com' : 'minsu.kim@example.com'
      const success = await login(demoEmail, 'password123')
      if (success) {
        router.push(type === 'admin' ? '/admin' : '/')
      }
    } catch (error) {
      console.error('데모 로그인 오류:', error)
      toast.error("데모 로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            로컬루언서 미나에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 데모 계정 로그인 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              데모 계정으로 빠른 체험
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('user')}
                disabled={isLoading}
                className="text-xs"
              >
                <Icons.user className="w-3 h-3 mr-1" />
                일반 사용자
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="text-xs"
              >
                <Icons.shield className="w-3 h-3 mr-1" />
                관리자
              </Button>
            </div>
          </div>

          <Separator />

          {/* 소셜 로그인 */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading}
            >
              <Icons.message className="w-4 h-4 mr-2" />
              카카오로 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('naver')}
              disabled={isLoading}
            >
              <Icons.globe className="w-4 h-4 mr-2" />
              네이버로 로그인
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <Icons.google className="w-4 h-4 mr-2" />
              구글로 로그인
            </Button>
          </div>

          <Separator />

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <Icons.eyeOff className="h-4 w-4" />
                  ) : (
                    <Icons.eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* 로그인 옵션 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <Label htmlFor="remember" className="text-sm">
                  로그인 상태 유지
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          {/* 회원가입 링크 */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              회원가입
            </Link>
          </div>

          {/* 테스트 정보 */}
          <div className="mt-6 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-2">
              <Icons.info className="w-3 h-3 inline mr-1" />
              테스트 계정 정보
            </p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>일반 사용자:</span>
                <span className="font-mono">minsu.kim@example.com</span>
              </div>
              <div className="flex justify-between">
                <span>관리자:</span>
                <span className="font-mono">admin@localuencer.com</span>
              </div>
              <div className="flex justify-between">
                <span>비밀번호:</span>
                <span className="font-mono">password123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 아이콘 컴포넌트 (임시)
const Icons = {
  user: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  shield: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  message: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  globe: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  google: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  eye: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  eyeOff: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  ),
  spinner: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  info: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}
