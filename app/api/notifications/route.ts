import { NextRequest, NextResponse } from 'next/server'

/**
 * 알림 인터페이스 (프론트엔드와 동일)
 */
interface Notification {
  id: string
  type: 'order' | 'comment' | 'system' | 'ai' | 'content' | 'promotion' | 'chat'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
  actionUrl?: string
  actionLabel?: string
  userId?: string
  avatar?: string
}

/**
 * 목업 알림 데이터
 */
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    priority: 'high',
    title: '새로운 주문이 접수되었습니다',
    message: '경주 황남빵 세트 주문이 들어왔습니다. 총 25,000원',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    actionUrl: '/admin/orders',
    actionLabel: '주문 확인',
    userId: 'admin',
    data: { orderId: 'order-123', amount: 25000 }
  },
  {
    id: '2',
    type: 'comment',
    priority: 'medium',
    title: '새 댓글이 작성되었습니다',
    message: '"불국사 정말 아름다워요! 다음에 꼭 가보고 싶어요 😊"',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    actionUrl: '/vlogs/bulguksa-temple',
    actionLabel: '댓글 보기',
    userId: 'user-456',
    avatar: '/images/users/user-456.jpg',
    data: { vlogId: 'bulguksa-temple', commentId: 'comment-789' }
  },
  {
    id: '3',
    type: 'ai',
    priority: 'low',
    title: 'AI 사진엽서 생성 완료',
    message: '석굴암 배경의 사진엽서가 성공적으로 생성되었습니다.',
    isRead: true,
    createdAt: new Date(Date.now() - 32 * 60 * 1000),
    actionUrl: '/photo-postcard?result=seokguram-001',
    actionLabel: '다운로드',
    userId: 'user-123',
    data: { imageId: 'seokguram-001', location: '석굴암' }
  },
  {
    id: '4',
    type: 'system',
    priority: 'medium',
    title: '시스템 업데이트 완료',
    message: 'AI 가이드 구글맵 연동 기능이 업데이트되었습니다.',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actionUrl: '/ai-guide',
    actionLabel: '체험하기',
    data: { version: '2.1.0', feature: 'google-maps' }
  },
  {
    id: '5',
    type: 'content',
    priority: 'medium',
    title: '새로운 브이로그가 업로드되었습니다',
    message: '"경주 대릉원 야경 투어" 영상을 확인해보세요!',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    actionUrl: '/vlogs/daereungwon-night',
    actionLabel: '시청하기',
    data: { vlogId: 'daereungwon-night', duration: '12:34' }
  },
  {
    id: '6',
    type: 'promotion',
    priority: 'high',
    title: '경주 특산품 할인 이벤트',
    message: '경주 법주와 황남빵이 20% 할인! 오늘 하루만 특가',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
    actionUrl: '/shop?category=specialty&discount=true',
    actionLabel: '쇼핑하기',
    data: { discount: 20, products: ['beopju', 'hwangnam-bread'] }
  },
  {
    id: '7',
    type: 'chat',
    priority: 'low',
    title: 'AI 가이드 미나가 답변했습니다',
    message: '경주 맛집 추천에 대한 답변을 확인해보세요!',
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    actionUrl: '/ai-guide',
    actionLabel: '채팅 보기',
    data: { chatId: 'chat-456', topic: '맛집 추천' }
  }
]

/**
 * GET /api/notifications
 * 알림 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'admin'
    const type = searchParams.get('type')
    const isRead = searchParams.get('isRead')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 사용자별 필터링
    let filteredNotifications = mockNotifications.filter(n => 
      !n.userId || n.userId === userId || userId === 'admin'
    )

    // 타입 필터링
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }

    // 읽음 상태 필터링
    if (isRead !== null) {
      const readStatus = isRead === 'true'
      filteredNotifications = filteredNotifications.filter(n => n.isRead === readStatus)
    }

    // 만료된 알림 제외
    filteredNotifications = filteredNotifications.filter(n => 
      !n.expiresAt || n.expiresAt > new Date()
    )

    // 정렬 (최신순)
    filteredNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // 페이지네이션
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        total: filteredNotifications.length,
        unreadCount: filteredNotifications.filter(n => !n.isRead).length,
        hasMore: offset + limit < filteredNotifications.length
      }
    })

  } catch (error) {
    console.error('알림 조회 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '알림을 불러오는데 실패했습니다.' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * 새 알림 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      priority = 'medium',
      title,
      message,
      data,
      actionUrl,
      actionLabel,
      userId,
      expiresAt
    } = body

    // 필수 필드 검증
    if (!type || !title || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: '필수 필드가 누락되었습니다.' 
        },
        { status: 400 }
      )
    }

    // 새 알림 생성
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      priority,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date(),
      actionUrl,
      actionLabel,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    }

    // 목업 데이터에 추가 (실제 환경에서는 DB에 저장)
    mockNotifications.unshift(newNotification)

    // 실시간 알림 전송 (웹소켓)
    // 실제 환경에서는 웹소켓 서버로 브로드캐스트
    console.log('새 알림 생성:', newNotification)

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: '알림이 생성되었습니다.'
    })

  } catch (error) {
    console.error('알림 생성 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '알림 생성에 실패했습니다.' 
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * 알림 상태 업데이트 (읽음 처리 등)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, action, userId = 'admin' } = body

    if (!ids || !Array.isArray(ids) || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: '잘못된 요청 형식입니다.' 
        },
        { status: 400 }
      )
    }

    let updatedCount = 0

    // 알림 상태 업데이트
    mockNotifications.forEach(notification => {
      if (ids.includes(notification.id) && 
          (!notification.userId || notification.userId === userId || userId === 'admin')) {
        
        switch (action) {
          case 'read':
            notification.isRead = true
            updatedCount++
            break
          case 'unread':
            notification.isRead = false
            updatedCount++
            break
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount}개의 알림이 업데이트되었습니다.`
    })

  } catch (error) {
    console.error('알림 업데이트 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '알림 업데이트에 실패했습니다.' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications
 * 알림 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',') || []
    const userId = searchParams.get('userId') || 'admin'

    if (ids.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '삭제할 알림 ID가 필요합니다.' 
        },
        { status: 400 }
      )
    }

    // 알림 삭제
    const initialLength = mockNotifications.length
    
    // 권한 체크 후 삭제
    for (let i = mockNotifications.length - 1; i >= 0; i--) {
      const notification = mockNotifications[i]
      if (ids.includes(notification.id) && 
          (!notification.userId || notification.userId === userId || userId === 'admin')) {
        mockNotifications.splice(i, 1)
      }
    }

    const deletedCount = initialLength - mockNotifications.length

    return NextResponse.json({
      success: true,
      data: { deletedCount },
      message: `${deletedCount}개의 알림이 삭제되었습니다.`
    })

  } catch (error) {
    console.error('알림 삭제 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '알림 삭제에 실패했습니다.' 
      },
      { status: 500 }
    )
  }
} 