# Pokemon Card Price Tracker — Execute Plan v1

> 작성일: 2026-03-31
> 기반 문서: `pre-plan-v1.md`
> 상태: 실행 계획 (Ready to Execute)

---

## 실행 순서 개요

```
Phase 1  →  프론트엔드 프로젝트 세팅 + Cloudflare Pages 배포
Phase 2  →  언어 분기 페이지 구현
Phase 3  →  [AI] 공식 카드 DB 스크래핑 + SQLite 적재
Phase 4  →  [AI] 시세 판매처 실시간 스크래퍼 작성
Phase 5  →  Rust Axum 백엔드 구축
Phase 6  →  메인 페이지 UI
Phase 7  →  카드 상세 페이지 UI
Phase 8  →  2차 판매처 추가 및 고도화
```

---

## Phase 1 — 프론트엔드 프로젝트 세팅 + Cloudflare Pages 배포

### 목표
로컬에서 개발 가능한 Vite+React+TS 프로젝트를 만들고, Cloudflare Pages에 자동 배포되도록 구성한다.

### 작업 목록

#### 1-1. 프로젝트 초기화
```bash
npm create vite@latest pokemon-price-tracker -- --template react-ts
cd pokemon-price-tracker
npm install
```

#### 1-2. Tailwind CSS v4 설치
```bash
npm install tailwindcss @tailwindcss/vite
```

`vite.config.ts`에 플러그인 추가:
```ts
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [tailwindcss()],
}
```

`src/index.css` 상단에 추가:
```css
@import "tailwindcss";
```

#### 1-3. shadcn/ui 설치
```bash
npx shadcn@latest init
```
- Style: `New York`
- Base color: `Zinc` (또는 프로젝트에 맞게 선택)
- CSS variables: `yes`

초기 필요 컴포넌트 설치:
```bash
npx shadcn@latest add button input card table badge skeleton select
```

#### 1-4. React Router 설치
```bash
npm install react-router-dom
```

라우트 구조:
```
/          → 메인 (카드 리스트)
/card/:id  → 카드 상세
/*         → 404
```

#### 1-5. 디렉토리 구조 설계
```
src/
  components/
    ui/          ← shadcn 자동 생성 컴포넌트
    layout/      ← Header, Footer
    card/        ← CardListItem, CardGrid 등
    price/       ← PriceTable, PriceRow 등
  pages/
    MainPage.tsx
    CardDetailPage.tsx
    ComingSoonPage.tsx
  hooks/
    useLanguageGate.ts
    usePrices.ts
  lib/
    utils.ts     ← shadcn 자동 생성
  types/
    card.ts
    price.ts
```

#### 1-6. Cloudflare Pages 배포 설정

GitHub 레포지토리 연결 후 Cloudflare Pages 대시보드에서:
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

`wrangler.toml` (필요 시):
```toml
name = "pokemon-price-tracker"
compatibility_date = "2026-01-01"
```

### 완료 기준
- `npm run dev` 로컬 실행 정상
- `main` 브랜치 push 시 Cloudflare Pages 자동 빌드·배포 성공
- 빈 페이지라도 Cloudflare 도메인으로 접근 가능

---

## Phase 2 — 언어 분기 페이지 구현

### 목표
한국어 접속자에게는 서비스 페이지를, 그 외 언어 접속자에게는 "준비 중" 페이지를 보여준다.

### 작업 목록

#### 2-1. 언어 감지 훅 작성

`src/hooks/useLanguageGate.ts`:
```ts
export function useLanguageGate(): boolean {
  const lang = navigator.language || navigator.languages?.[0] || ''
  return lang.startsWith('ko')
}
```

#### 2-2. 앱 진입점에 분기 적용

`src/App.tsx`:
```tsx
import { useLanguageGate } from './hooks/useLanguageGate'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { Router } from './Router'

export default function App() {
  const isKorean = useLanguageGate()
  if (!isKorean) return <ComingSoonPage />
  return <Router />
}
```

#### 2-3. ComingSoonPage 구현

`src/pages/ComingSoonPage.tsx`:
- 중앙 정렬 레이아웃
- "서비스 준비 중입니다" 메시지 (한국어)
- "This service is currently unavailable in your region." (영문)
- shadcn `Card` 컴포넌트로 감싸기

### 완료 기준
- 브라우저 언어를 `ko`로 설정하면 메인 페이지 라우터로 진입
- 그 외 언어(`en`, `ja` 등)로 설정하면 ComingSoonPage 노출
- 빌드 후 Cloudflare Pages에서도 동작 확인

---

## Phase 3 — [AI] 공식 카드 DB 스크래핑 + SQLite 적재

### 목표
한국 포켓몬 카드게임 공식 사이트에서 카드 메타데이터를 수집해 SQLite에 저장한다.
**Claude Code가 사이트 구조를 직접 분석하고 스크래퍼를 작성한다.**

### 작업 목록

#### 3-1. 공식 사이트 구조 분석 (Claude Code)
- 대상: `https://pokemoncard.co.kr/main` 카드 검색 페이지
- Claude Code가 WebFetch로 HTML 수집 → DOM 구조 파악
- 페이지네이션 방식, 카드 목록 셀렉터, 상세 페이지 URL 패턴 확인
- JS 렌더링 필요 여부 판단 → 필요 시 Playwright 스크립트 작성

#### 3-2. SQLite 스키마 설계

```sql
-- 카드 메타데이터 (공식 DB 기반)
CREATE TABLE cards (
  id          TEXT PRIMARY KEY,   -- 카드 번호 (예: SV1a-066)
  name        TEXT NOT NULL,      -- 카드명 (한글)
  expansion   TEXT NOT NULL,      -- 확장팩명
  rarity      TEXT,               -- 희귀도 (C, U, R, RR, SAR 등)
  card_type   TEXT,               -- 포켓몬 / 트레이너 / 에너지
  image_url   TEXT,               -- 공식 이미지 URL
  official_url TEXT,              -- 공식 사이트 상세 URL
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- 카드명 별칭 (판매처별 표기 정규화)
CREATE TABLE card_aliases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id     TEXT NOT NULL REFERENCES cards(id),
  alias       TEXT NOT NULL,      -- 판매처 표기 원문
  source      TEXT NOT NULL,      -- 출처 (cardnyang, icu, daangn 등)
  UNIQUE(alias, source)
);
```

#### 3-3. 스크래퍼 작성 (Claude Code)

언어: Python (`httpx` + `BeautifulSoup` 또는 `playwright`)

파일 구조:
```
scraper/
  official/
    scrape_cards.py     ← 카드 목록 수집
    parse_card.py       ← 카드 상세 파싱
    normalize.py        ← 데이터 정규화
    save_to_sqlite.py   ← SQLite INSERT
  db/
    schema.sql
    pokemon_cards.db
```

#### 3-4. 실행 및 검수

```bash
python scraper/official/scrape_cards.py
# → 파싱 결과 sample.json 출력

# 사람이 sample.json 검수 후 승인
python scraper/official/save_to_sqlite.py
```

### 완료 기준
- `cards` 테이블에 전체 카드 데이터 적재 완료
- 카드명, 카드 번호, 확장팩, 희귀도, 이미지 URL 모두 포함
- 누락 카드 5% 미만 (수동 검수 기준)

---

## Phase 4 — [AI] 시세 판매처 실시간 스크래퍼 작성

### 목표
사용자 요청 시 각 판매처에서 실시간으로 가격을 긁어오는 스크래퍼 함수를 작성한다.
**시세 데이터는 DB에 저장하지 않는다. 요청할 때마다 fetch 후 즉시 반환.**

### 판매처별 작업

#### 4-1. 카드냥 (`cardnyang.com`)

- URL: `https://cardnyang.com/?mode=buying`, `?mode=buying2`
- 방식: 정적 HTML → `httpx` + `BeautifulSoup`
- 수집 데이터: 카드코드, 매입가, 이미지 URL
- 카드코드(SV1a-066) → SQLite `cards.id` 매핑
- 운영 기간 종료 감지 로직 포함

```python
# scraper/prices/cardnyang.py
def fetch_cardnyang_prices(card_id: str) -> list[PriceItem]:
    # mode=buying + mode=buying2 순회
    # 카드코드로 필터링 후 반환
```

#### 4-2. ICU 너정다 (`icu.gg`)

- URL: `https://icu.gg/trade/card_list`
- 방식: JS 렌더링 → Playwright
- 수집 데이터: 평균 거래가, 최근 거래 내역, 시세 변동 방향
- 로그인 없이 접근 가능한 범위 확인 후 구현

```python
# scraper/prices/icu.py
async def fetch_icu_price(card_name: str) -> PriceItem:
    # Playwright로 카드 검색 → 가격 추출
```

#### 4-3. 당근마켓 (`daangn.com`)

- URL: `https://www.daangn.com/search/포켓몬카드`
- 방식: 정적 JSON-LD 파싱 → `httpx`
- 수집 데이터: 상품명, 가격, 판매자, 지역, 등록일
- 상품명에서 카드 정보 추출: 정규식 + 카드명 유사도 매칭

```python
# scraper/prices/daangn.py
def fetch_daangn_listings(card_name: str) -> list[PriceItem]:
    # JSON-LD 파싱 → 카드명 필터링 → 반환
```

#### 4-4. 중고나라 (`web.joongna.com`)

- URL: `https://web.joongna.com/search/포켓몬카드`
- 방식: Next.js SSR HTML 내 `__NEXT_DATA__` JSON 파싱
- 수집 데이터: 상품명, 가격, 날짜, 채팅수

```python
# scraper/prices/joongna.py
def fetch_joongna_listings(card_name: str) -> list[PriceItem]:
    # __NEXT_DATA__ 추출 → 파싱 → 카드명 필터링 → 반환
```

#### 4-5. 공통 타입 정의

```python
# scraper/prices/types.py
from dataclasses import dataclass
from typing import Literal

@dataclass
class PriceItem:
    source: Literal['cardnyang', 'icu', 'daangn', 'joongna']
    card_id: str | None       # SQLite cards.id (매핑 성공 시)
    card_name_raw: str        # 판매처 원문 카드명
    price: int                # 원화
    price_type: Literal['buy', 'sell', 'used']
    url: str | None           # 상품 링크
    fetched_at: str           # ISO8601 타임스탬프
```

#### 4-6. 카드명 정규화 보완

Phase 3에서 구축한 `card_aliases` 테이블에 판매처별 별칭 추가:
- Claude Code가 스크래핑 결과를 분석해 미매핑 카드 목록 출력
- 사람이 검수 후 별칭 추가 승인

### 완료 기준
- 각 판매처별 스크래퍼 함수 단독 실행 테스트 통과
- 특정 카드 ID로 4개 판매처 가격 모두 반환 확인
- 판매처 중 1개 실패해도 나머지 결과 정상 반환 (부분 실패 허용)

---

## Phase 5 — Rust Axum 백엔드 구축

### 목표
카드 메타데이터 조회 API와 실시간 시세 조회 API를 제공하는 Rust 서버를 구축한다.

### 작업 목록

#### 5-1. Rust 프로젝트 초기화

```bash
cargo new backend --bin
cd backend
```

`Cargo.toml` 주요 의존성:
```toml
[dependencies]
axum = "0.8"
tokio = { version = "1", features = ["full"] }
sea-orm = { version = "1", features = ["sqlx-sqlite", "runtime-tokio-rustls"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tower-http = { version = "0.6", features = ["cors"] }
reqwest = { version = "0.12", features = ["json"] }
```

#### 5-2. API 엔드포인트 설계

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/cards` | 카드 목록 (페이지네이션, 검색·필터 지원) |
| `GET` | `/api/cards/:id` | 카드 단건 조회 |
| `GET` | `/api/cards/:id/prices` | 카드 실시간 시세 조회 (모든 판매처) |
| `GET` | `/api/expansions` | 확장팩 목록 |

#### 5-3. Query 파라미터 (`GET /api/cards`)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `q` | string | 카드명 검색 |
| `expansion` | string | 확장팩 필터 |
| `rarity` | string | 희귀도 필터 |
| `page` | int | 페이지 번호 (기본값: 1) |
| `per_page` | int | 페이지당 건수 (기본값: 40) |

#### 5-4. SeaORM 엔티티 생성

```bash
sea-orm-cli generate entity -u sqlite://scraper/db/pokemon_cards.db -o src/entities
```

#### 5-5. 실시간 시세 조회 구현

`GET /api/cards/:id/prices` 처리 흐름:
```
1. Axum 핸들러 수신
2. Python 스크래퍼를 subprocess로 호출 (또는 HTTP로 별도 스크래퍼 서비스 호출)
3. 4개 판매처 병렬 fetch (tokio::join!)
4. 타임아웃 설정: 판매처별 최대 5초
5. 성공한 판매처 결과만 취합해 JSON 반환
```

> **스크래퍼 호출 방식 결정 필요**: Rust에서 Python subprocess 호출 vs. 별도 Python FastAPI 마이크로서비스
> - 초기: subprocess 방식으로 단순하게 시작
> - 추후 부하 증가 시 별도 서비스로 분리 고려

#### 5-6. CORS 설정

Cloudflare Pages 도메인에서 API 호출 허용:
```rust
let cors = CorsLayer::new()
    .allow_origin(["https://your-app.pages.dev".parse().unwrap()])
    .allow_methods([Method::GET]);
```

### 완료 기준
- `GET /api/cards?q=리자몽` 응답 정상
- `GET /api/cards/SV1a-066/prices` 실시간 시세 JSON 반환 (1~5개 판매처)
- 판매처 타임아웃 5초 내 처리

---

## Phase 6 — 메인 페이지 UI

### 목표
카드 전체 리스트와 검색 바를 구현한다. 시세는 카드 목록에서 요약 표시한다.

### 작업 목록

#### 6-1. API 연동 훅

```ts
// src/hooks/useCards.ts
import { useQuery } from '@tanstack/react-query'

export function useCards(params: CardSearchParams) {
  return useQuery({
    queryKey: ['cards', params],
    queryFn: () => fetchCards(params),
  })
}
```

React Query 설치:
```bash
npm install @tanstack/react-query
```

#### 6-2. 검색 바 컴포넌트

`src/components/card/CardSearchBar.tsx`:
- shadcn `Input` — 카드명 텍스트 검색
- shadcn `Select` — 확장팩 필터
- shadcn `Select` — 희귀도 필터 (C / U / R / RR / SAR / ...)
- 검색어 디바운스 300ms 적용

#### 6-3. 카드 리스트 컴포넌트

`src/components/card/CardGrid.tsx`:
- CSS Grid 레이아웃 (모바일: 2열 / 태블릿: 3열 / 데스크톱: 4~5열)
- shadcn `Card`로 감싼 카드 아이템

`src/components/card/CardListItem.tsx`:
- 카드 썸네일 이미지 (lazy loading)
- 카드명 / 확장팩 / 희귀도 `Badge`
- 카드냥 매입가 요약 표시 (카드 상세에서 전체 판매처 확인 유도)
- 클릭 시 `/card/:id` 이동

#### 6-4. 헤더 레이아웃

`src/components/layout/Header.tsx`:
- 로고 (텍스트 또는 SVG)
- 카드 검색 바 임베드

#### 6-5. 페이지네이션

shadcn `Pagination` 컴포넌트 사용, API `page` 파라미터 연동

### 완료 기준
- 카드 목록 정상 렌더링 (40개/페이지)
- 카드명 검색 → 결과 필터링 동작
- 확장팩/희귀도 필터 동작
- 모바일 반응형 레이아웃 확인

---

## Phase 7 — 카드 상세 페이지 UI

### 목표
카드 상세 정보와 실시간 시세 비교 테이블을 구현한다.

### 작업 목록

#### 7-1. 실시간 시세 조회 훅

```ts
// src/hooks/usePrices.ts
export function usePrices(cardId: string) {
  return useQuery({
    queryKey: ['prices', cardId],
    queryFn: () => fetchPrices(cardId),
    staleTime: 0,        // 항상 fresh fetch
    gcTime: 0,           // 캐시 미사용
    retry: 1,
  })
}
```

#### 7-2. 카드 상세 레이아웃

`src/pages/CardDetailPage.tsx`:
```
[ 뒤로 가기 버튼 ]
[ 카드 이미지 (좌) | 카드 기본 정보 (우) ]
  - 카드명
  - 카드 번호 / 확장팩 / 희귀도 Badge
  - 공식 사이트 링크

[ 실시간 시세 비교 ]
  - 로딩 중: Skeleton UI (3행)
  - 완료: PriceTable
  - 실패: "시세를 불러오지 못했습니다" 안내
```

#### 7-3. 시세 테이블 컴포넌트

`src/components/price/PriceTable.tsx`:

| 판매처 | 구분 | 가격 | 조회 시각 | 링크 |
|--------|------|------|-----------|------|
| 카드냥 | 매입가 | ₩12,000 | 방금 전 | → |
| ICU 너정다 | 평균 거래가 | ₩15,000 | 방금 전 | → |
| 당근마켓 | 중고가 (최저) | ₩10,000 | 방금 전 | → |
| 중고나라 | 중고가 (최저) | ₩11,000 | 방금 전 | → |

- 최저가 행 강조 표시 (`Badge` 또는 배경색)
- 판매처별 로딩 상태 개별 표시 (Skeleton 행)
- shadcn `Table` 컴포넌트 활용

#### 7-4. Skeleton UI

```tsx
// 시세 로딩 중
{isPending && (
  <div className="space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
)}
```

### 완료 기준
- 카드 상세 정보 정상 표시
- 페이지 진입 시 실시간 시세 fetch 시작
- Skeleton → 데이터 전환 애니메이션 확인
- 판매처 1개 이상 실패 시에도 나머지 결과 표시

---

## Phase 8 — 2차 판매처 추가 및 고도화

### 목표
1차에서 보류했던 판매처를 추가하고 전반적인 완성도를 높인다.

### 작업 목록

#### 8-1. 트레이너스 추가 검토
- `https://trainers.kr/` 재조사
- 싱글 카드 판매가 페이지 존재 여부 재확인
- Cafe24 동적 로딩 → Playwright 스크래퍼 작성

#### 8-2. 번개장터 추가
- `https://m.bunjang.co.kr/search/products?q=포켓몬카드`
- Playwright 필수
- 상품명 파싱 로직 정교화

#### 8-3. 카드명 정규화 고도화
- 1차 운영 중 누적된 미매핑 케이스 일괄 처리
- `card_aliases` 테이블 보완

#### 8-4. 성능 개선
- 메인 페이지 카드 이미지 lazy loading 최적화
- API 응답 캐싱 (Axum 레벨 in-memory 캐시, TTL 30초)
- 실시간 시세 조회 병렬 처리 확인

#### 8-5. 에러 처리 UX 개선
- 판매처 전체 실패 시 안내 메시지
- 네트워크 오류 시 재시도 버튼

---

## 의존성 및 실행 환경 요약

### 프론트엔드
| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | 19.x | UI 프레임워크 |
| vite | 6.x | 빌드 도구 |
| typescript | 5.x | 타입 시스템 |
| tailwindcss | 4.x | 스타일링 |
| shadcn/ui | latest | UI 컴포넌트 |
| @tanstack/react-query | 5.x | 서버 상태 관리 |
| react-router-dom | 7.x | 라우팅 |

### 백엔드 (Rust)
| 크레이트 | 버전 | 용도 |
|----------|------|------|
| axum | 0.8 | HTTP 서버 |
| tokio | 1 | 비동기 런타임 |
| sea-orm | 1 | ORM |
| serde / serde_json | 1 | JSON 직렬화 |
| tower-http | 0.6 | CORS 미들웨어 |
| reqwest | 0.12 | HTTP 클라이언트 |

### 스크래퍼 (Python)
| 패키지 | 버전 | 용도 |
|--------|------|------|
| httpx | latest | HTTP 클라이언트 |
| beautifulsoup4 | latest | HTML 파싱 |
| playwright | latest | JS 렌더링 (ICU, 번개장터) |
| sqlite3 | 표준 라이브러리 | DB 접근 |

---

## 체크리스트

### Phase 1
- [ ] Vite + React + TS 초기화
- [ ] Tailwind CSS v4 설치 및 설정
- [ ] shadcn/ui 초기화 + 기본 컴포넌트 설치
- [ ] React Router 설정
- [ ] Cloudflare Pages 연결 + 자동 배포 확인

### Phase 2
- [ ] `useLanguageGate` 훅 구현
- [ ] ComingSoonPage 구현
- [ ] 언어 분기 로직 적용 및 테스트

### Phase 3
- [ ] 공식 사이트 DOM 구조 분석 (Claude Code)
- [ ] SQLite 스키마 생성
- [ ] 카드 DB 스크래퍼 작성 (Claude Code)
- [ ] 파싱 결과 사람 검수
- [ ] SQLite 데이터 적재 완료

### Phase 4
- [ ] 카드냥 스크래퍼 작성 + 테스트 (Claude Code)
- [ ] ICU 너정다 스크래퍼 작성 + 테스트 (Claude Code)
- [ ] 당근마켓 스크래퍼 작성 + 테스트 (Claude Code)
- [ ] 중고나라 스크래퍼 작성 + 테스트 (Claude Code)
- [ ] 카드명 정규화 및 별칭 매핑 검수

### Phase 5
- [ ] Rust Axum 프로젝트 초기화
- [ ] SeaORM 엔티티 생성
- [ ] `/api/cards` 엔드포인트 구현
- [ ] `/api/cards/:id/prices` 실시간 시세 조회 구현
- [ ] CORS 설정
- [ ] API 동작 테스트

### Phase 6
- [ ] React Query 설정
- [ ] 카드 검색 바 컴포넌트
- [ ] 카드 그리드 / 리스트 아이템 컴포넌트
- [ ] 페이지네이션
- [ ] 모바일 반응형 확인

### Phase 7
- [ ] 카드 상세 레이아웃
- [ ] 실시간 시세 테이블 컴포넌트
- [ ] Skeleton UI 적용
- [ ] 부분 실패 처리 확인

### Phase 8
- [ ] 트레이너스 재조사 및 추가 여부 결정
- [ ] 번개장터 스크래퍼 추가
- [ ] 카드명 정규화 보완
- [ ] 성능 개선 및 에러 UX 개선
