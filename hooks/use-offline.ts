/**
 * 오프라인 상태 관리 및 데이터 동기화를 위한 커스텀 훅
 * 네트워크 상태를 감지하고 오프라인 데이터를 관리
 */

import { useState, useEffect, useCallback } from 'react'
import { offlineStorage, offlineHelpers } from '@/lib/offline-storage'
import { toast } from 'sonner'

interface OfflineState {
  isOnline: boolean
  isLoading: boolean
  pendingActionsCount: number
  storageSize: number
  lastSync: Date | null
}

interface OfflineActions {
  syncData: () => Promise<void>
  clearCache: () => Promise<void>
  getCachedData: (type: 'vlogs' | 'products' | 'qas') => Promise<any[]>
  saveForOffline: (type: string, data: any) => Promise<void>
  processPendingActions: () => Promise<void>
}

export function useOffline(): OfflineState & OfflineActions {
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    isLoading: false,
    pendingActionsCount: 0,
    storageSize: 0,
    lastSync: null
  })

  /**
   * 네트워크 상태 변경 감지
   */
  useEffect(() => {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine
      setState(prev => ({ ...prev, isOnline }))
      
      // 온라인 복구 시 대기 중인 액션 처리
      if (isOnline && !state.isOnline) {
        processPendingActions()
        toast.success('인터넷 연결이 복구되었습니다. 대기 중인 작업을 처리합니다.')
      }
    }

    // 초기 상태 설정
    updateOnlineStatus()

    // 이벤트 리스너 등록
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [state.isOnline])

  /**
   * 오프라인 저장소 상태 업데이트
   */
  const updateStorageInfo = useCallback(async () => {
    try {
      const pendingActions = await offlineStorage.getPendingActions()
      const storageSize = await offlineStorage.getStorageSize()
      
      setState(prev => ({
        ...prev,
        pendingActionsCount: pendingActions.length,
        storageSize
      }))
    } catch (error) {
      console.error('저장소 정보 업데이트 실패:', error)
    }
  }, [])

  /**
   * 앱 초기화 시 저장소 정보 로드
   */
  useEffect(() => {
    updateStorageInfo()
    
    // 주기적으로 저장소 정보 업데이트 (5분마다)
    const interval = setInterval(updateStorageInfo, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [updateStorageInfo])

  /**
   * 데이터 동기화
   */
  const syncData = useCallback(async () => {
    if (!state.isOnline) {
      toast.error('인터넷 연결이 필요합니다.')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // 서버에서 최신 데이터 가져오기
      const responses = await Promise.allSettled([
        fetch('/api/vlogs').then(res => res.json()),
        fetch('/api/shop').then(res => res.json()),
        fetch('/api/qna').then(res => res.json())
      ])

      // 성공한 응답만 처리
      const [vlogsResponse, productsResponse, qasResponse] = responses

      if (vlogsResponse.status === 'fulfilled' && vlogsResponse.value.vlogs) {
        await offlineHelpers.cacheVlogs(vlogsResponse.value.vlogs)
      }

      if (productsResponse.status === 'fulfilled' && productsResponse.value.products) {
        await offlineHelpers.cacheProducts(productsResponse.value.products)
      }

      if (qasResponse.status === 'fulfilled' && qasResponse.value.qas) {
        await offlineHelpers.cacheQAs(qasResponse.value.qas)
      }

      // 대기 중인 액션 처리
      await processPendingActions()

      setState(prev => ({ 
        ...prev, 
        lastSync: new Date(),
        isLoading: false 
      }))

      await updateStorageInfo()
      toast.success('데이터 동기화가 완료되었습니다.')

    } catch (error) {
      console.error('데이터 동기화 실패:', error)
      setState(prev => ({ ...prev, isLoading: false }))
      toast.error('데이터 동기화에 실패했습니다.')
    }
  }, [state.isOnline, updateStorageInfo])

  /**
   * 캐시 삭제
   */
  const clearCache = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      await offlineStorage.clearExpiredData()
      await updateStorageInfo()
      
      setState(prev => ({ ...prev, isLoading: false }))
      toast.success('캐시가 정리되었습니다.')
    } catch (error) {
      console.error('캐시 정리 실패:', error)
      setState(prev => ({ ...prev, isLoading: false }))
      toast.error('캐시 정리에 실패했습니다.')
    }
  }, [updateStorageInfo])

  /**
   * 캐시된 데이터 조회
   */
  const getCachedData = useCallback(async (type: 'vlogs' | 'products' | 'qas') => {
    try {
      switch (type) {
        case 'vlogs':
          return await offlineHelpers.getCachedVlogs()
        case 'products':
          return await offlineHelpers.getCachedProducts()
        case 'qas':
          return await offlineHelpers.getCachedQAs()
        default:
          return []
      }
    } catch (error) {
      console.error('캐시된 데이터 조회 실패:', error)
      return []
    }
  }, [])

  /**
   * 오프라인용 데이터 저장
   */
  const saveForOffline = useCallback(async (type: string, data: any) => {
    try {
      await offlineHelpers.saveUserData(type, data)
      await updateStorageInfo()
      
      if (!state.isOnline) {
        toast.info('오프라인 상태입니다. 데이터가 로컬에 저장되었습니다.')
      }
    } catch (error) {
      console.error('오프라인 데이터 저장 실패:', error)
      toast.error('데이터 저장에 실패했습니다.')
    }
  }, [state.isOnline, updateStorageInfo])

  /**
   * 대기 중인 액션 처리
   */
  const processPendingActions = useCallback(async () => {
    if (!state.isOnline) return

    try {
      await offlineHelpers.processPendingActions()
      await updateStorageInfo()
    } catch (error) {
      console.error('대기 중인 액션 처리 실패:', error)
    }
  }, [state.isOnline, updateStorageInfo])

  return {
    ...state,
    syncData,
    clearCache,
    getCachedData,
    saveForOffline,
    processPendingActions
  }
} 