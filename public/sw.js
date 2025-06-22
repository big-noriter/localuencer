/**
 * 향상된 Service Worker
 * 오프라인 모드 지원을 위한 리소스 캐싱 및 백그라운드 동기화
 */

const CACHE_NAME = 'mina-localuencer-v2'
const OFFLINE_CACHE = 'mina-offline-v1'
const STATIC_CACHE = 'mina-static-v1'
const API_CACHE = 'mina-api-v1'

// 캐시할 정적 리소스들
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/mina-hero.png',
  '/mina-casual.png',
  '/mina-active.png',
  '/placeholder.jpg'
]

// 캐시할 페이지들 (오프라인에서도 접근 가능)
const OFFLINE_PAGES = [
  '/',
  '/vlogs',
  '/shop',
  '/qa',
  '/sns',
  '/cart',
  '/my/orders',
  '/my/wishlist'
]

// API 엔드포인트 캐싱 규칙
const API_CACHE_PATTERNS = [
  /\/api\/vlogs/,
  /\/api\/shop/,
  /\/api\/qna/,
  /\/api\/sns\/feed/
]

/**
 * Service Worker 설치 이벤트
 * 기본 리소스들을 캐시에 저장
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...')
  
  event.waitUntil(
    Promise.all([
      // 정적 자산 캐싱
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      // 오프라인 페이지 캐싱
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.addAll(OFFLINE_PAGES)
      })
    ]).then(() => {
      console.log('Service Worker 설치 완료')
      self.skipWaiting()
    })
  )
})

/**
 * Service Worker 활성화 이벤트
 * 이전 캐시 정리 및 새 캐시 활성화
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화 중...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, OFFLINE_CACHE, STATIC_CACHE, API_CACHE].includes(cacheName)) {
            console.log('이전 캐시 삭제:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker 활성화 완료')
      self.clients.claim()
    })
  )
})

/**
 * 네트워크 요청 가로채기
 * 캐시 우선 또는 네트워크 우선 전략 적용
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 외부 도메인 요청은 처리하지 않음
  if (url.origin !== location.origin) {
    return
  }

  // GET 요청만 캐싱
  if (request.method !== 'GET') {
    return
  }

  event.respondWith(handleFetchRequest(request))
})

/**
 * 요청 처리 함수
 * 요청 유형에 따라 적절한 캐싱 전략 적용
 */
async function handleFetchRequest(request) {
  const url = new URL(request.url)
  
  try {
    // API 요청 처리
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request)
    }
    
    // 정적 자산 처리
    if (isStaticAsset(url.pathname)) {
      return await handleStaticAsset(request)
    }
    
    // 페이지 요청 처리
    return await handlePageRequest(request)
    
  } catch (error) {
    console.error('요청 처리 실패:', error)
    return await handleOfflineFallback(request)
  }
}

/**
 * API 요청 처리 (네트워크 우선, 캐시 백업)
 */
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  // API 캐싱 대상인지 확인
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))
  
  if (!shouldCache) {
    return fetch(request)
  }
  
  try {
    // 네트워크에서 최신 데이터 가져오기
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // 성공적인 응답을 캐시에 저장
      const cache = await caches.open(API_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    // 네트워크 실패 시 캐시에서 가져오기
    console.log('네트워크 실패, 캐시에서 응답:', url.pathname)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

/**
 * 정적 자산 처리 (캐시 우선)
 */
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  // 캐시에 없으면 네트워크에서 가져와서 캐시에 저장
  const networkResponse = await fetch(request)
  
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE)
    await cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

/**
 * 페이지 요청 처리 (네트워크 우선, 오프라인 폴백)
 */
async function handlePageRequest(request) {
  try {
    // 네트워크에서 최신 페이지 가져오기
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // 성공적인 응답을 캐시에 저장
      const cache = await caches.open(OFFLINE_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    // 네트워크 실패 시 캐시된 페이지 반환
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 캐시에도 없으면 오프라인 페이지 반환
    return await caches.match('/offline.html')
  }
}

/**
 * 오프라인 폴백 처리
 */
async function handleOfflineFallback(request) {
  const url = new URL(request.url)
  
  // 페이지 요청인 경우 오프라인 페이지 반환
  if (request.destination === 'document') {
    return await caches.match('/offline.html')
  }
  
  // 이미지 요청인 경우 플레이스홀더 반환
  if (request.destination === 'image') {
    return await caches.match('/placeholder.jpg')
  }
  
  // 기타 요청은 기본 오프라인 응답
  return new Response('오프라인 상태입니다', {
    status: 503,
    statusText: 'Service Unavailable'
  })
}

/**
 * 정적 자산 확인 함수
 */
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2']
  return staticExtensions.some(ext => pathname.endsWith(ext)) || pathname.startsWith('/_next/')
}

/**
 * 백그라운드 동기화 이벤트
 * 네트워크 연결 복구 시 대기 중인 작업 처리
 */
self.addEventListener('sync', (event) => {
  console.log('백그라운드 동기화 시작:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

/**
 * 백그라운드 동기화 처리
 */
async function handleBackgroundSync() {
  try {
    // IndexedDB에서 대기 중인 작업들 가져오기
    const pendingActions = await getPendingActions()
    
    for (const action of pendingActions) {
      try {
        await processPendingAction(action)
        await removePendingAction(action.id)
        console.log('대기 작업 처리 완료:', action.id)
      } catch (error) {
        console.error('대기 작업 처리 실패:', action.id, error)
      }
    }
    
    // 클라이언트에게 동기화 완료 알림
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        processedCount: pendingActions.length
      })
    })
    
  } catch (error) {
    console.error('백그라운드 동기화 실패:', error)
  }
}

/**
 * 대기 중인 작업들 가져오기 (IndexedDB)
 */
async function getPendingActions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MinaOfflineDB', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pendingActions'], 'readonly')
      const store = transaction.objectStore('pendingActions')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result)
      }
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error)
      }
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * 대기 작업 처리
 */
async function processPendingAction(action) {
  const { type, data } = action
  
  switch (type) {
    case 'cart_add':
      return await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
    case 'cart_update':
      return await fetch(`/api/cart/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
    case 'cart_remove':
      return await fetch(`/api/cart/${data.id}`, {
        method: 'DELETE'
      })
      
    case 'qa_submit':
      return await fetch('/api/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
    default:
      throw new Error(`알 수 없는 작업 유형: ${type}`)
  }
}

/**
 * 처리된 대기 작업 제거
 */
async function removePendingAction(actionId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MinaOfflineDB', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')
      const deleteRequest = store.delete(actionId)
      
      deleteRequest.onsuccess = () => {
        resolve()
      }
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error)
      }
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

/**
 * 푸시 알림 이벤트
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: data.url
      })
    )
  }
})

/**
 * 알림 클릭 이벤트
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    )
  }
}) 