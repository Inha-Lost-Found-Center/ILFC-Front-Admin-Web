# 인하대 분실물 센터 관리자 웹 (ILFC Admin Web)

인하대학교 분실물 센터의 관리자 전용 웹 애플리케이션입니다. 분실물 아이템을 관리하고 통계를 확인할 수 있습니다.

## 📋 목차

- [기능 소개](#-기능-소개)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [환경 변수 설정](#-환경-변수-설정)
- [주요 기능](#-주요-기능)
- [빌드 및 배포](#-빌드-및-배포)

## ✨ 기능 소개

- **관리자 인증**: 이메일/비밀번호 기반 로그인 시스템
- **대시보드**: 분실물 아이템 통계 및 최근 등록 아이템 조회
- **아이템 관리**: 분실물 아이템의 상태 관리 (보관, 예약, 찾음)
- **실시간 통계**: 보관/예약/찾음 상태별 아이템 수량 확인
- **반응형 디자인**: 다양한 디바이스에서 최적화된 UI/UX

## 🛠 기술 스택

### Frontend
- **React 19.1.1** - UI 라이브러리
- **TypeScript 5.9.3** - 타입 안정성
- **Vite 7.1.7** - 빠른 개발 서버 및 빌드 도구

### UI/UX
- **Ant Design 5.28.0** - 엔터프라이즈급 UI 컴포넌트 라이브러리
- **Ant Design Icons** - 아이콘 세트

### 상태 관리 & 데이터 페칭
- **Zustand 5.0.8** - 경량 상태 관리
- **TanStack React Query 5.90.6** - 서버 상태 관리 및 캐싱
- **Axios 1.13.2** - HTTP 클라이언트

### 라우팅
- **React Router DOM 7.9.5** - 클라이언트 사이드 라우팅

### 기타
- **Day.js 1.11.19** - 날짜/시간 처리

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/Inha-Lost-Found-Center/ILFC-Front-Admin-Web.git
cd ILFC-Front-Admin-Web
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp env.example .env
# .env 파일을 열어서 필요한 환경 변수를 설정하세요
```

4. **개발 서버 실행**
```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:5173` (또는 표시된 포트)로 접속할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── assets/          # 정적 자산 (이미지, 아이콘 등)
├── components/      # 재사용 가능한 컴포넌트
├── hooks/           # 커스텀 React Hooks
├── layouts/         # 레이아웃 컴포넌트
│   └── AdminLayout.tsx
├── pages/           # 페이지 컴포넌트
│   ├── Dashboard.tsx
│   └── Login.tsx
├── routes/          # 라우팅 설정
│   └── AppRouter.tsx
├── services/        # API 서비스 레이어
│   ├── auth.ts      # 인증 관련 API
│   ├── http.ts      # HTTP 클라이언트 설정
│   └── items.ts     # 아이템 관련 API
├── store/           # 상태 관리 (Zustand)
│   └── auth.ts      # 인증 상태 관리
├── types/           # TypeScript 타입 정의
│   ├── auth.ts
│   └── item.ts
└── utils/           # 유틸리티 함수
    └── queryClient.ts  # React Query 설정
```

## ⚙️ 환경 변수 설정

`.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# API 기본 URL
VITE_API_BASE_URL=https://skubr5x2p0.execute-api.us-west-2.amazonaws.com/main

# CORS 설정 (기본값: false)
# Bearer 토큰 인증을 사용하므로 기본적으로 false
# 백엔드 CORS 설정이 완료되면 필요시 true로 변경
VITE_USE_CREDENTIALS=false
```

환경 변수 예시는 `env.example` 파일을 참고하세요.

## 🎯 주요 기능

### 인증 시스템
- 이메일/비밀번호 기반 로그인
- JWT 토큰 기반 인증
- 자동 토큰 갱신
- 보호된 라우트

### 대시보드
- **통계 카드**: 전체 아이템, 보관, 예약, 찾음 상태별 통계
- **최근 아이템**: 최근 등록된 분실물 아이템 목록
- **상태 표시**: 아이템 상태별 색상 및 아이콘 표시
  - 🔵 보관 (파란색)
  - 🟠 예약 (주황색)
  - 🟢 찾음 (초록색)

### 아이템 관리
- 아이템 목록 조회
- 아이템 상태 확인
- 아이템 이미지 미리보기
- 위치 정보 표시
- 태그 정보 표시
- 등록 시간 표시

## 🏗 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 디렉토리에 생성됩니다.

### 빌드 미리보기

```bash
npm run preview
```

### 린트 검사

```bash
npm run lint
```

## 📝 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드 결과 미리보기
- `npm run lint` - ESLint로 코드 검사

## 🔐 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 환경 변수에 민감한 정보(API 키, 비밀번호 등)가 포함되어 있지 않은지 확인하세요
- 프로덕션 환경에서는 HTTPS를 사용하세요

## 🤝 기여하기

이 프로젝트는 인하대 분실물 센터 전용 관리자 애플리케이션입니다.

## 📄 라이선스

이 프로젝트는 인하대학교 분실물 센터 전용입니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해 주세요.

---

**인하대 분실물 센터 관리자 웹** - 효율적인 분실물 관리 시스템
