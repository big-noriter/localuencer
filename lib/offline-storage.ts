/**
 * 오프라인 데이터 저장을 위한 IndexedDB 유틸리티
 * 사용자가 오프라인 상태에서도 기본적인 데이터에 접근할 수 있도록 지원
 */

interface OfflineData {
  id: string
  type: 'vlog' | 'product' | 'qa' | 'user_data'
  data: any
  timestamp: number
  expiry?: number
}

interface PendingAction {
  id: string
  type: 'cart_add' | 'cart_update' | 'cart_remove' | 'qa_submit'
  data: any
  timestamp: number
}

class OfflineStorage {
  private dbName = 'MinaOfflineDB'
  private version = 1
  private db: IDBDatabase | null = null

  /**
   * IndexedDB 초기화
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 오프라인 데이터 저장소
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // 대기 중인 액션 저장소
        if (!db.objectStoreNames.contains('pendingActions')) {
          const actionStore = db.createObjectStore('pendingActions', { keyPath: 'id' })
          actionStore.createIndex('type', 'type', { unique: false })
          actionStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // 캐시된 이미지 메타데이터
        if (!db.objectStoreNames.contains('cachedImages')) {
          const imageStore = db.createObjectStore('cachedImages', { keyPath: 'url' })
          imageStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  /**
   * 데이터 저장
   */
  async saveData(data: OfflineData): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 데이터 조회
   */
  async getData(id: string): Promise<OfflineData | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly')
      const store = transaction.objectStore('offlineData')
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        
        // 만료 시간 확인
        if (result && result.expiry && Date.now() > result.expiry) {
          this.deleteData(id)
          resolve(null)
        } else {
          resolve(result || null)
        }
      }
    })
  }

  /**
   * 타입별 데이터 조회
   */
  async getDataByType(type: OfflineData['type']): Promise<OfflineData[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly')
      const store = transaction.objectStore('offlineData')
      const index = store.index('type')
      const request = index.getAll(type)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const results = request.result.filter(item => {
          // 만료된 데이터 필터링
          if (item.expiry && Date.now() > item.expiry) {
            this.deleteData(item.id)
            return false
          }
          return true
        })
        resolve(results)
      }
    })
  }

  /**
   * 데이터 삭제
   */
  async deleteData(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 대기 중인 액션 저장
   */
  async savePendingAction(action: PendingAction): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')
      const request = store.put(action)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 대기 중인 액션 조회
   */
  async getPendingActions(): Promise<PendingAction[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readonly')
      const store = transaction.objectStore('pendingActions')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  /**
   * 대기 중인 액션 삭제
   */
  async deletePendingAction(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 캐시 정리 (오래된 데이터 삭제)
   */
  async clearExpiredData(): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db.transaction(['offlineData'], 'readwrite')
    const store = transaction.objectStore('offlineData')
    const request = store.getAll()

    request.onsuccess = () => {
      const results = request.result
      const now = Date.now()
      
      results.forEach(item => {
        if (item.expiry && now > item.expiry) {
          store.delete(item.id)
        }
      })
    }
  }

  /**
   * 저장소 크기 확인
   */
  async getStorageSize(): Promise<number> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly')
      const store = transaction.objectStore('offlineData')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const data = request.result
        const size = JSON.stringify(data).length
        resolve(size)
      }
    })
  }
}

// 싱글톤 인스턴스
export const offlineStorage = new OfflineStorage()

/**
 * 오프라인 데이터 헬퍼 함수들
 */
export const offlineHelpers = {
  /**
   * 브이로그 데이터 캐시
   */
  async cacheVlogs(vlogs: any[]): Promise<void> {
    const expiry = Date.now() + (24 * 60 * 60 * 1000) // 24시간
    
    for (const vlog of vlogs) {
      await offlineStorage.saveData({
        id: `vlog_${vlog.id}`,
        type: 'vlog',
        data: vlog,
        timestamp: Date.now(),
        expiry
      })
    }
  },

  /**
   * 상품 데이터 캐시
   */
  async cacheProducts(products: any[]): Promise<void> {
    const expiry = Date.now() + (12 * 60 * 60 * 1000) // 12시간
    
    for (const product of products) {
      await offlineStorage.saveData({
        id: `product_${product.id}`,
        type: 'product',
        data: product,
        timestamp: Date.now(),
        expiry
      })
    }
  },

  /**
   * Q&A 데이터 캐시
   */
  async cacheQAs(qas: any[]): Promise<void> {
    const expiry = Date.now() + (6 * 60 * 60 * 1000) // 6시간
    
    for (const qa of qas) {
      await offlineStorage.saveData({
        id: `qa_${qa.id}`,
        type: 'qa',
        data: qa,
        timestamp: Date.now(),
        expiry
      })
    }
  },

  /**
   * 사용자 데이터 저장
   */
  async saveUserData(key: string, data: any): Promise<void> {
    await offlineStorage.saveData({
      id: `user_${key}`,
      type: 'user_data',
      data,
      timestamp: Date.now()
    })
  },

  /**
   * 캐시된 데이터 조회
   */
  async getCachedVlogs(): Promise<any[]> {
    const data = await offlineStorage.getDataByType('vlog')
    return data.map(item => item.data)
  },

  async getCachedProducts(): Promise<any[]> {
    const data = await offlineStorage.getDataByType('product')
    return data.map(item => item.data)
  },

  async getCachedQAs(): Promise<any[]> {
    const data = await offlineStorage.getDataByType('qa')
    return data.map(item => item.data)
  },

  /**
   * 오프라인 액션 처리
   */
  async addToCartOffline(productId: string, quantity: number, options?: any): Promise<void> {
    await offlineStorage.savePendingAction({
      id: `cart_add_${Date.now()}`,
      type: 'cart_add',
      data: { productId, quantity, options },
      timestamp: Date.now()
    })
  },

  async submitQAOffline(question: string, category?: string): Promise<void> {
    await offlineStorage.savePendingAction({
      id: `qa_submit_${Date.now()}`,
      type: 'qa_submit',
      data: { question, category },
      timestamp: Date.now()
    })
  },

  /**
   * 온라인 복구 시 대기 중인 액션 처리
   */
  async processPendingActions(): Promise<void> {
    const actions = await offlineStorage.getPendingActions()
    
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'cart_add':
            // 장바구니 추가 API 호출
            console.log('장바구니 추가 처리:', action.data)
            break
          case 'qa_submit':
            // Q&A 제출 API 호출
            console.log('Q&A 제출 처리:', action.data)
            break
        }
        
        // 처리 완료 후 액션 삭제
        await offlineStorage.deletePendingAction(action.id)
      } catch (error) {
        console.error('대기 중인 액션 처리 실패:', action, error)
      }
    }
  }
} 