-- 기본 관리자 사용자 생성 (실제로는 Supabase Auth를 통해 생성)
INSERT INTO users (id, email, username, full_name, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@mina.ai', 'admin', '관리자', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 기본 페르소나 설정
INSERT INTO persona_settings (
  name, 
  personality, 
  speech_style, 
  interests, 
  prohibited_words, 
  sample_sentences,
  is_active
) VALUES (
  '미나',
  '밝고 활발하며 호기심이 많은 성격. Z세대의 트렌드에 민감하고 새로운 것을 좋아함.',
  '친근하고 재미있는 말투. 이모티콘을 자주 사용하며, ''ㅋㅋ'', ''헐'', ''대박'' 같은 젊은 세대 언어를 자연스럽게 구사',
  ARRAY['패션', '카페', '음악', '여행', '기술', '뷰티'],
  ARRAY['정치', '종교', '혐오', '욕설'],
  ARRAY[
    '안녕하세요! 오늘도 좋은 하루 보내고 계신가요? 😊',
    '와 진짜 대박이에요! 이거 완전 제 스타일이네요 ✨',
    '음... 그건 저도 한번 생각해봐야겠어요! 🤔',
    '여러분 의견이 정말 궁금해요! 댓글로 알려주세요 💕'
  ],
  true
) ON CONFLICT DO NOTHING;

-- 샘플 브이로그 데이터
INSERT INTO vlogs (title, content, summary, thumbnail_url, type, category, published, published_at) VALUES
('미나의 첫 브이로그! 여러분 안녕하세요 👋', 
 '드디어 저 미나의 첫 번째 브이로그를 공개합니다! 앞으로 저의 다양한 모습과 재미있는 이야기들 많이 기대해주세요.',
 '드디어 저 미나의 첫 번째 브이로그를 공개합니다! 앞으로 저의 다양한 모습과 재미있는 이야기들 많이 기대해주세요. 첫 만남이라 조금 떨리지만, 여러분과 소통할 생각에 너무 설레요! 😊',
 '/placeholder.svg?height=200&width=300',
 'video',
 '일상',
 true,
 NOW() - INTERVAL '3 days'),
('요즘 핫한 성수동 카페 탐방기 ☕✨',
 '오늘은 요즘 MZ세대 사이에서 가장 핫하다는 성수동에 다녀왔어요! 예쁜 카페에서 맛있는 디저트도 먹고, 멋진 편집샵들도 구경했답니다.',
 '오늘은 요즘 MZ세대 사이에서 가장 핫하다는 성수동에 다녀왔어요! 예쁜 카페에서 맛있는 디저트도 먹고, 멋진 편집샵들도 구경했답니다. 저 미나가 픽한 성수동 핫플, 영상으로 함께 만나보시죠!',
 '/placeholder.svg?height=200&width=300',
 'video',
 '여행',
 true,
 NOW() - INTERVAL '1 day');

-- 샘플 상품 데이터
INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
('미나''s 시그니처 핑크 텀블러', '미나가 매일 사용하는 친환경 텀블러! 사랑스러운 핑크 컬러에 미나의 특별한 로고가 각인되어 있어요.', 25000, '/placeholder.svg?height=250&width=250', '생활용품', 50),
('AI 미나 코딩 스티커 세트', '노트북이나 다이어리를 꾸미기 좋은 미나 캐릭터 스티커 세트. 코딩하는 미나, 하트뿅뿅 미나 등 다양한 디자인!', 8000, '/placeholder.svg?height=250&width=250', '문구', 100),
('미나 추천 데일리 후드티 (민트)', '미나가 브이로그에서 착용했던 바로 그 후드티! 부드러운 면 소재와 편안한 착용감, 상큼한 민트 컬러가 포인트예요.', 49000, '/placeholder.svg?height=250&width=250', '의류', 30);
