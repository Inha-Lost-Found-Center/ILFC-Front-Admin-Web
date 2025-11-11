# CORS 및 인증 문제 해결 가이드

## 현재 발생 중인 문제

### 1. 404 오류 (해결됨)
```
GET https://main.d2uqv8vbmzw3om.amplifyapp.com/login/ 404 (Not Found)
```

**원인**: Amplify에서 SPA 라우팅이 설정되지 않음

**해결**: `public/_redirects` 파일 추가
```
/*    /index.html   200
```

### 2. CORS 오류 (백엔드 수정 필요)
```
Access to XMLHttpRequest at 'https://skubr5x2p0.execute-api.us-west-2.amazonaws.com/main/users/login' 
from origin 'https://main.d2uqv8vbmzw3om.amplifyapp.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**원인**: 백엔드에서 **401 에러 응답에도 CORS 헤더가 없음**

**문제점**:
- OPTIONS (Preflight) 요청은 성공 (CORS 헤더 있음)
- 실제 POST 요청에서 401 응답 시 CORS 헤더가 없어서 브라우저가 응답을 읽을 수 없음

### 3. 401 Unauthorized (인증 실패)
```
POST https://skubr5x2p0.execute-api.us-west-2.amazonaws.com/main/users/login 
net::ERR_FAILED 401 (Unauthorized)
```

**원인**: 
- 잘못된 이메일/비밀번호
- 또는 백엔드 인증 로직 문제

## 백엔드에서 해결해야 할 사항

### ⚠️ 중요: 에러 응답에도 CORS 헤더 필수!

현재 백엔드에서 401 에러 응답 시 CORS 헤더를 포함하지 않아서 브라우저가 응답을 읽을 수 없습니다.

### 해결 방법

#### 1. API Gateway CORS 설정

모든 HTTP 상태 코드(200, 401, 403, 500 등)에 대해 CORS 헤더를 반환해야 합니다.

**필수 CORS 헤더**:
- `Access-Control-Allow-Origin: https://main.d2uqv8vbmzw3om.amplifyapp.com`
- `Access-Control-Allow-Headers: Authorization, Content-Type`
- `Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS`

#### 2. 에러 핸들러에 CORS 헤더 추가

**FastAPI 예시**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://main.d2uqv8vbmzw3om.amplifyapp.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 401 에러 핸들러
@app.exception_handler(401)
async def unauthorized_handler(request, exc):
    return JSONResponse(
        status_code=401,
        content={"detail": "Unauthorized", "message": "이메일 또는 비밀번호가 올바르지 않습니다."},
        headers={
            "Access-Control-Allow-Origin": "https://main.d2uqv8vbmzw3om.amplifyapp.com",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
        }
    )
```

**Flask 예시**:
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://main.d2uqv8vbmzw3om.amplifyapp.com"])

@app.errorhandler(401)
def unauthorized_handler(error):
    response = jsonify({"detail": "Unauthorized", "message": "이메일 또는 비밀번호가 올바르지 않습니다."})
    response.status_code = 401
    # CORS 헤더는 flask-cors가 자동으로 추가함
    return response
```

#### 3. API Gateway 직접 설정

API Gateway 콘솔에서:
1. 해당 API 선택
2. CORS 설정 확인
3. **모든 응답에 CORS 헤더 포함** 옵션 활성화
4. 또는 각 리소스의 메서드 응답에 CORS 헤더 추가

### 확인 사항

1. ✅ OPTIONS 요청에 CORS 헤더 있음 (이미 확인됨)
2. ❌ 401 에러 응답에 CORS 헤더 없음 (수정 필요)
3. ✅ 200 성공 응답에 CORS 헤더 있는지 확인 필요

## 프론트엔드 요청 형식

현재 프론트엔드에서 보내는 요청:

```json
POST /users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

예상 응답 형식:

**성공 (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**실패 (401)**:
```json
{
  "detail": "Unauthorized",
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

## 테스트 방법

1. 브라우저 개발자 도구 → Network 탭
2. 로그인 요청 클릭
3. Response Headers 확인:
   - `Access-Control-Allow-Origin` 헤더가 있어야 함
   - 401 에러 응답에도 CORS 헤더가 포함되어야 함
4. Response 탭에서 실제 에러 메시지 확인 가능해야 함

## 현재 상태

- ✅ 프론트엔드: CORS 오류 처리 및 디버깅 로그 추가 완료
- ✅ 프론트엔드: SPA 라우팅 설정 완료 (`_redirects` 파일)
- ❌ 백엔드: 401 에러 응답에 CORS 헤더 추가 필요
- ❓ 백엔드: 인증 로직 확인 필요 (401이 정상인지, 아니면 다른 문제인지)

