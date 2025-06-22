"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Settings, Key, Bell, Shield, Save } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    openaiApiKey: "",
    autoResponse: true,
    emailNotifications: true,
    contentModeration: true,
    backupEnabled: true,
  })

  const handleSave = () => {
    // In a real app, this would save to your database/environment
    console.log("Saving settings:", settings)
    alert("설정이 저장되었습니다!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3 h-8 w-8" />
            시스템 설정
          </h1>
          <p className="text-gray-600">외부 API 키 및 시스템 설정을 관리하세요</p>
        </div>
        <Button onClick={handleSave} className="bg-primary">
          <Save className="mr-2 h-4 w-4" />
          설정 저장
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              API 설정
            </CardTitle>
            <CardDescription>외부 서비스 연동을 위한 API 키를 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="openaiApiKey">OpenAI API 키</Label>
              <Input
                id="openaiApiKey"
                type="password"
                placeholder="sk-..."
                value={settings.openaiApiKey}
                onChange={(e) => setSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">Q&A 자동 답변 및 콘텐츠 생성에 사용됩니다</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">API 사용량</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>이번 달 사용량</span>
                  <span className="font-medium">$12.34 / $50.00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              알림 설정
            </CardTitle>
            <CardDescription>시스템 알림 및 자동화 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoResponse">자동 응답</Label>
                <p className="text-xs text-gray-500">새로운 Q&A에 자동으로 답변을 생성합니다</p>
              </div>
              <Switch
                id="autoResponse"
                checked={settings.autoResponse}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoResponse: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">이메일 알림</Label>
                <p className="text-xs text-gray-500">중요한 활동에 대한 이메일 알림을 받습니다</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contentModeration">콘텐츠 검열</Label>
                <p className="text-xs text-gray-500">부적절한 콘텐츠를 자동으로 필터링합니다</p>
              </div>
              <Switch
                id="contentModeration"
                checked={settings.contentModeration}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, contentModeration: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security & Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            보안 및 백업
          </CardTitle>
          <CardDescription>데이터 보안 및 백업 설정을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">백업 설정</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backupEnabled">자동 백업</Label>
                  <p className="text-xs text-gray-500">매일 자동으로 데이터를 백업합니다</p>
                </div>
                <Switch
                  id="backupEnabled"
                  checked={settings.backupEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, backupEnabled: checked }))}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>마지막 백업: 2025년 6월 21일 03:00</p>
                <p>백업 크기: 2.3 GB</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">보안 로그</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>관리자 로그인</span>
                  <span className="text-gray-500">2시간 전</span>
                </div>
                <div className="flex justify-between">
                  <span>API 키 업데이트</span>
                  <span className="text-gray-500">1일 전</span>
                </div>
                <div className="flex justify-between">
                  <span>설정 변경</span>
                  <span className="text-gray-500">3일 전</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 상태</CardTitle>
          <CardDescription>현재 시스템 상태 및 성능 지표</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-500">가동률</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <div className="text-sm text-gray-500">평균 응답시간</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">45%</div>
              <div className="text-sm text-gray-500">CPU 사용률</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">2.1GB</div>
              <div className="text-sm text-gray-500">메모리 사용량</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
