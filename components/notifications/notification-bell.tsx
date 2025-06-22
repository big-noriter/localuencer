"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Settings, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, type Notification, type NotificationType } from './notification-provider'
import { cn } from '@/lib/utils'

/**
 * 알림 타입별 아이콘
 */
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return '🛒'
    case 'comment':
      return '💬'
    case 'system':
      return '⚙️'
    case 'ai':
      return '🤖'
    case 'content':
      return '📝'
    case 'promotion':
      return '🎉'
    case 'chat':
      return '💭'
    default:
      return '📢'
  }
}

/**
 * 알림 타입별 색상
 */
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'order':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'comment':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'system':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'ai':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'content':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'promotion':
      return 'text-pink-600 bg-pink-50 border-pink-200'
    case 'chat':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

/**
 * 우선순위별 색상
 */
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100'
    case 'high':
      return 'text-orange-600 bg-orange-100'
    case 'medium':
      return 'text-blue-600 bg-blue-100'
    case 'low':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * 시간 포맷팅
 */
const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}

/**
 * 개별 알림 아이템 컴포넌트
 */
interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onRemove: (id: string) => void
  onAction?: (url: string) => void
}

function NotificationItem({ notification, onRead, onRemove, onAction }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id)
    }
    
    if (notification.actionUrl && onAction) {
      onAction(notification.actionUrl)
    }
  }

  return (
    <div
      className={cn(
        'p-4 border-l-4 transition-all duration-200 hover:bg-gray-50 cursor-pointer group',
        notification.isRead ? 'opacity-60' : 'bg-white',
        getNotificationColor(notification.type)
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* 알림 아이콘 */}
          <div className="text-lg flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          
          {/* 알림 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className={cn(
                'text-sm font-medium truncate',
                notification.isRead ? 'text-gray-600' : 'text-gray-900'
              )}>
                {notification.title}
              </h4>
              
              {/* 우선순위 배지 */}
              {notification.priority !== 'low' && (
                <Badge 
                  variant="outline" 
                  className={cn('text-xs px-1.5 py-0.5', getPriorityColor(notification.priority))}
                >
                  {notification.priority === 'urgent' ? '긴급' : 
                   notification.priority === 'high' ? '높음' : '보통'}
                </Badge>
              )}
            </div>
            
            <p className={cn(
              'text-sm mt-1 line-clamp-2',
              notification.isRead ? 'text-gray-500' : 'text-gray-700'
            )}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.createdAt)}
              </span>
              
              {notification.actionUrl && (
                <div className="flex items-center text-xs text-blue-600">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {notification.actionLabel || '보기'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 액션 버튼들 */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation()
                onRead(notification.id)
              }}
              title="읽음 처리"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(notification.id)
            }}
            title="삭제"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * 알림 벨 컴포넌트
 */
export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications()
  
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead
    }
    return true
  })

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen])

  const handleAction = (url: string) => {
    setIsOpen(false)
    window.location.href = url
  }

  return (
    <div className="relative">
      {/* 알림 벨 버튼 */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={cn(
          'relative p-2 hover:bg-gray-100',
          isOpen && 'bg-gray-100'
        )}
        onClick={() => setIsOpen(!isOpen)}
        title={`알림 ${unreadCount}개`}
      >
        <Bell className={cn(
          'h-5 w-5',
          unreadCount > 0 ? 'text-blue-600' : 'text-gray-600',
          !isConnected && 'text-gray-400'
        )} />
        
        {/* 읽지 않은 알림 카운트 */}
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        
        {/* 연결 상태 표시 */}
        <div className={cn(
          'absolute -bottom-1 -right-1 w-2 h-2 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        )} />
      </Button>

      {/* 알림 드롭다운 */}
      {isOpen && (
        <Card 
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] shadow-lg border z-50"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">알림</CardTitle>
              <div className="flex items-center space-x-2">
                {/* 연결 상태 */}
                <div className="flex items-center space-x-1">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isConnected ? 'bg-green-500' : 'bg-gray-400'
                  )} />
                  <span className="text-xs text-gray-500">
                    {isConnected ? '연결됨' : '연결 안됨'}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardDescription>
              총 {notifications.length}개의 알림 중 {unreadCount}개를 읽지 않았습니다.
            </CardDescription>
          </CardHeader>

          {/* 필터 및 액션 버튼 */}
          <div className="px-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  전체
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  읽지 않음 ({unreadCount})
                </Button>
              </div>
              
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    title="모두 읽음 처리"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    title="모든 알림 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 알림 목록 */}
          <CardContent className="p-0">
            {filteredNotifications.length > 0 ? (
              <ScrollArea className="max-h-96">
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onRemove={removeNotification}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {filter === 'unread' 
                    ? '읽지 않은 알림이 없습니다.' 
                    : '알림이 없습니다.'
                  }
                </p>
              </div>
            )}
          </CardContent>

          {/* 설정 링크 */}
          <Separator />
          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setIsOpen(false)
                window.location.href = '/settings/notifications'
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              알림 설정
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
} 