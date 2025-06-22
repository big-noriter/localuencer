'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star, Heart, Share2, ChevronLeft, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import SchemaOrg, { combineSchemas } from '@/components/schema-org';
import { createProductSchema, createBreadcrumbSchema } from '@/lib/schema';
import { useParams } from 'next/navigation';

/**
 * 상품 상세 정보를 가져오는 비동기 함수
 * 클라이언트 컴포넌트에서 사용되며, API를 통해 상품 정보를 가져옵니다.
 * 
 * @param id - 조회할 상품의 고유 ID
 * @returns 상품 상세 정보 객체 (Promise)
 * @throws 상품을 찾을 수 없거나 오류 발생 시 예외 발생
 */
async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/shop/${id}`, {
    cache: 'no-store', // 캐시 비활성화 (실시간 데이터를 위해)
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('상품을 찾을 수 없습니다.');
    }
    // 에러 메시지를 상세하게 전달
    const error = await res.json().catch(() => ({}));
    console.error('상품 조회 실패:', error);
    throw new Error(error.message || '상품을 불러오는 데 실패했습니다.');
  }

  return res.json();
}

/**
 * 상품 상세 페이지 컴포넌트
 * 
 * @param params - 경로 파라미터 (id 포함)
 * @returns 상품 상세 페이지 JSX
 */
export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  
  const { addItem } = useCart();
  const { toast } = useToast();
  const { locale } = useParams();

  // 컴포넌트 마운트 시 상품 정보 로드
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProduct(params.id);
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '상품을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  // 상품 옵션 데이터 (실제로는 상품 데이터에 따라 동적으로 생성)
  const options = [
    { id: 'color', name: '색상', values: ['민트', '핑크', '화이트'] },
    { id: 'size', name: '사이즈', values: ['S', 'M', 'L'] },
  ];

  // 상품 상세 설명 (실제로는 상품 데이터에 포함되어야 함)
  const productDetails = [
    '부드러운 면 100% 소재로 편안한 착용감',
    '세탁 시 색상 이염 주의',
    '국내 제작, 국내 생산',
    '환경을 생각한 친환경 포장',
  ];

  // 옵션 선택 핸들러
  const handleOptionSelect = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  // 장바구니 추가 핸들러
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(product, quantity, selectedOptions);
    toast({
      title: locale === 'ko' ? "장바구니에 추가되었습니다!" : "Added to cart!",
      description: locale === 'ko' 
        ? `${product.name} ${quantity}개가 장바구니에 담겼습니다.`
        : `${quantity} ${product.name} added to your cart.`,
    });
  };

  // 기본 URL 설정
  const baseUrl = 'https://localuencer-mina.com';
  const localeUrl = `${baseUrl}/${locale}`;
  const productUrl = `${localeUrl}/shop/${params.id}`;

  // 구조화된 데이터 생성 (상품이 로드된 경우에만)
  const schemas = product ? combineSchemas(
    createProductSchema({
      name: product.name,
      description: product.description,
      image: product.imageUrl,
      sku: `SKU-${params.id}`,
      brand: {
        name: locale === 'ko' ? '로컬루언서 미나' : 'Localuencer Mina',
        url: localeUrl
      },
      offers: {
        price: parseFloat(product.price.replace(/[^0-9]/g, '')),
        priceCurrency: 'KRW',
        availability: 'InStock',
        url: productUrl
      },
      aggregateRating: {
        ratingValue: 4.8,
        reviewCount: 24,
        bestRating: 5,
        worstRating: 1
      }
    }),
    createBreadcrumbSchema([
      { 
        name: locale === 'ko' ? '홈' : 'Home', 
        url: localeUrl 
      },
      { 
        name: locale === 'ko' ? '쇼핑' : 'Shop', 
        url: `${localeUrl}/shop` 
      },
      { 
        name: product.name, 
        url: productUrl 
      },
    ])
  ) : [];

  // 로딩 상태
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {locale === 'ko' ? '상품 정보를 불러오는 중...' : 'Loading product information...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">
            {locale === 'ko' ? '상품을 찾을 수 없습니다' : 'Product not found'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error || (locale === 'ko' ? '요청하신 상품이 존재하지 않습니다.' : 'The requested product does not exist.')}
          </p>
          <Button asChild>
            <Link href={`/${locale}/shop`}>
              {locale === 'ko' ? '쇼핑 계속하기' : 'Continue shopping'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {product && <SchemaOrg schema={schemas} />}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 뒤로 가기 버튼 */}
        <Link href={`/${locale}/shop`} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          {locale === 'ko' ? '쇼핑 계속하기' : 'Continue shopping'}
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 상품 이미지 갤러리 */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={`${product.name} ${locale === 'ko' ? '추가 이미지' : 'additional image'} ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-2xl font-semibold text-primary mt-2">{product.price}</p>
              
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {locale === 'ko' ? '(24개 리뷰)' : '(24 reviews)'}
                </span>
              </div>
            </div>

            <p className="text-gray-700">{product.description}</p>

            {/* 상품 옵션 선택 */}
            <div className="space-y-4 pt-4 border-t">
              {options.map((option) => (
                <div key={option.id}>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {locale === 'ko' ? option.name : option.id === 'color' ? 'Color' : 'Size'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleOptionSelect(option.id, value)}
                        className={`px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          selectedOptions[option.id] === value
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 수량 선택 */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {locale === 'ko' ? '수량' : 'Quantity'}
              </h3>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="px-4 py-2 border-t border-b border-gray-300 text-center min-w-[3rem]">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-r-md hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 구매 버튼 */}
            <div className="flex gap-4 pt-6">
              <Button onClick={handleAddToCart} className="flex-1">
                {locale === 'ko' ? '장바구니에 담기' : 'Add to Cart'}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {locale === 'ko' ? '찜하기' : 'Wishlist'}
              </Button>
              <Button variant="outline" className="p-3">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* 상품 상세 정보 */}
            <div className="pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {locale === 'ko' ? '상품 상세 정보' : 'Product Details'}
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {productDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 상품 리뷰 섹션 */}
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">
            {locale === 'ko' ? '상품 리뷰' : 'Product Reviews'}
          </h2>
          
          <div className="space-y-8">
            {/* 예시 리뷰 */}
            <div className="border-b pb-6">
              <div className="flex justify-between mb-2">
                <div className="font-medium">
                  {locale === 'ko' ? '구매자' : 'Customer'}
                </div>
                <div className="text-sm text-gray-500">2024-06-01</div>
              </div>
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700">
                {locale === 'ko' 
                  ? '품질이 좋고 배송이 빨라요! 다음에도 구매하고 싶어요.' 
                  : 'Good quality and fast shipping! I would like to purchase again.'}
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline">
              {locale === 'ko' ? '리뷰 더보기' : 'View More Reviews'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
