#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"
MODE="${1:-basic}"

GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

pass() {
  printf "${GREEN}PASS${RESET} %s\n" "$1"
}

warn() {
  printf "${YELLOW}WARN${RESET} %s\n" "$1"
}

fail() {
  printf "${RED}FAIL${RESET} %s\n" "$1"
  exit 1
}

http_status() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local origin="${4:-}"

  if [ -n "$body" ] && [ -n "$origin" ]; then
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Origin: $origin" \
      --data "$body"
    return
  fi

  if [ -n "$body" ]; then
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      --data "$body"
    return
  fi

  curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url"
}

header_exists() {
  local header_name="$1"
  curl -s -D - "$BASE_URL/" -o /dev/null | awk -v key="$header_name" '
    BEGIN { IGNORECASE=1; found=0 }
    $0 ~ "^" key ":" { found=1 }
    END { exit(found ? 0 : 1) }
  '
}

echo "== Security Smoke Test =="
echo "BASE_URL: $BASE_URL"
echo "MODE: $MODE"
echo

root_code="$(http_status "GET" "$BASE_URL/")"
if [ "$root_code" = "200" ]; then
  pass "홈 페이지 응답 200"
else
  fail "홈 페이지 응답이 200이 아님: $root_code"
fi

for header in "X-Content-Type-Options" "X-Frame-Options" "Referrer-Policy" "Permissions-Policy"; do
  if header_exists "$header"; then
    pass "보안 헤더 존재: $header"
  else
    fail "보안 헤더 누락: $header"
  fi
done

origin_block_code="$(http_status "POST" "$BASE_URL/api/auth/login" '{"email":"x","password":"y"}' "https://evil.example")"
if [ "$origin_block_code" = "403" ]; then
  pass "로그인 API Origin 검증 정상(403)"
else
  fail "로그인 Origin 검증 실패(기대 403, 실제 $origin_block_code)"
fi

if [ "$MODE" = "full" ]; then
  echo
  warn "full 모드는 rate limit 카운터를 소진합니다(잠시 동안 테스트 계정/문의 제한 발생)."

  precheck_login_code="$(http_status "POST" "$BASE_URL/api/auth/login" '{"email":"wrong@example.com","password":"wrong"}' "$BASE_URL")"
  if [ "$precheck_login_code" = "400" ]; then
    warn "Captcha가 활성화되어 로그인 rate limit/잠금 테스트를 건너뜁니다."
  else
    last_login_code="$precheck_login_code"
    echo "  login attempt 1 -> $last_login_code"
    for i in $(seq 2 9); do
      last_login_code="$(http_status "POST" "$BASE_URL/api/auth/login" '{"email":"wrong@example.com","password":"wrong"}' "$BASE_URL")"
      echo "  login attempt $i -> $last_login_code"
    done

    if [ "$last_login_code" = "423" ] || [ "$last_login_code" = "429" ]; then
      pass "로그인 보호 정상(최종 응답 $last_login_code)"
    else
      fail "로그인 보호 실패(기대 423/429, 실제 $last_login_code)"
    fi
  fi

  last_inquiry_code=""
  for i in $(seq 1 13); do
    last_inquiry_code="$(http_status "POST" "$BASE_URL/api/inquiries" '{"name":"테스트","phone":"01012341234","email":"test@example.com","category":"기타 문의","message":"자동 점검용 문의 메시지입니다."}')"
    echo "  inquiry attempt $i -> $last_inquiry_code"
  done
  if [ "$last_inquiry_code" = "429" ]; then
    pass "문의 rate limit 정상(13번째 429)"
  else
    fail "문의 rate limit 실패(기대 429, 실제 $last_inquiry_code)"
  fi
else
  echo
  warn "basic 모드는 rate limit 소진 테스트를 건너뜁니다."
  warn "전체 검증은: bash ./scripts/security-smoke.sh full"
fi

echo
pass "보안 스모크 테스트 완료"
