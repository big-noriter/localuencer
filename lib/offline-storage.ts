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

interface CachedImage {
  url: string
  data: Blob
  timestamp: number
  size: number
}

class OfflineStorage {
  private dbName = 'MinaOfflineDB'
  private version = 1
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null
  private maxCacheSize = 50 * 1024 * 1024 // 50MB
  private isInitializing = false

  /**
   * IndexedDB 초기화 (싱글톤 패턴 적용)
   */
  async init(): Promise<void> {
    // 이미 초기화 중이면 기존 Promise 반환
    if (this.initPromise) return this.initPromise;
    
    // 초기화 중이 아니면 새로운 Promise 생성
    this.isInitializing = true;
    this.initPromise = new Promise((resolve, reject) => {
      // 이미 DB가 초기화되어 있다면 바로 반환
      if (this.db) {
        this.isInitializing = false;
        resolve();
        return;
      }
      
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        this.isInitializing = false;
        reject(request.error);
      }
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitializing = false;
        resolve();
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
          imageStore.createIndex('size', 'size', { unique: false })
        }
      }
    });
    
    return this.initPromise;
  }

  /**
   * DB 연결 확인 및 초기화
   */
  private async ensureConnection(): Promise<void> {
    if (!this.db) await this.init();
    
    // 연결이 끊어진 경우 재연결 시도
    if (this.db && !this.db.objectStoreNames) {
      this.db = null;
      this.initPromise = null;
      await this.init();
    }
  }

  /**
   * 데이터 저장 (배치 처리 지원)
   */
  async saveData(data: OfflineData | OfflineData[]): Promise<void> {
    await this.ensureConnection();
    
    // 배치 처리를 위한 배열 변환
    const dataArray = Array.isArray(data) ? data : [data];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      // 트랜잭션 완료 이벤트 처리
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      
      // 배치 처리
      dataArray.forEach(item => {
        store.put(item);
      });
    });
  }

  /**
   * 데이터 조회 (캐시 만료 확인 포함)
   */
  async getData(id: string): Promise<OfflineData | null> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        
        // 만료 시간 확인
        if (result && result.expiry && Date.now() > result.expiry) {
          this.deleteData(id);
          resolve(null);
        } else {
          resolve(result || null);
        }
      };
    });
  }

  /**
   * 타입별 데이터 조회 (성능 최적화)
   */
  async getDataByType(type: OfflineData['type'], limit?: number): Promise<OfflineData[]> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('type');
      
      // 커서를 사용하여 페이지네이션 지원
      const results: OfflineData[] = [];
      const now = Date.now();
      
      // 타입에 맞는 항목만 가져오는 범위 쿼리
      const request = index.openCursor(IDBKeyRange.only(type));
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          const item = cursor.value;
          
          // 만료된 데이터 필터링
          if (!item.expiry || now <= item.expiry) {
            results.push(item);
          } else {
            // 비동기로 만료된 항목 삭제
            this.deleteData(item.id).catch(console.error);
          }
          
          // 제한된 수의 결과만 가져오기
          if (!limit || results.length < limit) {
            cursor.continue();
          } else {
            resolve(results);
          }
        } else {
          resolve(results);
        }
      };
    });
  }

  /**
   * 데이터 삭제
   */
  async deleteData(id: string): Promise<void> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * 대기 중인 액션 저장
   */
  async savePendingAction(action: PendingAction): Promise<void> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.put(action);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * 대기 중인 액션 조회
   */
  async getPendingActions(): Promise<PendingAction[]> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * 대기 중인 액션 삭제
   */
  async deletePendingAction(id: string): Promise<void> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * 이미지 캐싱
   */
  async cacheImage(url: string, data: Blob): Promise<void> {
    await this.ensureConnection();
    
    // 캐시 크기 확인 및 관리
    await this.manageCacheSize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedImages'], 'readwrite');
      const store = transaction.objectStore('cachedImages');
      
      const cachedImage: CachedImage = {
        url,
        data,
        timestamp: Date.now(),
        size: data.size
      };
      
      const request = store.put(cachedImage);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * 캐시된 이미지 조회
   */
  async getCachedImage(url: string): Promise<Blob | null> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedImages'], 'readonly');
      const store = transaction.objectStore('cachedImages');
      const request = store.get(url);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        
        if (result) {
          // 타임스탬프 업데이트 (LRU 캐시 전략)
          this.updateImageTimestamp(url).catch(console.error);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * 이미지 타임스탬프 업데이트 (LRU 캐시 전략)
   */
  private async updateImageTimestamp(url: string): Promise<void> {
    const transaction = this.db!.transaction(['cachedImages'], 'readwrite');
    const store = transaction.objectStore('cachedImages');
    const request = store.get(url);

    request.onsuccess = () => {
      const image = request.result;
      if (image) {
        image.timestamp = Date.now();
        store.put(image);
      }
    };
  }

  /**
   * 캐시 크기 관리 (LRU 전략)
   */
  private async manageCacheSize(): Promise<void> {
    const transaction = this.db!.transaction(['cachedImages'], 'readwrite');
    const store = transaction.objectStore('cachedImages');
    const request = store.getAll();

    request.onsuccess = () => {
      const images = request.result as CachedImage[];
      const totalSize = images.reduce((sum, img) => sum + img.size, 0);
      
      // 최대 크기를 초과하면 가장 오래된 이미지부터 삭제
      if (totalSize > this.maxCacheSize && images.length > 0) {
        // 타임스탬프 기준 정렬
        images.sort((a, b) => a.timestamp - b.timestamp);
        
        // 캐시 크기가 적절해질 때까지 오래된 이미지 삭제
        let currentSize = totalSize;
        let i = 0;
        
        while (currentSize > this.maxCacheSize * 0.8 && i < images.length) {
          const imageToRemove = images[i];
          store.delete(imageToRemove.url);
          currentSize -= imageToRemove.size;
          i++;
        }
      }
    };
  }

  /**
   * 캐시 정리 (오래된 데이터 삭제)
   */
  async clearExpiredData(): Promise<void> {
    await this.ensureConnection();

    const transaction = this.db!.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result;
      const now = Date.now();
      
      results.forEach(item => {
        if (item.expiry && now > item.expiry) {
          store.delete(item.id);
        }
      });
    };
  }

  /**
   * 저장소 크기 확인
   */
  async getStorageSize(): Promise<{ offlineData: number, pendingActions: number, cachedImages: number, total: number }> {
    await this.ensureConnection();

    const getStoreSize = async (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const data = request.result;
          const size = JSON.stringify(data).length;
          resolve(size);
        };
      });
    };

    const [offlineDataSize, pendingActionsSize, cachedImagesSize] = await Promise.all([
      getStoreSize('offlineData'),
      getStoreSize('pendingActions'),
      getStoreSize('cachedImages')
    ]);

    return {
      offlineData: offlineDataSize,
      pendingActions: pendingActionsSize,
      cachedImages: cachedImagesSize,
      total: offlineDataSize + pendingActionsSize + cachedImagesSize
    };
  }
  
  /**
   * 캐시 최적화 (불필요한 데이터 정리)
   */
  async optimizeCache(): Promise<void> {
    await this.clearExpiredData();
    await this.manageCacheSize();
    
    // 일정 기간 이상 지난 대기 액션 정리
    const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    const index = store.index('timestamp');
    
    // 30일 이상 지난 액션 삭제
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const range = IDBKeyRange.upperBound(thirtyDaysAgo);
    
    index.openCursor(range).onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
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
    const now = Date.now()
    const oneWeek = 7 * 24 * 60 * 60 * 1000 // 1주일
    
    const vlogData = vlogs.map(vlog => ({
      id: `vlog_${vlog.id}`,
      type: 'vlog' as const,
      data: vlog,
      timestamp: now,
      expiry: now + oneWeek // 1주일 후 만료
    }))
    
    await offlineStorage.saveData(vlogData)
  },
  
  /**
   * 상품 데이터 캐시
   */
  async cacheProducts(products: any[]): Promise<void> {
    const now = Date.now()
    const twoWeeks = 14 * 24 * 60 * 60 * 1000 // 2주일
    
    const productData = products.map(product => ({
      id: `product_${product.id}`,
      type: 'product' as const,
      data: product,
      timestamp: now,
      expiry: now + twoWeeks // 2주일 후 만료
    }))
    
    await offlineStorage.saveData(productData)
  },
  
  /**
   * Q&A 데이터 캐시
   */
  async cacheQAs(qas: any[]): Promise<void> {
    const now = Date.now()
    const oneMonth = 30 * 24 * 60 * 60 * 1000 // 1개월
    
    const qaData = qas.map(qa => ({
      id: `qa_${qa.id}`,
      type: 'qa' as const,
      data: qa,
      timestamp: now,
      expiry: now + oneMonth // 1개월 후 만료
    }))
    
    await offlineStorage.saveData(qaData)
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
   * 캐시된 브이로그 조회
   */
  async getCachedVlogs(): Promise<any[]> {
    const vlogs = await offlineStorage.getDataByType('vlog')
    return vlogs.map(v => v.data).sort((a, b) => b.timestamp - a.timestamp)
  },
  
  /**
   * 캐시된 상품 조회
   */
  async getCachedProducts(): Promise<any[]> {
    const products = await offlineStorage.getDataByType('product')
    return products.map(p => p.data)
  },
  
  /**
   * 캐시된 Q&A 조회
   */
  async getCachedQAs(): Promise<any[]> {
    const qas = await offlineStorage.getDataByType('qa')
    return qas.map(q => q.data).sort((a, b) => b.timestamp - a.timestamp)
  },
  
  /**
   * 오프라인 상태에서 장바구니에 추가
   */
  async addToCartOffline(productId: string, quantity: number, options?: any): Promise<void> {
    await offlineStorage.savePendingAction({
      id: `cart_${Date.now()}_${productId}`,
      type: 'cart_add',
      data: { productId, quantity, options },
      timestamp: Date.now()
    })
  },
  
  /**
   * 오프라인 상태에서 Q&A 제출
   */
  async submitQAOffline(question: string, category?: string): Promise<void> {
    await offlineStorage.savePendingAction({
      id: `qa_${Date.now()}`,
      type: 'qa_submit',
      data: { question, category },
      timestamp: Date.now()
    })
  },
  
  /**
   * 대기 중인 액션 처리
   */
  async processPendingActions(): Promise<void> {
    const actions = await offlineStorage.getPendingActions()
    
    // 여기서 온라인 상태가 되었을 때 서버에 액션을 전송하는 로직 구현
    // TODO: API 호출 구현
    
    // 처리된 액션 삭제
    for (const action of actions) {
      await offlineStorage.deletePendingAction(action.id)
    }
  },
  
  /**
   * 이미지 캐싱
   */
  async cacheImage(url: string): Promise<void> {
    try {
      // 이미 캐시된 이미지인지 확인
      const cachedImage = await offlineStorage.getCachedImage(url);
      if (cachedImage) return;
      
      // 이미지 가져오기
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      await offlineStorage.cacheImage(url, blob);
    } catch (error) {
      console.error('Image caching failed:', error);
    }
  },
  
  /**
   * 캐시된 이미지 URL 생성
   */
  async getCachedImageUrl(url: string): Promise<string> {
    try {
      const cachedImage = await offlineStorage.getCachedImage(url);
      if (cachedImage) {
        return URL.createObjectURL(cachedImage);
      }
      return url;
    } catch (error) {
      console.error('Error getting cached image:', error);
      return url;
    }
  },
  
  /**
   * 캐시 최적화
   */
  async optimizeCache(): Promise<void> {
    await offlineStorage.optimizeCache();
  }
} 