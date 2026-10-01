/*
 * 키오스크 설정 — 이 파일만 고치면 됩니다.
 *
 * code  : 메뉴 코드 (영문 대문자 한 글자). 초대장 사전주문 코드에 쓰이므로
 *         초대장 파일(invitation/index.html)의 메뉴 code 와 똑같이 맞춰 주세요.
 * image : 메뉴 사진 경로 (선택). 예) "images/lemonade.jpg"  — 없으면 아이콘으로 표시됩니다.
 * soldOut : true 로 바꾸면 '품절'로 표시되고 주문할 수 없습니다.
 */
window.SHOP = {
  name: "달콤상점",
  color: "#0B6E4F",          // 포인트 색 (버튼, 선택 표시)

  pickupTimes: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30"],
  payments: ["현금", "계좌이체", "쿠폰"],
  account: "OO은행 000-0000-0000 (예금주 홍길동)",

  adminPin: "0000",          // 관리자 비밀번호 — 꼭 바꿔 주세요

  menu: [
    { code: "A", name: "수제 레몬에이드",   price: 2500, category: "음료", icon: "🍋", desc: "생레몬을 직접 짜서 만든 에이드" },
    { code: "B", name: "청포도 에이드",     price: 2500, category: "음료", icon: "🍇", desc: "청포도 청을 넣은 에이드" },
    { code: "C", name: "아이스티",         price: 1500, category: "음료", icon: "🧊", desc: "복숭아 아이스티" },
    { code: "D", name: "초코칩 쿠키",       price: 1500, category: "디저트", icon: "🍪", desc: "당일 구운 쿠키 2개" },
    { code: "E", name: "미니 핫도그",       price: 2000, category: "디저트", icon: "🌭", desc: "케첩 · 머스터드" },
    { code: "F", name: "컵과일",           price: 3000, category: "디저트", icon: "🍓", desc: "제철 과일 한 컵" },
    { code: "G", name: "에이드 + 쿠키 세트", price: 3500, category: "세트", icon: "🎁", desc: "레몬에이드와 쿠키, 500원 할인" }
  ]
};
