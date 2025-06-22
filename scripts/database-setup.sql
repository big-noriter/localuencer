-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 브이로그 테이블
CREATE TABLE IF NOT EXISTS vlogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  summary TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'photo', 'text')),
  category VARCHAR(50),
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Q&A 테이블
CREATE TABLE IF NOT EXISTS qas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  asked_by UUID REFERENCES users(id),
  answered_at TIMESTAMP WITH TIME ZONE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 상품 테이블
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category VARCHAR(50),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주문 상품 테이블
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 페르소나 설정 테이블
CREATE TABLE IF NOT EXISTS persona_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  personality TEXT,
  speech_style TEXT,
  interests TEXT[],
  prohibited_words TEXT[],
  sample_sentences TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 콘텐츠 달력 테이블
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  platform VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 테이블 (브이로그, Q&A 공통 사용)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  parent_type VARCHAR(20) NOT NULL CHECK (parent_type IN ('vlog', 'qa')),
  parent_id UUID NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_vlogs_published ON vlogs(published, published_at);
CREATE INDEX IF NOT EXISTS idx_qas_status ON qas(status, created_at);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_type, parent_id, created_at);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qas ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 기본 정책: 모든 사용자가 읽기 가능
CREATE POLICY "Public read access" ON vlogs FOR SELECT USING (published = true);
CREATE POLICY "Public read access" ON qas FOR SELECT USING (status = 'answered');
CREATE POLICY "Public read access" ON products FOR SELECT USING (is_active = true);

-- 관리자만 쓰기 가능
CREATE POLICY "Admin write access" ON vlogs FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admin write access" ON persona_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admin write access" ON content_calendar FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can manage own data" ON orders FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can create QAs" ON qas FOR INSERT WITH CHECK (asked_by = auth.uid());
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (author_id = auth.uid());
