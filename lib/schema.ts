/**
 * schema.ts
 * 구조화된 데이터(JSON-LD) 생성을 위한 유틸리티 함수
 * 
 * 이 파일은 schema.org 형식의 구조화된 데이터를 생성하는 함수들을 포함합니다.
 * 검색 엔진이 콘텐츠를 더 잘 이해하고 풍부한 검색 결과를 표시할 수 있도록 합니다.
 */

// 공통 타입 정의
export type WithContext<T> = T & {
  '@context': 'https://schema.org';
};

// 기본 스키마 타입
export interface Thing {
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  image?: string | ImageObject;
  [key: string]: any;
}

// 이미지 객체 타입
export interface ImageObject {
  '@type': 'ImageObject';
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

// 조직 타입
export interface Organization extends Thing {
  '@type': 'Organization';
  logo?: string | ImageObject;
  sameAs?: string[];
  contactPoint?: ContactPoint[];
}

// 사람 타입
export interface Person extends Thing {
  '@type': 'Person';
  givenName?: string;
  familyName?: string;
  jobTitle?: string;
  sameAs?: string[];
}

// 연락처 타입
export interface ContactPoint {
  '@type': 'ContactPoint';
  telephone?: string;
  email?: string;
  contactType?: string;
}

// 웹사이트 타입
export interface WebSite extends Thing {
  '@type': 'WebSite';
  publisher?: Organization | Person;
  inLanguage?: string;
  copyrightYear?: number;
  potentialAction?: SearchAction;
}

// 검색 액션 타입
export interface SearchAction {
  '@type': 'SearchAction';
  target: string;
  'query-input': string;
}

// 웹페이지 타입
export interface WebPage extends Thing {
  '@type': 'WebPage';
  isPartOf?: WebSite;
  breadcrumb?: BreadcrumbList;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
}

// 빵 부스러기 목록 타입
export interface BreadcrumbList extends Thing {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

// 빵 부스러기 아이템 타입
export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

// 비디오 객체 타입
export interface VideoObject extends Thing {
  '@type': 'VideoObject';
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  author?: Person | Organization;
  publisher?: Person | Organization;
}

// 제품 타입
export interface Product extends Thing {
  '@type': 'Product';
  brand?: Organization;
  sku?: string;
  gtin?: string;
  mpn?: string;
  offers?: Offer | Offer[];
  review?: Review | Review[];
  aggregateRating?: AggregateRating;
}

// 제안(가격) 타입
export interface Offer {
  '@type': 'Offer';
  price: number;
  priceCurrency: string;
  availability?: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock';
  url?: string;
  validFrom?: string;
  validThrough?: string;
}

// 리뷰 타입
export interface Review {
  '@type': 'Review';
  reviewRating: Rating;
  author: Person;
  datePublished?: string;
  reviewBody?: string;
}

// 평점 타입
export interface Rating {
  '@type': 'Rating';
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

// 집계 평점 타입
export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  ratingCount: number;
  reviewCount?: number;
}

// FAQ 페이지 타입
export interface FAQPage extends WebPage {
  '@type': 'FAQPage';
  mainEntity: Question[];
}

// 질문 타입
export interface Question {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

// 관광 명소 타입
export interface TouristAttraction extends Thing {
  '@type': 'TouristAttraction';
  address?: PostalAddress;
  geo?: GeoCoordinates;
  openingHoursSpecification?: OpeningHoursSpecification[];
  photo?: ImageObject[];
  telephone?: string;
  touristType?: string[];
}

// 주소 타입
export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

// 지리적 좌표 타입
export interface GeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

// 영업 시간 타입
export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
  validFrom?: string;
  validThrough?: string;
}

// 웹사이트 스키마 생성 함수
export function createWebSiteSchema(data: {
  name: string;
  url: string;
  description?: string;
  inLanguage?: string;
  searchUrl?: string;
}): WithContext<WebSite> {
  const { name, url, description, inLanguage, searchUrl } = data;
  
  const schema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    inLanguage: inLanguage || 'ko-KR',
  };
  
  if (description) {
    schema.description = description;
  }
  
  if (searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: `${searchUrl}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    };
  }
  
  return schema;
}

// 조직 스키마 생성 함수
export function createOrganizationSchema(data: {
  name: string;
  url: string;
  logo: string;
  description?: string;
  sameAs?: string[];
  contactPoints?: Array<{
    telephone?: string;
    email?: string;
    contactType: string;
  }>;
}): WithContext<Organization> {
  const { name, url, logo, description, sameAs, contactPoints } = data;
  
  const schema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
  };
  
  if (description) {
    schema.description = description;
  }
  
  if (sameAs && sameAs.length > 0) {
    schema.sameAs = sameAs;
  }
  
  if (contactPoints && contactPoints.length > 0) {
    schema.contactPoint = contactPoints.map(point => ({
      '@type': 'ContactPoint',
      telephone: point.telephone,
      email: point.email,
      contactType: point.contactType,
    }));
  }
  
  return schema;
}

// 사람 스키마 생성 함수
export function createPersonSchema(data: {
  name: string;
  url?: string;
  image?: string;
  description?: string;
  jobTitle?: string;
  sameAs?: string[];
}): WithContext<Person> {
  const { name, url, image, description, jobTitle, sameAs } = data;
  
  const schema: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
  };
  
  if (url) {
    schema.url = url;
  }
  
  if (image) {
    schema.image = image;
  }
  
  if (description) {
    schema.description = description;
  }
  
  if (jobTitle) {
    schema.jobTitle = jobTitle;
  }
  
  if (sameAs && sameAs.length > 0) {
    schema.sameAs = sameAs;
  }
  
  return schema;
}

// 빵 부스러기 스키마 생성 함수
export function createBreadcrumbSchema(items: Array<{
  name: string;
  url: string;
}>): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// 비디오 객체 스키마 생성 함수
export function createVideoObjectSchema(data: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
  author?: {
    name: string;
    url?: string;
  };
}): WithContext<VideoObject> {
  const { name, description, thumbnailUrl, uploadDate, contentUrl, embedUrl, duration, author } = data;
  
  const schema: WithContext<VideoObject> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
  };
  
  if (contentUrl) {
    schema.contentUrl = contentUrl;
  }
  
  if (embedUrl) {
    schema.embedUrl = embedUrl;
  }
  
  if (duration) {
    schema.duration = duration;
  }
  
  if (author) {
    schema.author = {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    };
  }
  
  return schema;
}

// 제품 스키마 생성 함수
export function createProductSchema(data: {
  name: string;
  description: string;
  image: string | string[];
  sku?: string;
  brand?: {
    name: string;
    url?: string;
  };
  offers?: {
    price: number;
    priceCurrency: string;
    availability?: 'InStock' | 'OutOfStock';
    url?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}): WithContext<Product> {
  const { name, description, image, sku, brand, offers, aggregateRating } = data;
  
  const schema: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: Array.isArray(image) ? image : [image],
  };
  
  if (sku) {
    schema.sku = sku;
  }
  
  if (brand) {
    schema.brand = {
      '@type': 'Organization',
      name: brand.name,
      ...(brand.url && { url: brand.url }),
    };
  }
  
  if (offers) {
    schema.offers = {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency,
      ...(offers.availability && { 
        availability: `https://schema.org/${offers.availability}` 
      }),
      ...(offers.url && { url: offers.url }),
    };
  }
  
  if (aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
      ...(aggregateRating.bestRating && { bestRating: aggregateRating.bestRating }),
      ...(aggregateRating.worstRating && { worstRating: aggregateRating.worstRating }),
    };
  }
  
  return schema;
}

// FAQ 페이지 스키마 생성 함수
export function createFAQPageSchema(questions: Array<{
  question: string;
  answer: string;
}>): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// 관광 명소 스키마 생성 함수
export function createTouristAttractionSchema(data: {
  name: string;
  description: string;
  url: string;
  image: string | string[];
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  openingHours?: Array<{
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
  touristType?: string[];
}): WithContext<TouristAttraction> {
  const { name, description, url, image, address, geo, telephone, openingHours, touristType } = data;
  
  const schema: WithContext<TouristAttraction> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name,
    description,
    url,
    image: Array.isArray(image) ? image : [image],
    address: {
      '@type': 'PostalAddress',
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      addressCountry: address.addressCountry,
      ...(address.streetAddress && { streetAddress: address.streetAddress }),
      ...(address.postalCode && { postalCode: address.postalCode }),
    },
  };
  
  if (geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }
  
  if (telephone) {
    schema.telephone = telephone;
  }
  
  if (openingHours && openingHours.length > 0) {
    schema.openingHoursSpecification = openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes,
    }));
  }
  
  if (touristType && touristType.length > 0) {
    schema.touristType = touristType;
  }
  
  return schema;
}

// 웹페이지 스키마 생성 함수
export function createWebPageSchema(data: {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
}): WithContext<WebPage> {
  const { name, description, url, image, datePublished, dateModified, inLanguage } = data;
  
  const schema: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
  };
  
  if (image) {
    schema.image = image;
  }
  
  if (datePublished) {
    schema.datePublished = datePublished;
  }
  
  if (dateModified) {
    schema.dateModified = dateModified;
  }
  
  if (inLanguage) {
    schema.inLanguage = inLanguage;
  }
  
  return schema;
} 