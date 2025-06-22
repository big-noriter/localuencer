"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Home } from "lucide-react"
import Link from "next/link"

export default function AdminHeader() {
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              사이트 보기
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="관리자" />
              <AvatarFallback>관리자</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">관리자</span>
          </div>
        </div>
      </div>
    </header>
  )
}
