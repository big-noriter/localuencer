'use client'

import { useState, useEffect } from 'react'
import { CartItem, Product } from '@/lib/data'

/**
 * 장바구니 상태 관리를 위한 커스텀 훅
 * 
 * 주요 기능:
 * - 로컬 스토리지를 사용하여 장바구니 데이터 영구 저장
 * - 상품 추가, 삭제, 수량 변경 기능
 * - 총 상품 개수 및 총 가격 계산
 * - 옵션별 상품 구분 관리
 * 
 * @returns 장바구니 상태 및 관리 함수들
 * 
 * @example
 * const { items, addItem, removeItem, getTotalItems } = useCart()
 * 
 * // 상품 추가
 * addItem(product, 2, { color: '핑크', size: 'M' })
 * 
 * // 총 아이템 개수 확인
 * const totalItems = getTotalItems()
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트 마운트 시 로컬 스토리지에서 장바구니 데이터 로드
  useEffect(() => {
    const savedCart = localStorage.getItem('mina-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('장바구니 데이터 로드 실패:', error)
        localStorage.removeItem('mina-cart')
      }
    }
    setIsLoading(false)
  }, [])

  // 장바구니 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('mina-cart', JSON.stringify(items))
    }
  }, [items, isLoading])

  /**
   * 장바구니에 상품 추가
   */
  const addItem = (product: Product, quantity: number = 1, options?: { [key: string]: string }) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.productId === product.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      )

      if (existingItemIndex > -1) {
        // 이미 존재하는 상품이면 수량 증가
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        // 새로운 상품 추가
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          selectedOptions: options
        }
        return [...prevItems, newItem]
      }
    })
  }

  /**
   * 장바구니에서 상품 제거
   */
  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  /**
   * 상품 수량 업데이트
   */
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  /**
   * 장바구니 비우기
   */
  const clearCart = () => {
    setItems([])
  }

  /**
   * 총 상품 개수 계산
   */
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  /**
   * 총 가격 계산 (문자열에서 숫자 추출)
   */
  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseInt(item.product.price.replace(/[^0-9]/g, ''))
      return total + (price * item.quantity)
    }, 0)
  }

  /**
   * 가격을 포맷팅된 문자열로 반환
   */
  const getFormattedTotalPrice = () => {
    return getTotalPrice().toLocaleString() + '원'
  }

  return {
    items,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getFormattedTotalPrice
  }
} 