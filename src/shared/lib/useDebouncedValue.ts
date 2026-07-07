import { useEffect, useState } from 'react'

/**
 * 값이 잠잠해진 뒤(delay ms)에만 반영되는 debounced 값.
 * 검색어 등 고빈도로 바뀌는 입력을 API 호출 키로 쓸 때 사용.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
