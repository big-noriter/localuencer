// API 키 설정
// 실제 서비스에서는 이 정보를 서버 측에서 관리하거나 환경 변수로 설정해야 합니다.
const config = {
    GOOGLE_API_KEY: 'AIzaSyBL7POUvu-ZPwVd-JKqFdSpaNI6hZmEBk4',
    D_ID_API_KEY: 'sk-vs-2bKsuBEAHWjsNLZAhFmrREvu2mGfaTLA3PjUFgZW3JY2LGDJ',
    GEMINI_MODEL: 'gemini-1.5-flash' // gemini-pro-vision에서 gemini-1.5-flash로 다시 변경
};

// 환경 변수에서 키 로드 시도 (Node.js 환경)
if (typeof process !== 'undefined' && process.env) {
    config.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || config.GOOGLE_API_KEY;
    config.D_ID_API_KEY = process.env.D_ID_API_KEY || config.D_ID_API_KEY;
    config.GEMINI_MODEL = process.env.GEMINI_MODEL || config.GEMINI_MODEL;
}

// 브라우저 환경에서 사용하기 위한 export
if (typeof window !== 'undefined') {
    window.appConfig = config;
}

// Node.js 환경에서 사용하기 위한 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} 