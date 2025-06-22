"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  User,
  Users,
  Wand2,
  Calendar,
  Settings,
  MessageSquare,
  ShoppingCart,
  BarChart3,
  FileText,
  LogOut,
  Bell,
  Rss,
} from "lucide-react"

const sidebarItems = [
  {
    title: "대시보드",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "콘텐츠 관리",
    href: "/admin/content-management",
    icon: FileText,
  },
  {
    title: "사용자 관리",
    href: "/admin/user-management",
    icon: Users,
  },
  {
    title: "알림 관리",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "소셜 미디어",
    href: "/admin/social-media",
    icon: Rss,
  },
  {
    title: "페르소나 설정",
    href: "/admin/persona",
    icon: User,
  },
  {
    title: "콘텐츠 생성기",
    href: "/admin/content-generator",
    icon: Wand2,
  },
  {
    title: "콘텐츠 달력",
    href: "/admin/content-calendar",
    icon: Calendar,
  },
  {
    title: "Q&A 관리",
    href: "/admin/qa-management",
    icon: MessageSquare,
  },
  {
    title: "쇼핑몰 관리",
    href: "/admin/shop-management",
    icon: ShoppingCart,
  },
  {
    title: "분석 리포트",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "시스템 설정",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">미나</span>
          </div>
          <span className="font-bold text-lg">관리자</span>
        </Link>
      </div>

      <nav className="px-4 pb-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-primary text-primary-foreground")}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>

        <div className="mt-8 pt-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </nav>
    </div>
  )
}
