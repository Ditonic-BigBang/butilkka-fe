import { Rectangle, Sector } from 'recharts'
import type { BarShapeProps, PieSectorShapeProps } from 'recharts'

/**
 * Recharts 3 의 `shape` prop 용 커스텀 도형.
 *
 * deprecated 된 <Cell> 대신 데이터별 색상을 입히는 권장 방식.
 * Rectangle/Sector 가 내부에서 svg 속성만 필터링하므로 payload 등 비-SVG prop 을
 * 그대로 spread 해도 DOM 경고가 나지 않는다.
 * 각 데이터 항목의 `color` 필드를 색으로 사용한다.
 * @see https://recharts.github.io/en-US/guide/cell/
 */
type ColorPayload = { color?: string }

// 막대: 위쪽만 둥근 모서리 + 데이터별 색상
export function ColoredBar(props: BarShapeProps) {
  const color = (props.payload as ColorPayload | undefined)?.color
  return <Rectangle {...props} radius={[6, 6, 0, 0]} fill={color} />
}

// 도넛 조각: 데이터별 색상
export function ColoredSlice(props: PieSectorShapeProps) {
  const color = (props.payload as ColorPayload | undefined)?.color
  return <Sector {...props} fill={color} stroke="none" />
}
