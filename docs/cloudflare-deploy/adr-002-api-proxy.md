# ADR-002: Cloudflare Pages Functions API 프록시 도입

> 작성일: 2026-04-02
> 상태: 채택됨 (Accepted)
> 저장소: `pokemon-price-tracker-front`

---

## 맥락 (Context)

프론트엔드가 Cloudflare Pages(HTTPS)에 배포된 상태에서, GCE e2-micro VM의 Rust 백엔드(`http://34.64.136.61:3000`)를 직접 호출하면 브라우저가 Mixed Content 에러로 요청을 차단한다.

```
Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested
an insecure resource 'http://34.64.136.61:3000/api/cards'. This request has
been blocked; the content must be served over HTTPS.
```

`VITE_API_URL=http://34.64.136.61:3000`을 빌드 환경변수로 설정해도 HTTP → HTTPS 혼합 문제는 근본적으로 해결되지 않는다.

---

## 결정 (Decision)

### 채택: Cloudflare Pages Functions 프록시

`functions/api/[[path]].ts`를 생성하여 `/api/*` 경로를 Cloudflare 서버사이드에서 백엔드로 포워딩한다.

```
브라우저 → HTTPS → Cloudflare Pages (/api/*)
                         ↓ 서버사이드
                    http://34.64.136.61:3000/api/*
```

**구현:**

```typescript
// functions/api/[[path]].ts
interface Env {
  BACKEND_URL: string
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const backendUrl = `${context.env.BACKEND_URL}${url.pathname}${url.search}`

  return fetch(backendUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: ['GET', 'HEAD'].includes(context.request.method)
      ? undefined
      : context.request.body,
  })
}
```

`BACKEND_URL`은 Cloudflare Pages 대시보드 환경변수로 주입한다. 프록시가 서버사이드에서 HTTP로 VM에 접근하므로 Mixed Content 정책 적용 대상이 아니다.

`src/lib/api.ts`에서 `API_BASE`를 빈 문자열로 폴백하도록 변경했다:

```typescript
// 변경 전
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// 변경 후
const API_BASE = import.meta.env.VITE_API_URL ?? ''
```

- 로컬 개발: `.env.local`의 `VITE_API_URL=http://localhost:3000` → 백엔드 직접 호출
- 배포 환경: `VITE_API_URL` 미설정 → `''` → 상대경로 `/api/*` → Pages Function 경유

### 거절: GCE VM에 SSL 인증서 설정 (Nginx + Let's Encrypt)

VM에 Nginx 리버스 프록시 + Let's Encrypt SSL을 설치하는 방식. 도메인 필요, 인증서 갱신 관리 필요, 설정 복잡도 증가. e2-micro 무료 티어 프로젝트에 불필요한 운영 부담이 생긴다.

### 거절: VITE_API_URL을 HTTPS URL로 변경

GCE VM에 HTTPS가 없으므로 불가능. VM에 공인 도메인 + SSL을 붙이지 않는 한 근본적으로 해결이 안 된다.

### 거절: Cloudflare Tunnel

`cloudflared` 데몬을 VM에 설치해 HTTPS 터널을 생성하는 방식. 유효한 해결책이나 VM에 추가 프로세스 상주 필요, 터널 설정 및 Cloudflare 계정 도메인 연동 필요. Pages Functions보다 설정이 복잡하다.

---

## 결과 (Consequences)

### 긍정적

- Mixed Content 에러 완전 해결
- VM에 HTTPS/도메인 없이도 프로덕션 배포 가능
- 프록시 경유로 VM IP가 브라우저에 노출되지 않음
- `BACKEND_URL`만 변경하면 백엔드 이전 가능

### 부정적

- Cloudflare Pages → GCE 구간 지연 미세 증가 (서버사이드 프록시 홉 추가)
- Pages Functions 무료 티어 요청 수 제한(일 10만 건) — 개인 프로젝트 규모에서는 문제 없음

### 중립적

- 로컬 개발 시 `.env.local`의 `VITE_API_URL=http://localhost:3000` 그대로 유지
- 배포 환경에서 `VITE_API_URL` 환경변수 불필요 (제거 또는 미설정)

---

## 환경변수 설정

| 위치 | 변수 | 값 |
|------|------|----|
| Cloudflare Pages → Environment variables | `BACKEND_URL` | `http://34.64.136.61:3000` |
| `.env.local` (로컬 개발용) | `VITE_API_URL` | `http://localhost:3000` |

---

## 관련 변경

| 파일 | 변경 내용 |
|------|-----------|
| `functions/api/[[path]].ts` | 신규 생성 — Pages Function 프록시 |
| `src/lib/api.ts` | `API_BASE` 폴백을 `\|\|` → `??` 로 변경, 기본값 `''` |
