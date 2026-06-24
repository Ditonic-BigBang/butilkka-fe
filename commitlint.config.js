// 커밋 메시지 컨벤션: "[type] 설명"
// 예) [feat] 온보딩 3필드 입력 폼 구현
//
// 규칙(자동 검사):
//   - 헤더는 반드시 "[type] 설명" 형식
//   - type 은 아래 7종 중 하나
//   - 설명(subject)은 비어 있으면 안 됨
// 규칙(사람이 지키는 권장사항 — 자동 검사 X):
//   - 설명은 한글, 명령형("추가"/"수정")
//   - 한 커밋 = 한 가지 일
export default {
  // 헤더를 "[type] subject" 형식으로 파싱한다.
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(\w+)\]\s(.+)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    // type 은 아래 7종 중 하나여야 한다.
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'test', 'refactor', 'style', 'chore']],
    'type-empty': [2, 'never'], // 대괄호 type 이 없으면 거부
    'subject-empty': [2, 'never'], // 설명이 없으면 거부
    'header-max-length': [2, 'always', 72], // 헤더 최대 72자
  },
}
