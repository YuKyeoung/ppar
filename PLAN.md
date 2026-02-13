# Coffee Derby - 동물 커피내기 게임 앱 개발 계획 (v2)

## 1. 프로젝트 개요

**Coffee Derby**는 동물 캐릭터들이 다양한 미니게임으로 대결하여 커피내기 승부를 가리는 가볍고 귀여운 모바일 웹 앱입니다.

- **핵심 플로우**: 모드 선택 → 인원수 지정 → 동물 캐릭터 배정 → 미니게임 선택 → 게임 진행 → 꼴찌가 커피 사기!
- **플랫폼**: 모바일 웹 앱 (PWA) — Android/iOS 브라우저에서 실행, 홈 화면 추가 시 네이티브 앱처럼 동작
- **컨셉**: 가볍고, 귀여우며, 직관적인 커피내기 앱
- **플레이 모드**: 싱글 디바이스 (한 폰 돌려쓰기) + 멀티 디바이스 (각자 폰으로 참여)

---

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| **프레임워크** | Next.js 14 (App Router, Static Export) | 모바일 웹 최적화, 빠른 로딩, PWA 지원 |
| **언어** | TypeScript | 타입 안정성, 개발 생산성 |
| **스타일링** | Tailwind CSS | 빠른 UI 개발, 모바일 반응형 |
| **애니메이션** | Framer Motion | 부드러운 동물 애니메이션, 귀여운 인터랙션 |
| **상태관리** | Zustand | 심플하고 가벼움 |
| **실시간 통신** | Supabase Realtime | 멀티 디바이스 모드용, 무료 티어 충분 |
| **배포** | Vercel | 무료, Next.js 최적화, 자동 배포 |
| **사운드** | Howler.js | 가볍고 모바일 호환 우수 |
| **PWA** | next-pwa | 홈 화면 추가, 오프라인 지원 |

---

## 3. 플레이 모드

### 3.1 싱글 디바이스 모드 (Solo Device)
```
한 폰으로 모두 플레이 — 서버 불필요
[홈] → [인원설정 + 이름입력] → [캐릭터선택] → [게임선택] → [턴제 게임진행] → [결과]
```
- 인원 설정 후 한 기기에서 돌려가며 플레이
- 서버 연결 없이 100% 클라이언트에서 동작
- 오프라인에서도 플레이 가능 (PWA)

### 3.2 멀티 디바이스 모드 (Multi Device)
```
각자 폰으로 참여 — Supabase Realtime 사용
[홈] → [방 만들기/참여] → [대기실] → [게임선택(방장)] → [동시 게임진행] → [결과]
```
- 방장이 방 생성 → 방 코드/링크/QR 발급
- 친구들이 코드 입력 or 링크 클릭으로 입장
- 각자 폰에서 동물 선택 후 대기
- 방장이 게임 선택 → 모두 동시 진행
- 실시간 점수/상태 동기화

### 3.3 방 참여 방식 (멀티 모드)

방 생성 시 3가지 방법을 한 화면에 모두 제공:

| 방법 | 설명 | 활용 |
|------|------|------|
| **방 코드** | 6자리 영문 대문자 (예: `CAFE42`) | 말로 전달 "CAFE42 쳐!" |
| **공유 링크** | `coffee-derby.com/join/CAFE42` | 카톡/문자로 공유 |
| **QR 코드** | 링크를 QR로 변환 | 옆에 있을 때 스캔 |

---

## 4. 동물 캐릭터 시스템

### 사용 가능한 동물 (12종)
| 동물 | 이모지 | 색상 테마 | 특징 키워드 |
|------|--------|----------|-------------|
| 고양이 | 🐱 | `#FFB74D` | 느긋함 |
| 강아지 | 🐶 | `#A1887F` | 열정적 |
| 토끼 | 🐰 | `#F48FB1` | 빠름 |
| 곰 | 🐻 | `#8D6E63` | 묵직함 |
| 여우 | 🦊 | `#FF8A65` | 영리함 |
| 판다 | 🐼 | `#90A4AE` | 귀여움 |
| 펭귄 | 🐧 | `#78909C` | 차분함 |
| 햄스터 | 🐹 | `#FFCC80` | 작고 빠름 |
| 부엉이 | 🦉 | `#A1887F` | 지혜로움 |
| 사자 | 🦁 | `#FFB300` | 용감함 |
| 코알라 | 🐨 | `#B0BEC5` | 졸림 |
| 오리 | 🦆 | `#81C784` | 유쾌함 |

### 캐릭터 배정 방식
- **싱글 모드**: 인원수 입력 → 순서대로 동물 선택 or "전체 랜덤 배정"
- **멀티 모드**: 방 입장 시 각자 동물 선택 (선착순, 중복 불가)

---

## 5. 미니게임 목록 (12종)

각 게임은 싱글/멀티 모드 모두 지원하되, 방식이 약간 다름.

### 카테고리 A: 레이싱/경주 (3종)

#### 1. 🏃 달리기 경주 (Tap Race)
- **방식**: 화면을 빠르게 탭하여 동물을 전진시키는 레이스
- **싱글**: 각자 차례로 10초간 탭 → 총 탭 수 비교
- **멀티**: 동시에 각자 폰에서 탭 → 실시간 경주 화면
- **소요**: 10~15초

#### 2. 🎰 슬롯 레이스 (Slot Race)
- **방식**: 슬롯머신을 돌려서 나온 숫자만큼 전진, 3라운드
- **싱글**: 순서대로 슬롯 정지
- **멀티**: 동시에 각자 슬롯 정지
- **소요**: 30초~1분

#### 3. 🚀 로켓 발사 (Rocket Launch)
- **방식**: 차오르는 게이지를 적절한 타이밍에 멈춰 가장 높이 날리기
- **싱글**: 순서대로 게이지 정지
- **멀티**: 동시에 각자 게이지 정지
- **소요**: 10초/인

### 카테고리 B: 운/랜덤 (3종)

#### 4. 🎲 주사위 대결 (Dice Battle)
- **방식**: 주사위를 굴려 가장 높은/낮은 숫자 결정
- **싱글**: 순서대로 탭하여 주사위 굴림
- **멀티**: 동시에 각자 주사위 굴림
- **소요**: 5초/인

#### 5. 🃏 카드 뽑기 (Card Draw)
- **방식**: 뒤집힌 카드 중 하나를 선택, 높은 숫자 승리
- **싱글**: 순서대로 카드 선택
- **멀티**: 동시에 각자 카드 선택 (서버에서 카드 배분)
- **소요**: 10초/인

#### 6. 🎡 룰렛 (Roulette Spin)
- **방식**: 룰렛 돌려서 꼴찌 직접 결정
- **싱글/멀티 동일**: 누구든 스와이프로 룰렛 돌리기, 결과는 모두에게 표시
- **소요**: 5~10초

### 카테고리 C: 스킬/반응속도 (3종)

#### 7. ⚡ 반응속도 테스트 (Quick Tap)
- **방식**: 화면이 빨간→초록으로 바뀌면 가장 빨리 탭하기
- **싱글**: 순서대로 반응속도 측정 → ms 비교
- **멀티**: 동시에 측정 → 서버에서 ms 비교
- **소요**: 5~10초/인

#### 8. 🎯 과녁 맞추기 (Target Shot)
- **방식**: 움직이는/줄어드는 과녁 중심에 가장 정확히 탭하기
- **싱글**: 순서대로 3발씩 사격
- **멀티**: 동시에 각자 3발씩 사격
- **소요**: 10초/인

#### 9. 🧮 암산 배틀 (Math Battle)
- **방식**: 간단한 산수 문제 5개를 가장 빨리 풀기
- **싱글**: 순서대로 풀기 → 시간 비교
- **멀티**: 동시에 풀기 → 먼저 끝내는 순서 기록
- **소요**: 15~30초

### 카테고리 D: 재미/파티 (3종)

#### 10. 💣 폭탄 돌리기 (Bomb Pass)
- **방식**: 랜덤 타이머 폭탄이 터질 때 들고 있는 사람이 짐
- **싱글**: 폰을 옆 사람에게 넘기며 탭 (물리적 전달)
- **멀티**: 화면의 "넘기기" 버튼 탭 → 다음 사람 폰에서 폭탄 표시
- **소요**: 10~30초

#### 11. 🪙 동전 던지기 (Coin Flip Tournament)
- **방식**: 앞/뒤 선택 후 동전 던지기, 토너먼트 or 단판
- **싱글**: 순서대로 앞뒤 선택
- **멀티**: 동시에 앞뒤 선택 → 결과 공개
- **소요**: 10초/라운드

#### 12. 🎪 눈치 게임 (Nunchi Game)
- **방식**: 1부터 숫자를 부르되, 동시에 같은 숫자를 누르면 탈락
- **싱글**: 화면에 버튼 표시, 순서 없이 아무나 탭 (한 폰에서)
- **멀티**: 각자 폰에서 타이밍 맞춰 숫자 버튼 탭
- **소요**: 30초~1분
- **최소 인원**: 3명

---

## 6. 화면 구성 (Screen Flow)

### 6.1 전체 플로우

```
                         ┌─────────────────────────────────────────┐
                         │                                         │
[스플래시] → [홈] ──┬── [싱글모드] → [인원설정] → [캐릭터선택] ──┐│
                    │                                              ││
                    └── [멀티모드] ─┬─ [방 만들기] → [대기실] ─────┤│
                                   │                               ││
                                   └─ [방 참여] → [대기실] ────────┤│
                                                                   ││
                         [게임선택] ← ─────────────────────────────┘│
                              │                                     │
                         [게임진행]                                  │
                              │                                     │
                         [결과화면] ────────────────────────────────┘
```

### 6.2 각 화면 상세

#### 스플래시 (/)
- Coffee Derby 로고 + 커피잔 들고 달리는 동물 애니메이션
- 1.5초 후 자동 전환

#### 홈 (/home)
- **"같이 한 폰으로!"** 버튼 (싱글 모드)
- **"각자 폰으로!"** 버튼 (멀티 모드)
- **"게임 방법"** 링크
- 하단에 동물들이 줄지어 걷는 귀여운 애니메이션

#### 싱글 - 인원 설정 (/solo/setup)
- 2~8명 숫자 선택 (큰 원형 버튼으로 +/-)
- 각 인원 이름 입력 (선택사항, 기본값: "Player 1", "Player 2"...)
- **"다음"** 버튼

#### 싱글 - 캐릭터 선택 (/solo/characters)
- 12종 동물 그리드 표시 (이모지 + 이름)
- 각 플레이어 순서대로 동물 선택 (현재 선택 중인 플레이어 강조)
- **"전체 랜덤 배정"** 버튼
- 선택된 동물은 비활성화 (회색 처리)

#### 멀티 - 방 만들기 (/multi/create)
- 닉네임 입력
- **"방 만들기"** 버튼
- → 방 생성 후 대기실로 이동

#### 멀티 - 방 참여 (/multi/join, /join/[code])
- 방 코드 6자리 입력
- **"참여하기"** 버튼
- 또는 공유 링크(/join/CAFE42)로 직접 접근 시 코드 자동 입력

#### 멀티 - 대기실 (/multi/room/[code])
- 상단: 방 코드 크게 표시 + 복사 버튼
- **공유 영역**: 방 코드 | 링크 복사 | QR 코드 (3가지 동시 표시)
- 참여자 목록 (동물 아바타 + 닉네임, 실시간 업데이트)
- 각자 동물 캐릭터 선택 가능
- 방장 표시 (왕관 아이콘)
- 방장만 **"게임 시작!"** 버튼 표시
- 인원 충분하면 시작 가능 (2명 이상)

#### 게임 선택 (/games)
- 12개 미니게임을 카드 그리드로 표시
- 각 카드: 이모지 아이콘 + 게임명 + 한 줄 설명
- **"랜덤 게임!"** 큰 버튼
- 카테고리 필터 탭 (전체 / 경주 / 운 / 스킬 / 파티)
- 멀티 모드에서는 방장만 선택 가능

#### 게임 진행 (/games/[gameId])
- 3-2-1 카운트다운으로 시작
- 게임별 고유 UI (각 게임 섹션 참고)
- 상단에 참가 동물 캐릭터들 표시
- 진행 상황 실시간 표시

#### 결과 (/result)
- 순위 표시 (1등~꼴찌, 동물 아바타와 함께)
- 1등: 금색 왕관 효과
- 꼴찌: 커피잔 아이콘 + **"커피 사세요!"** 메시지 + 재미있는 애니메이션
- **"다시하기"** (같은 게임, 같은 멤버)
- **"다른 게임"** (게임 선택으로)
- **"홈으로"** (처음부터)
- **공유 버튼** (결과 이미지 저장/공유)

---

## 7. UI/UX 디자인 가이드

### 컬러 팔레트
| 용도 | 색상 | 코드 |
|------|------|------|
| Primary (커피색) | 따뜻한 브라운 | `#8B5E3C` |
| Secondary (크림색) | 밝은 베이지 | `#F5E6D3` |
| Accent (에스프레소) | 진한 갈색 | `#3E2723` |
| Background | 연한 크림 | `#FFF8F0` |
| Surface | 흰색 | `#FFFFFF` |
| Success/1등 | 민트 그린 | `#4CAF50` |
| Warning | 카라멜 | `#FF9800` |
| Danger/꼴찌 | 부드러운 레드 | `#E57373` |
| Text Primary | 진한 갈색 | `#3E2723` |
| Text Secondary | 중간 갈색 | `#795548` |

### 타이포그래피
- 제목: 둥글고 굵은 폰트 (Nunito Bold / Pretendard Bold)
- 본문: 깔끔한 산세리프 (Pretendard)
- 숫자/점수: 모노스페이스 계열 (JetBrains Mono)
- 이모지: 시스템 이모지 (OS 네이티브)

### UI 원칙
- 둥근 모서리 (border-radius: 16~24px)
- 부드러운 그림자 (box-shadow: soft)
- 큰 터치 영역 (최소 48x48px)
- 동물 이모지를 아이콘으로 활용
- 파스텔 톤 + 커피 컬러 조합
- 애니메이션: 바운스, 스프링 효과 (Framer Motion)
- 모바일 퍼스트: 최대 너비 480px, 중앙 정렬

### UX 원칙
- 최대 3탭 내에 게임 시작 가능
- 모든 게임 10초 내 룰 이해 가능
- 뒤로가기 항상 가능
- 진동 피드백 (navigator.vibrate)
- 로딩 시간 최소화 (정적 에셋, 코드 스플리팅)

---

## 8. 프로젝트 디렉토리 구조

```
coffee-derby/
├── app/                            # Next.js App Router 페이지
│   ├── layout.tsx                  # 루트 레이아웃 (PWA 메타, 폰트)
│   ├── page.tsx                    # 스플래시 → 홈 리다이렉트
│   ├── home/
│   │   └── page.tsx                # 홈 화면 (모드 선택)
│   ├── solo/                       # 싱글 디바이스 모드
│   │   ├── setup/
│   │   │   └── page.tsx            # 인원 설정
│   │   └── characters/
│   │       └── page.tsx            # 캐릭터 선택
│   ├── multi/                      # 멀티 디바이스 모드
│   │   ├── create/
│   │   │   └── page.tsx            # 방 만들기
│   │   ├── join/
│   │   │   └── page.tsx            # 방 참여 (코드 입력)
│   │   └── room/
│   │       └── [code]/
│   │           └── page.tsx        # 대기실
│   ├── join/
│   │   └── [code]/
│   │       └── page.tsx            # 공유 링크 진입점 → 방 참여
│   ├── games/
│   │   ├── page.tsx                # 게임 선택 화면
│   │   ├── tap-race/
│   │   │   └── page.tsx            # 달리기 경주
│   │   ├── slot-race/
│   │   │   └── page.tsx            # 슬롯 레이스
│   │   ├── rocket-launch/
│   │   │   └── page.tsx            # 로켓 발사
│   │   ├── dice-battle/
│   │   │   └── page.tsx            # 주사위 대결
│   │   ├── card-draw/
│   │   │   └── page.tsx            # 카드 뽑기
│   │   ├── roulette/
│   │   │   └── page.tsx            # 룰렛
│   │   ├── quick-tap/
│   │   │   └── page.tsx            # 반응속도
│   │   ├── target-shot/
│   │   │   └── page.tsx            # 과녁 맞추기
│   │   ├── math-battle/
│   │   │   └── page.tsx            # 암산 배틀
│   │   ├── bomb-pass/
│   │   │   └── page.tsx            # 폭탄 돌리기
│   │   ├── coin-flip/
│   │   │   └── page.tsx            # 동전 던지기
│   │   └── nunchi-game/
│   │       └── page.tsx            # 눈치 게임
│   └── result/
│       └── page.tsx                # 결과 화면
├── src/
│   ├── components/                 # 재사용 컴포넌트
│   │   ├── ui/                     # 기본 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Input.tsx
│   │   ├── game/                   # 게임 관련 컴포넌트
│   │   │   ├── AnimalAvatar.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── GameCard.tsx
│   │   │   ├── ScoreBoard.tsx
│   │   │   ├── CountDown.tsx
│   │   │   └── ResultRanking.tsx
│   │   └── multi/                  # 멀티 모드 컴포넌트
│   │       ├── RoomCode.tsx        # 방 코드 표시
│   │       ├── QRCode.tsx          # QR 코드 생성
│   │       ├── ShareButtons.tsx    # 공유 버튼들
│   │       └── PlayerList.tsx      # 실시간 참여자 목록
│   ├── stores/                     # Zustand 상태관리
│   │   ├── gameStore.ts            # 게임 상태 (싱글)
│   │   └── roomStore.ts           # 방 상태 (멀티)
│   ├── lib/                        # 라이브러리/서비스
│   │   ├── supabase.ts             # Supabase 클라이언트
│   │   └── realtime.ts             # 실시간 통신 래퍼
│   ├── constants/                  # 상수
│   │   ├── animals.ts              # 동물 데이터
│   │   ├── games.ts                # 게임 메타데이터
│   │   └── theme.ts                # 테마/색상
│   ├── types/                      # TypeScript 타입
│   │   └── index.ts                # 전체 타입 정의
│   └── utils/                      # 유틸리티
│       ├── random.ts               # 랜덤 관련
│       ├── sound.ts                # 사운드 관리
│       └── share.ts                # 공유 기능
├── public/                         # 정적 파일
│   ├── icons/                      # PWA 아이콘
│   ├── sounds/                     # 효과음 파일
│   └── manifest.json               # PWA 매니페스트
├── next.config.js                  # Next.js 설정
├── tailwind.config.ts              # Tailwind 설정
├── package.json                    # 의존성
├── tsconfig.json                   # TypeScript 설정
└── .env.local                      # 환경변수 (Supabase 키)
```

---

## 9. 실시간 통신 아키텍처 (멀티 모드)

### Supabase 구성

#### 테이블: `rooms`
```sql
rooms
├── id: uuid (PK)
├── code: varchar(6) (UNIQUE)     -- 방 코드 "CAFE42"
├── host_id: varchar              -- 방장 식별자
├── status: enum                  -- 'waiting' | 'playing' | 'finished'
├── game_id: varchar              -- 선택된 게임
├── created_at: timestamp
└── expires_at: timestamp         -- 1시간 후 자동 만료
```

#### 테이블: `room_players`
```sql
room_players
├── id: uuid (PK)
├── room_id: uuid (FK → rooms)
├── player_id: varchar            -- 브라우저 세션 ID
├── name: varchar                 -- 닉네임
├── animal: varchar               -- 선택한 동물
├── is_host: boolean
├── score: integer                -- 게임 점수
└── joined_at: timestamp
```

#### Realtime Channels
```
room:{code}
├── presence: 접속 상태 (입장/퇴장)
├── broadcast:game-start → 게임 시작 신호
├── broadcast:game-action → 게임 중 액션 (탭, 선택 등)
├── broadcast:game-result → 게임 결과
└── broadcast:player-ready → 준비 완료
```

### 실시간 통신 흐름
```
1. 방 만들기:   INSERT rooms → Subscribe room:{code} channel
2. 방 참여:     INSERT room_players → Join room:{code} channel
3. 게임 시작:   방장 broadcast "game-start" + game_id
4. 게임 진행:   각자 broadcast "game-action" + 액션 데이터
5. 결과 집계:   방장 기기에서 집계 → broadcast "game-result"
6. 방 종료:     UPDATE rooms status='finished' (또는 1시간 후 자동 만료)
```

---

## 10. 핵심 데이터 모델

```typescript
// === 공통 ===

type PlayMode = 'solo' | 'multi';

type AnimalType = 'cat' | 'dog' | 'rabbit' | 'bear' | 'fox' | 'panda'
  | 'penguin' | 'hamster' | 'owl' | 'lion' | 'koala' | 'duck';

type GameCategory = 'racing' | 'luck' | 'skill' | 'party';

interface Player {
  id: string;
  name: string;
  animal: AnimalType;
  score: number;
  isHost?: boolean;       // 멀티 모드에서 방장 여부
}

interface AnimalData {
  id: AnimalType;
  name: string;           // 한글 이름
  emoji: string;          // 이모지
  color: string;          // 테마 색상
}

interface MiniGame {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
}

interface GameResult {
  rankings: Player[];     // 순위순 정렬
  loser: Player;          // 꼴찌 (커피 사는 사람)
  gameName: string;
}

// === 싱글 모드 스토어 ===

interface GameState {
  mode: PlayMode;
  players: Player[];
  selectedGame: MiniGame | null;
  result: GameResult | null;
  // actions
  setMode: (mode: PlayMode) => void;
  setPlayers: (players: Player[]) => void;
  selectGame: (game: MiniGame) => void;
  updateScore: (playerId: string, score: number) => void;
  setResult: (result: GameResult) => void;
  reset: () => void;
}

// === 멀티 모드 스토어 ===

interface RoomState {
  roomCode: string | null;
  players: Player[];
  myPlayerId: string | null;
  isHost: boolean;
  status: 'waiting' | 'playing' | 'finished';
  selectedGame: MiniGame | null;
  // actions
  createRoom: () => Promise<string>;     // 방 코드 반환
  joinRoom: (code: string) => Promise<void>;
  selectAnimal: (animal: AnimalType) => void;
  startGame: (game: MiniGame) => void;   // 방장만
  sendAction: (action: any) => void;
  leaveRoom: () => void;
}
```

---

## 11. 구현 단계 (Phase)

### Phase 1: 프로젝트 셋업 & 핵심 구조
- [ ] Next.js 프로젝트 초기화 (TypeScript, Tailwind, App Router)
- [ ] PWA 설정 (manifest.json, service worker)
- [ ] 디렉토리 구조 생성
- [ ] Tailwind 커스텀 테마 (커피 컬러 팔레트)
- [ ] TypeScript 타입 정의
- [ ] 상수 데이터 (동물, 게임 메타데이터)
- [ ] Zustand 스토어 (gameStore, roomStore)
- [ ] 공통 UI 컴포넌트 (Button, Card, Input, Modal)

### Phase 2: 싱글 모드 화면 & 흐름
- [ ] 스플래시 화면
- [ ] 홈 화면 (모드 선택)
- [ ] 인원 설정 화면
- [ ] 캐릭터 선택 화면
- [ ] 게임 선택 화면
- [ ] 결과 화면
- [ ] 전체 네비게이션 연결

### Phase 3: 미니게임 구현 — 운/랜덤 계열 (싱글 먼저)
- [ ] 주사위 대결
- [ ] 카드 뽑기
- [ ] 룰렛
- [ ] 동전 던지기

### Phase 4: 미니게임 구현 — 레이싱 & 스킬 계열
- [ ] 달리기 경주 (Tap Race)
- [ ] 슬롯 레이스
- [ ] 로켓 발사
- [ ] 반응속도 테스트

### Phase 5: 미니게임 구현 — 파티 & 나머지
- [ ] 과녁 맞추기
- [ ] 암산 배틀
- [ ] 폭탄 돌리기
- [ ] 눈치 게임

### Phase 6: 멀티 모드 구현
- [ ] Supabase 프로젝트 설정 & 테이블 생성
- [ ] 실시간 통신 래퍼 (lib/realtime.ts)
- [ ] 방 만들기 화면
- [ ] 방 참여 화면 (코드 입력 + 공유 링크)
- [ ] 대기실 (실시간 참여자 목록, 동물 선택, QR 코드)
- [ ] 12개 미니게임에 멀티 모드 로직 추가
- [ ] 실시간 점수 동기화 & 결과 집계

### Phase 7: 마무리 & 폴리시
- [ ] 효과음 추가 (Howler.js)
- [ ] 진동 피드백
- [ ] 결과 공유 기능 (이미지 저장, 카카오톡/SNS 공유)
- [ ] PWA 오프라인 지원 (싱글 모드)
- [ ] 성능 최적화 (코드 스플리팅, 이미지 최적화)
- [ ] 전체 테스트 및 버그 수정

---

## 12. 배포 & 인프라

| 항목 | 서비스 | 비용 |
|------|--------|------|
| **웹 호스팅** | Vercel (무료 티어) | 무료 |
| **실시간 DB** | Supabase (무료 티어) | 무료 |
| **도메인** | 선택사항 (.com) | 연 ~15,000원 or 무료 서브도메인 |
| **총 비용** | | **무료 ~ 연 15,000원** |

### Vercel 무료 티어 한도
- 월 100GB 대역폭
- 무제한 배포
- 커스텀 도메인 지원
- 자동 HTTPS

### Supabase 무료 티어 한도
- 500MB 데이터베이스
- 200 동시 Realtime 접속
- 월 5GB 대역폭
- 50,000 월 활성 유저

커피내기 앱 규모에서는 이 한도를 넘을 일이 거의 없음.

---

## 13. 요약

| 항목 | 내용 |
|------|------|
| **앱 종류** | 모바일 웹 앱 (PWA) |
| **플레이 모드** | 싱글 디바이스 + 멀티 디바이스 |
| **미니게임** | 12종 (경주 3, 운 3, 스킬 3, 파티 3) |
| **동물 캐릭터** | 12종 |
| **인원** | 2~8명 |
| **기술 스택** | Next.js + TypeScript + Tailwind + Supabase |
| **배포** | Vercel (무료) |
| **총 비용** | 무료 |
| **구현 단계** | 7단계 (Phase 1~7) |
