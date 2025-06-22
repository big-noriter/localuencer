"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Volume2, 
  Monitor, 
  Mail, 
  Smartphone,
  ShoppingCart,
  MessageSquare,
  Settings as SettingsIcon,
  Bot,
  FileText,
  Gift,
  MessageCircle,
  Save,
  RotateCcw
} from 'lucide-react'
import { useNotifications, type NotificationType } from './notification-provider'
import { toast } from 'sonner'

/**
 * 알림 타입별 정보
 */
const notificationTypeInfo = {
  order: {
    icon: ShoppingCart,
    label: '주문 알림',
    description: '새 주문, 배송 상태 변경 등'
  },
  comment: {
    icon: MessageSquare,
    label: '댓글 알림',
    description: '새 댓글, 답글, 좋아요 등'
  },
  system: {
    icon: SettingsIcon,
    label: '시스템 알림',
    description: '시스템 업데이트, 점검 공지 등'
  },
  ai: {
    icon: Bot,
    label: 'AI 기능 알림',
    description: 'AI 처리 완료, 오류 등'
  },
  content: {
    icon: FileText,
    label: '콘텐츠 알림',
    description: '새 브이로그, Q&A 답변 등'
  },
  promotion: {
    icon: Gift,
    label: '프로모션 알림',
    description: '이벤트, 할인 정보 등'
  },
  chat: {
    icon: MessageCircle,
    label: '채팅 알림',
    description: 'AI 가이드 메시지 등'
  }
}

/**
 * 알림 설정 컴포넌트
 */
export function NotificationSettings() {
  const { settings, updateSettings, isConnected } = useNotifications()

  const handleToggleType = (type: NotificationType, enabled: boolean) => {
    updateSettings({
      types: {
        ...settings.types,
        [type]: enabled
      }
    })
  }

  const handleSave = () => {
    toast.success('알림 설정이 저장되었습니다.')
  }

  const handleReset = () => {
    updateSettings({
      enabled: true,
      types: {
        order: true,
        comment: true,
        system: true,
        ai: true,
        content: true,
        promotion: false,
        chat: true
      },
      sound: true,
      desktop: true,
      email: false,
      frequency: 'realtime'
    })
    toast.success('알림 설정이 초기화되었습니다.')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">알림 설정</h1>
          <p className="text-gray-600">알림 수신 방식과 타입을 관리하세요</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-600">
              {isConnected ? '실시간 연결됨' : '연결 안됨'}
            </span>
          </div>
          
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            초기화
          </Button>
          
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      {/* 전체 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            전체 알림 설정
          </CardTitle>
          <CardDescription>
            모든 알림의 수신 여부를 제어합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled">알림 수신</Label>
              <p className="text-sm text-gray-500">모든 알림을 받을지 설정합니다</p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 알림 방식 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 방식</CardTitle>
          <CardDescription>
            알림을 받을 방식을 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-blue-600" />
                <div>
                  <Label>사운드 알림</Label>
                  <p className="text-sm text-gray-500">알림음 재생</p>
                </div>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(sound) => updateSettings({ sound })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-green-600" />
                <div>
                  <Label>데스크톱 알림</Label>
                  <p className="text-sm text-gray-500">브라우저 알림 표시</p>
                </div>
              </div>
              <Switch
                checked={settings.desktop}
                onCheckedChange={(desktop) => updateSettings({ desktop })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <Label>이메일 알림</Label>
                  <p className="text-sm text-gray-500">이메일로 알림 발송</p>
                </div>
              </div>
              <Switch
                checked={settings.email}
                onCheckedChange={(email) => updateSettings({ email })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-orange-600" />
                <div>
                  <Label>알림 빈도</Label>
                  <p className="text-sm text-gray-500">알림 수신 빈도</p>
                </div>
              </div>
              <Select
                value={settings.frequency}
                onValueChange={(frequency: 'realtime' | 'hourly' | 'daily') => 
                  updateSettings({ frequency })
                }
                disabled={!settings.enabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">실시간</SelectItem>
                  <SelectItem value="hourly">1시간마다</SelectItem>
                  <SelectItem value="daily">하루 1회</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 알림 타입별 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 타입</CardTitle>
          <CardDescription>
            받고 싶은 알림 타입을 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(notificationTypeInfo).map(([type, info]) => {
              const IconComponent = info.icon
              const isEnabled = settings.types[type as NotificationType]
              
              return (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Label>{info.label}</Label>
                        {type === 'promotion' && (
                          <Badge variant="outline" className="text-xs">선택사항</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(enabled) => handleToggleType(type as NotificationType, enabled)}
                    disabled={!settings.enabled}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 고급 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>고급 설정</CardTitle>
          <CardDescription>
            추가적인 알림 설정을 관리합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">브라우저 권한</h4>
            <p className="text-sm text-blue-700 mb-3">
              데스크톱 알림을 받으려면 브라우저 알림 권한이 필요합니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if ('Notification' in window) {
                  const permission = await Notification.requestPermission()
                  if (permission === 'granted') {
                    toast.success('알림 권한이 허용되었습니다.')
                  } else {
                    toast.error('알림 권한이 거부되었습니다.')
                  }
                } else {
                  toast.error('이 브라우저는 알림을 지원하지 않습니다.')
                }
              }}
            >
              권한 요청
            </Button>
          </div>

          <Separator />

          <div className="text-sm text-gray-600 space-y-2">
            <h4 className="font-medium">알림 정보</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>알림 설정은 브라우저에 저장되며 기기별로 관리됩니다</li>
              <li>실시간 알림은 웹소켓 연결이 필요합니다</li>
              <li>이메일 알림은 계정 설정에서 이메일 주소를 등록해야 합니다</li>
              <li>모바일에서는 일부 기능이 제한될 수 있습니다</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 