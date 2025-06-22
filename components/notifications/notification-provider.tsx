'use client'
import React from 'react'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// 더미 훅: 실제 알림 기능이 필요하면 구현을 교체하세요
export function useNotifications() {
  return {
    notifications: [],
    unreadCount: 0,
    markAllAsRead: () => {},
    addNotification: () => {},
    removeNotification: () => {},
  }
} 