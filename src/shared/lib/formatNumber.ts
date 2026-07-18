// Intl.NumberFormat 은 생성 비용이 커서 모듈 레벨 싱글턴으로 재사용한다.
// 옵션 붙은 toLocaleString 은 호출마다 포맷터를 새로 만드는 것과 비슷한 비용 — 루프 안에서 쓰지 말 것.
const krNumber = new Intl.NumberFormat('ko-KR')
const krDecimal = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })

/** 천 단위 구분 기본 포맷 (예: 12345 → "12,345") */
export const formatNumber = (value: number) => krNumber.format(value)

/** 천 단위 구분 + 소수 둘째 자리까지, 뒤 0 없이 (예: 9299.3131 → "9,299.31", 18 → "18") */
export const formatDecimal = (value: number) => krDecimal.format(value)
