/* 초대장과 키오스크가 함께 쓰는 도구들 */
(function () {
  const S = window.SHOP;

  const won = (n) => n.toLocaleString("ko-KR") + "원";
  const byCode = (code) => S.menu.find((m) => m.code === code);

  // 장바구니 {코드: 수량} → 합계
  const cartTotal = (cart) =>
    Object.entries(cart).reduce((sum, [code, qty]) => sum + (byCode(code) ? byCode(code).price * qty : 0), 0);

  const cartText = (cart) =>
    Object.entries(cart)
      .filter(([code, qty]) => qty > 0 && byCode(code))
      .map(([code, qty]) => byCode(code).name + " " + qty + "개")
      .join(", ");

  /*
   * 사전주문 코드: 메뉴코드+수량 - 픽업시간 - 전화 뒷자리 - 이름
   * 예) A2D1-1030-1234-김민수  (레몬에이드 2, 쿠키 1, 10:30 픽업)
   *     픽업시간이 0000 이면 예약이 아닌 '현장 주문'입니다.
   * 사람이 읽고 손으로도 입력할 수 있게 일부러 단순하게 만들었습니다.
   */
  function encodePreorder({ cart, time, phone, name }) {
    const items = Object.entries(cart)
      .filter(([, q]) => q > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([c, q]) => c + q)
      .join("");
    return [items, time ? time.replace(":", "") : "0000", phone, name.replace(/[\s-]+/g, "")].join("-");
  }

  function decodePreorder(text) {
    const m = String(text).toUpperCase().match(/((?:[A-Z]\d{1,2})+)-(\d{4})-(\d{4})-([^\s-]+)/);
    if (!m) return null;
    const cart = {};
    for (const [, c, q] of m[1].matchAll(/([A-Z])(\d{1,2})/g)) {
      if (!byCode(c)) return null;
      cart[c] = (cart[c] || 0) + Number(q);
    }
    // 이름은 대문자로 바뀌기 전 원문에서 다시 꺼냅니다
    const name = String(text).match(/-\d{4}-\d{4}-([^\s-]+)/)[1];
    return { cart, time: m[2].slice(0, 2) + ":" + m[2].slice(2), phone: m[3], name, code: m[0].replace(/-[^-]+$/, "-" + name) };
  }

  window.ShopUtil = { won, byCode, cartTotal, cartText, encodePreorder, decodePreorder };
})();
