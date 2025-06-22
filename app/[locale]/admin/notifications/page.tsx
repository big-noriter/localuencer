"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Bell, 
  Plus, 
  Send, 
  Eye, 
  Trash2, 
  Users, 
  MessageSquare,
  ShoppingCart,
  Bot,
  FileText,
  Gift,
  MessageCircle,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { useNotify } from '@/components/notifications/notification-provider'
import type { NotificationType, NotificationPriority } from '@/components/notifications/notification-provider'

/**
 * 알림 생성 폼 데이터
 */
interface NotificationFormData {
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  targetUsers: 'all' | 'admin' | 'users' | 'vip'
  expiresAt?: string
}

/**
 * 알림 통계 인터페이스
 */
interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

/**
 * 알림 타입별 정보
 */
const notificationTypeInfo = {
  order: { icon: ShoppingCart, label: '주문', color: 'bg-green-100 text-green-800' },
  comment: { icon: MessageSquare, label: '댓글', color: 'bg-blue-100 text-blue-800' },
  system: { icon: Settings, label: '시스템', color: 'bg-gray-100 text-gray-800' },
  ai: { icon: Bot, label: 'AI', color: 'bg-purple-100 text-purple-800' },
  content: { icon: FileText, label: '콘텐츠', color: 'bg-orange-100 text-orange-800' },
  promotion: { icon: Gift, label: '프로모션', color: 'bg-pink-100 text-pink-800' },
  chat: { icon: MessageCircle, label: '채팅', color: 'bg-indigo-100 text-indigo-800' }
}

/**
 * 우선순위별 정보
 */
const priorityInfo = {
  low: { label: '낮음', color: 'bg-gray-100 text-gray-800', icon: Clock },
  medium: { label: '보통', color: 'bg-blue-100 text-blue-800', icon: Bell },
  high: { label: '높음', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  urgent: { label: '긴급', color: 'bg-red-100 text-red-800', icon: Zap }
}

/**
 * 관리자 알림 관리 페이지
 */
export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {
      order: 0,
      comment: 0,
      system: 0,
      ai: 0,
      content: 0,
      promotion: 0,
      chat: 0
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<NotificationFormData>({
    type: 'system',
    priority: 'medium',
    title: '',
    message: '',
    targetUsers: 'all'
  })

  const notify = useNotify()

  /**
   * 알림 목록 조회
   */
  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications')
      const result = await response.json()
      
      if (result.success) {
        setNotifications(result.data.notifications)
        
        // 통계 계산
        const newStats: NotificationStats = {
          total: result.data.total,
          unread: result.data.unreadCount,
          byType: {
            order: 0,
            comment: 0,
            system: 0,
            ai: 0,
            content: 0,
            promotion: 0,
            chat: 0
          },
          byPriority: {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0
          }
        }
        
        result.data.notifications.forEach((notif: any) => {
          newStats.byType[notif.type as NotificationType]++
          newStats.byPriority[notif.priority as NotificationPriority]++
        })
        
        setStats(newStats)
      }
    } catch (error) {
      console.error('알림 조회 오류:', error)
      toast.error('알림 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 새 알림 생성
   */
  const createNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('제목과 메시지를 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('알림이 생성되었습니다.')
        setIsCreateDialogOpen(false)
        setFormData({
          type: 'system',
          priority: 'medium',
          title: '',
          message: '',
          targetUsers: 'all'
        })
        
        // 실시간으로 알림 전송 (테스트용)
        notify(
          formData.type,
          formData.title,
          formData.message,
          {
            priority: formData.priority,
            actionUrl: formData.actionUrl,
            actionLabel: formData.actionLabel
          }
        )
        
        fetchNotifications()
      } else {
        toast.error(result.error || '알림 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('알림 생성 오류:', error)
      toast.error('알림 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 알림 삭제
   */
  const deleteNotification = async (notificationId: string) => {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/notifications?ids=${notificationId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('알림이 삭제되었습니다.')
        fetchNotifications()
      } else {
        toast.error(result.error || '알림 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('알림 삭제 오류:', error)
      toast.error('알림 삭제에 실패했습니다.')
    }
  }

  /**
   * 빠른 알림 전송
   */
  const sendQuickNotification = (type: NotificationType, title: string, message: string) => {
    notify(type, title, message, { priority: 'medium' })
    toast.success('알림이 전송되었습니다.')
  }

  /**
   * 시간 포맷팅
   */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ko-KR')
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">알림 관리</h1>
          <p className="text-muted-foreground">시스템 알림을 생성하고 관리하세요</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchNotifications} disabled={isLoading}>
            새로고침
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                알림 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 알림 생성</DialogTitle>
                <DialogDescription>
                  사용자에게 전송할 알림을 생성합니다
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">알림 타입</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: NotificationType) => 
                        setFormData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(notificationTypeInfo).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            {info.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">우선순위</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: NotificationPriority) => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityInfo).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            {info.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="알림 제목을 입력하세요"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">메시지</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="알림 메시지를 입력하세요"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actionUrl">액션 URL (선택)</Label>
                    <Input
                      id="actionUrl"
                      value={formData.actionUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                      placeholder="/page-url"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="actionLabel">액션 라벨 (선택)</Label>
                    <Input
                      id="actionLabel"
                      value={formData.actionLabel || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionLabel: e.target.value }))}
                      placeholder="보기"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="targetUsers">대상 사용자</Label>
                  <Select
                    value={formData.targetUsers}
                    onValueChange={(value: 'all' | 'admin' | 'users' | 'vip') => 
                      setFormData(prev => ({ ...prev, targetUsers: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 사용자</SelectItem>
                      <SelectItem value="admin">관리자만</SelectItem>
                      <SelectItem value="users">일반 사용자</SelectItem>
                      <SelectItem value="vip">VIP 사용자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={createNotification} disabled={isLoading}>
                  <Send className="w-4 h-4 mr-2" />
                  생성
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 알림</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              읽지 않음 {stats.unread}개
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">긴급 알림</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.byPriority.urgent}</div>
            <p className="text-xs text-muted-foreground">
              즉시 처리 필요
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주문 알림</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.byType.order}</div>
            <p className="text-xs text-muted-foreground">
              주문 관련 알림
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 알림</CardTitle>
            <Bot className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.byType.ai}</div>
            <p className="text-xs text-muted-foreground">
              AI 기능 관련
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 알림 전송 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 알림 전송</CardTitle>
          <CardDescription>
            자주 사용하는 알림을 빠르게 전송할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => sendQuickNotification(
                'order',
                '새 주문 접수',
                '새로운 주문이 접수되었습니다. 확인해주세요.'
              )}
            >
              <ShoppingCart className="h-6 w-6 text-green-600" />
              <span className="text-sm">주문 알림</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => sendQuickNotification(
                'system',
                '시스템 점검 안내',
                '시스템 점검이 예정되어 있습니다.'
              )}
            >
              <Settings className="h-6 w-6 text-gray-600" />
              <span className="text-sm">시스템 공지</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => sendQuickNotification(
                'promotion',
                '특별 할인 이벤트',
                '경주 특산품 20% 할인 이벤트가 시작되었습니다!'
              )}
            >
              <Gift className="h-6 w-6 text-pink-600" />
              <span className="text-sm">프로모션</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => sendQuickNotification(
                'content',
                '새 콘텐츠 업로드',
                '새로운 브이로그가 업로드되었습니다.'
              )}
            >
              <FileText className="h-6 w-6 text-orange-600" />
              <span className="text-sm">콘텐츠 알림</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 알림 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 목록</CardTitle>
          <CardDescription>
            생성된 모든 알림을 확인하고 관리할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">로딩 중...</p>
            </div>
          ) : notifications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>타입</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>우선순위</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const typeInfo = notificationTypeInfo[notification.type as NotificationType]
                  const priorityInfo = priorityInfo[notification.priority as NotificationPriority]
                  const IconComponent = typeInfo.icon
                  
                  return (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <Badge variant="outline" className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {notification.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityInfo.color}>
                          {priorityInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </TableCell>
                      <TableCell>
                        {notification.isRead ? (
                          <Badge variant="outline">읽음</Badge>
                        ) : (
                          <Badge>읽지 않음</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">생성된 알림이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 