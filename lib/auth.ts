"use client"

import { createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"

/**
 * 인증된 사용자 인터페이스
 * Supabase User 타입을 확장하여 커스텀 필드 추가
 */
export interface AuthUser extends User {
  // 사용자 메타데이터 (프로필 정보 등)
  user_metadata: {
    username?: string      // 사용자명
    full_name?: string    // 전체 이름
    avatar_url?: string   // 프로필 이미지 URL
  }
  // 앱 메타데이터 (권한 등)
  app_metadata: {
    role?: "user" | "admin"  // 사용자 역할 (일반 사용자 또는 관리자)
  }
}

/**
 * 인증 컨텍스트 타입 정의
 * 인증 상태와 관련된 값과 함수들을 포함
 */
export interface AuthContextType {
  user: AuthUser | null      // 현재 로그인한 사용자 정보 (로그아웃 시 null)
  loading: boolean          // 인증 상태 확인 중인지 여부
  signIn: (email: string, password: string) => Promise<{ error: any }>  // 로그인 함수
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error: any }>  // 회원가입 함수
  signOut: () => Promise<void>  // 로그아웃 함수
  isAdmin: boolean           // 관리자 여부
}

// 인증 컨텍스트 생성 (기본값은 undefined)
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * useAuth 훅
 * AuthContext에서 인증 관련 값과 함수를 가져오는 커스텀 훅
 * 반드시 AuthProvider 내부에서만 사용해야 함
 * @throws {Error} AuthProvider 외부에서 사용 시 오류 발생
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth는 반드시 AuthProvider 내부에서 사용해야 합니다.")
  }
  return context
}
