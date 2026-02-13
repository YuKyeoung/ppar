# Coffee Derby v2 - 전면 개편 계획

## 고객 요구사항
1. **웹앱 불가** → 싱글 기기, 여러명이 접속하는 시간 낭비 없을 것
2. **APK 배포** → Android/iOS 네이티브 앱 패키징 (Capacitor)
3. **배포 불필요** → APK 빌드해서 테스트용으로만 사용
4. **원터치 결과** → 터치 한 번으로 결과가 바로 나오는 게임

## 핵심 컨셉 변경

### Before (현재)
```
홈 → 솔로/멀티 선택 → 플레이어 설정 → 게임 선택 → [턴 기반 플레이] → 결과
                                              ↗ Supabase 멀티플레이어
```

### After (개편)
```
홈 → 플레이어 이름 입력 (2~6명) → 게임 선택 → [화면 탭 1회] → 애니메이션 → 결과
```

**원칙: 한 기기, 한 번 탭, 즉시 결과**

---

## Phase 0: 인프라 전환 (Capacitor + 코드 정리)

### 0-1. 삭제할 것 (Dead Code 제거)
- `src/lib/supabase.ts` — Supabase 클라이언트 전체 삭제
- `src/stores/roomStore.ts` — 멀티플레이어 룸 스토어 삭제
- `src/app/multi/` — 멀티 셋업 페이지 삭제
- `src/app/join/` — 방 참여 페이지 삭제
- `src/app/room/` — 방 로비 페이지 삭제
- `qrcode.react`, `@supabase/supabase-js` 패키지 삭제
- `src/utils/share.ts` — 공유 유틸 삭제 (앱이므로 불필요)

### 0-2. Capacitor 셋업
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Coffee Derby" "com.coffeedeerby.app"
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### 0-3. Next.js → Static Export 설정
```js
// next.config.mjs
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
```

### 0-4. Capacitor 빌드 파이프라인
```bash
npm run build          # Next.js static export → out/
npx cap sync           # out/ → android/ios 프로젝트에 복사
npx cap open android   # Android Studio에서 APK 빌드
```

---

## Phase 1: 플레이어 셋업 단순화

### 현재 (solo/setup → 복잡한 동물 선택 + 멀티 분기)
### 목표: 단일 셋업 페이지

**`/setup` 페이지 (src/app/setup/page.tsx)**
- 2~6명 이름 입력 (기본 2칸, + 버튼으로 추가)
- 동물은 자동 랜덤 배정 (선택 과정 스킵 → 시간 절약)
- "시작!" 버튼 → 게임 선택 화면으로

### 스토어 단순화 (gameStore.ts)
```ts
interface GameState {
  players: Player[];          // 이름 + 자동배정 동물
  result: GameResult | null;  // 최근 결과
  setPlayers: (players: Player[]) => void;
  setResult: (result: GameResult) => void;
  clear: () => void;
}
```
- `updateScore`, `selectedGame`, `roomCode` 등 불필요한 필드 제거

---

## Phase 2: 원터치 게임 설계 (6종)

모든 게임의 공통 UX:
```
게임 화면 진입 → 플레이어 카드 표시 → 큰 버튼 "TAP!" → 애니메이션 (1~3초) → 결과 표시
```

### Game 1: 룰렛 (Roulette) — 기존 코드 활용
- 탭 → 룰렛 회전 → 멈추면 꼴찌 결정
- 기존 `roulette/page.tsx` 리팩터링

### Game 2: 주사위 (Dice Roll) — 기존 코드 대폭 수정
- 탭 → **모든 플레이어 주사위 동시에 굴림** → 최저 = 꼴찌
- 현재: 턴 기반 (한 명씩 굴림) → 변경: 동시 굴림 + 결과 일괄 표시

### Game 3: 카드 뽑기 (Card Draw) — 기존 코드 대폭 수정
- 탭 → **모든 플레이어 카드 동시 오픈** → 최저 = 꼴찌
- 현재: 턴 기반 → 변경: 동시 공개

### Game 4: 사다리 타기 (Ladder Game) — 신규
- 탭 → 사다리 애니메이션 → 커피 당첨자 1명 결정
- 한국 문화에 딱 맞는 클래식 게임

### Game 5: 제비뽑기 (Draw Straws) — 신규
- 탭 → 제비(막대) 하나씩 뽑히는 애니메이션 → 짧은 막대 = 꼴찌
- 심플하고 직관적

### Game 6: 슬롯머신 (Slot Machine) — 기존 코드 수정
- 탭 → 슬롯 회전 → 특정 심볼 조합 = 꼴찌
- 현재: 턴 기반 → 변경: 전체 결과 한번에

### 삭제할 게임 (턴/멀티탭 필수라 원터치 불가)
- `tap-race` — 연타 게임 (원터치 불가)
- `rocket-launch` — 홀드 게임 (원터치 불가)
- `quick-tap` — 리액션 게임 (원터치 불가)
- `target-shot` — 에임 게임 (원터치 불가)
- `math-battle` — 풀이 게임 (원터치 불가)
- `bomb-pass` — 반복 탭 (원터치 불가)
- `nunchi-game` — 타이밍 게임 (원터치 불가)
- `coin-flip` — 선택 필요 (원터치 불가)

---

## Phase 3: 결과 화면 개선

**`/result` 페이지**
- 1등~꼴찌 랭킹 표시 (기존 유지)
- **"다시 하기"** 버튼 → 같은 멤버로 게임 선택 화면 복귀
- **"새 게임"** 버튼 → 플레이어 셋업부터 다시
- 꼴찌 강조 애니메이션 (기존 유지)

---

## Phase 4: 네이티브 기능 (Capacitor)

### 4-1. Haptic Feedback
```bash
npm install @capacitor/haptics
```
- 현재 `navigator.vibrate` → Capacitor Haptics API로 교체
- 네이티브 진동 패턴 지원

### 4-2. Status Bar / Navigation Bar
```bash
npm install @capacitor/status-bar
```
- 전체화면 몰입 모드
- 상태바 색상 테마 매칭

### 4-3. Splash Screen
```bash
npm install @capacitor/splash-screen
```
- 앱 시작 시 Coffee Derby 로고 표시

### 4-4. APK 빌드
```bash
npm run build && npx cap sync
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Phase 5: UX 폴리시

- 게임 선택 화면에서 "랜덤" 버튼 (아무 게임이나 골라줌)
- 게임 간 전환 애니메이션
- 사운드 on/off 토글
- 다크모드 지원 (선택)

---

## 파일 구조 (최종)

```
src/
├── app/
│   ├── page.tsx              # 홈 (로고 + 시작 버튼)
│   ├── setup/page.tsx        # 플레이어 이름 입력
│   ├── games/
│   │   ├── page.tsx          # 게임 선택 화면
│   │   ├── roulette/page.tsx # 룰렛
│   │   ├── dice/page.tsx     # 주사위 (동시 굴림)
│   │   ├── card/page.tsx     # 카드 뽑기 (동시 오픈)
│   │   ├── ladder/page.tsx   # 사다리 타기 (신규)
│   │   ├── straw/page.tsx    # 제비뽑기 (신규)
│   │   └── slot/page.tsx     # 슬롯머신
│   ├── result/page.tsx       # 결과
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── game/
│   │   ├── PlayerCard.tsx    # 플레이어 카드 (결과 표시용)
│   │   └── TapButton.tsx     # 공통 "TAP!" 버튼
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── constants/
│   ├── animals.ts
│   └── games.ts              # 6종 게임 정의
├── hooks/
│   └── useGameResult.ts      # 결과 계산 공통 훅
├── stores/
│   └── gameStore.ts          # 단순화된 스토어
├── types/
│   └── index.ts
└── utils/
    ├── haptic.ts             # Capacitor Haptics
    ├── random.ts
    └── sound.ts
```

---

## 삭제 대상 정리

| 파일/디렉토리 | 이유 |
|---|---|
| `src/lib/supabase.ts` | Supabase 제거 |
| `src/stores/roomStore.ts` | 멀티플레이어 제거 |
| `src/app/multi/` | 멀티 셋업 제거 |
| `src/app/join/` | 방 참여 제거 |
| `src/app/room/` | 방 로비 제거 |
| `src/app/solo/` | 단일 셋업으로 통합 |
| `src/app/games/tap-race/` | 원터치 불가 |
| `src/app/games/rocket-launch/` | 원터치 불가 |
| `src/app/games/quick-tap/` | 원터치 불가 |
| `src/app/games/target-shot/` | 원터치 불가 |
| `src/app/games/math-battle/` | 원터치 불가 |
| `src/app/games/bomb-pass/` | 원터치 불가 |
| `src/app/games/nunchi-game/` | 원터치 불가 |
| `src/app/games/coin-flip/` | 원터치 불가 |
| `src/utils/share.ts` | 공유 불필요 |
| `src/components/game/CountDown.tsx` | 카운트다운 불필요 |
| `src/components/game/PlayerScoreboard.tsx` | 새 구조에서 불필요 |
| `src/hooks/useGameFlow.ts` | 새 훅으로 대체 |
| `src/constants/theme.ts` | 이미 삭제됨 |
| `@supabase/supabase-js` | 패키지 삭제 |
| `qrcode.react` | 패키지 삭제 |

---

## 구현 순서

| 순서 | 작업 | 예상 변경 |
|------|------|----------|
| **Step 1** | 인프라: dead code 삭제 + Capacitor 셋업 + static export | 삭제 위주 |
| **Step 2** | 스토어 단순화 + 셋업 페이지 새로 작성 | gameStore, setup |
| **Step 3** | 게임 선택 화면 리빌드 (6종) | games/page.tsx |
| **Step 4** | 기존 게임 리팩터 (룰렛, 주사위, 카드, 슬롯) → 원터치 | 4파일 대폭 수정 |
| **Step 5** | 신규 게임 (사다리, 제비뽑기) | 2파일 신규 |
| **Step 6** | 결과 화면 개선 | result 수정 |
| **Step 7** | 네이티브 기능 + APK 빌드 | Capacitor 플러그인 |
| **Step 8** | 최종 테스트 + APK 출력 | 빌드 검증 |
