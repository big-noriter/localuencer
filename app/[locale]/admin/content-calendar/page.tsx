"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Plus, Eye, Edit, Trash2 } from "lucide-react"

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Mock content data
  const contentItems = [
    {
      id: 1,
      title: "미나의 겨울 패션 하울",
      type: "브이로그",
      date: "2025-06-23",
      status: "예약됨",
      time: "18:00",
    },
    {
      id: 2,
      title: "Q&A: 연말 계획은?",
      type: "Q&A",
      date: "2025-06-24",
      status: "초안 작성중",
      time: "20:00",
    },
    {
      id: 3,
      title: "크리스마스 한정 상품 출시",
      type: "쇼핑",
      date: "2025-06-25",
      status: "기획중",
      time: "12:00",
    },
    {
      id: 4,
      title: "새해 인사 브이로그",
      type: "브이로그",
      date: "2025-06-26",
      status: "아이디어",
      time: "19:00",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "예약됨":
        return "default"
      case "초안 작성중":
        return "secondary"
      case "기획중":
        return "outline"
      case "아이디어":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "브이로그":
        return "bg-blue-100 text-blue-800"
      case "Q&A":
        return "bg-green-100 text-green-800"
      case "쇼핑":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getContentForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return contentItems.filter((item) => item.date === dateStr)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="mr-3 h-8 w-8" />
            콘텐츠 달력
          </h1>
          <p className="text-gray-600">콘텐츠 발행 스케줄을 관리하고 예약 발행을 설정하세요</p>
        </div>
        <Button className="bg-primary">
          <Plus className="mr-2 h-4 w-4" />새 콘텐츠 예약
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => (
                  <div key={index} className="min-h-[100px] p-1 border border-gray-200 rounded">
                    {day && (
                      <>
                        <div className="text-sm font-medium mb-1">{day}</div>
                        <div className="space-y-1">
                          {getContentForDate(day).map((content) => (
                            <div
                              key={content.id}
                              className={`text-xs p-1 rounded ${getTypeColor(content.type)} truncate`}
                            >
                              {content.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>예정된 콘텐츠</CardTitle>
              <CardDescription>다가오는 콘텐츠 일정</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentItems.map((content) => (
                  <div key={content.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{content.title}</h4>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {content.date} {content.time}
                      </span>
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {content.type}
                        </Badge>
                        <Badge variant={getStatusColor(content.status)} className="text-xs">
                          {content.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI 추천 아이디어</CardTitle>
              <CardDescription>트렌드 기반 콘텐츠 제안</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "2025년 뷰티 트렌드 예측",
                  "겨울 홈카페 레시피",
                  "새해 목표 설정 가이드",
                  "미니멀 라이프 시작하기",
                ].map((idea, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{idea}</span>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
