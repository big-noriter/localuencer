"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"
import Link from "next/link"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register, loginWithProvider } = useAuth()
  const router = useRouter()

  /**
   * 폼 데이터 업데이트
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  /**
   * 폼 유효성 검증
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요."
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "이름은 2글자 이상이어야 합니다."
    }

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요."
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다."
    }

    // 전화번호 검증 (선택사항)
    if (formData.phone) {
      const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)."
      }
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요."
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다."
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "비밀번호는 대소문자와 숫자를 포함해야 합니다."
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요."
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    // 약관 동의 검증
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "이용약관에 동의해주세요."
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = "개인정보처리방침에 동의해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 회원가입 처리
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("입력 정보를 확인해주세요.")
      return
    }

    setIsLoading(true)
    
    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        agreeToTerms: formData.agreeToTerms,
        agreeToPrivacy: formData.agreeToPrivacy,
        agreeToMarketing: formData.agreeToMarketing
      })

      if (success) {
        // 회원가입 성공 시 홈으로 이동
        router.push('/')
      }
    } catch (error) {
      console.error('회원가입 오류:', error)
      toast.error("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 소셜 회원가입 처리
   */
  const handleSocialSignup = async (provider: 'google' | 'naver' | 'kakao') => {
    setIsLoading(true)
    
    try {
      const success = await loginWithProvider(provider)
      if (success) {
        router.push('/')
      }
    } catch (error) {
      console.error('소셜 회원가입 오류:', error)
      toast.error(`${provider} 회원가입 중 오류가 발생했습니다.`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 전화번호 자동 포맷팅
   */
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            로컬루언서 미나와 함께 특별한 여행을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 소셜 회원가입 */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignup('kakao')}
              disabled={isLoading}
            >
              <Icons.message className="w-4 h-4 mr-2" />
              카카오로 회원가입
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignup('naver')}
              disabled={isLoading}
            >
              <Icons.globe className="w-4 h-4 mr-2" />
              네이버로 회원가입
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading}
            >
              <Icons.google className="w-4 h-4 mr-2" />
              구글로 회원가입
            </Button>
          </div>

          <Separator />

          {/* 이메일 회원가입 폼 */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isLoading}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* 전화번호 */}
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호 (선택)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                disabled={isLoading}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  className={errors.password ? "border-red-500" : ""}
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
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                8자 이상, 대소문자와 숫자를 포함해주세요
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <Icons.eyeOff className="h-4 w-4" />
                  ) : (
                    <Icons.eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  <Link href="/terms" className="text-primary hover:underline">
                    이용약관
                  </Link>에 동의합니다 *
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onCheckedChange={(checked) => handleInputChange('agreeToPrivacy', !!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="agreeToPrivacy" className="text-sm">
                  <Link href="/privacy" className="text-primary hover:underline">
                    개인정보처리방침
                  </Link>에 동의합니다 *
                </Label>
              </div>
              {errors.agreeToPrivacy && (
                <p className="text-sm text-red-500">{errors.agreeToPrivacy}</p>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToMarketing"
                  checked={formData.agreeToMarketing}
                  onCheckedChange={(checked) => handleInputChange('agreeToMarketing', !!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="agreeToMarketing" className="text-sm">
                  마케팅 정보 수신에 동의합니다 (선택)
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  회원가입 중...
                </>
              ) : (
                "회원가입"
              )}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 아이콘 컴포넌트 (임시)
const Icons = {
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
}
