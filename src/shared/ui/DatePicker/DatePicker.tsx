import { useState } from 'react'
import { Calendar } from '../Calendar/Calendar'
import { TextField } from '../TextField/TextField'

// YYYY.MM.DD (Figma Date_Selected 표기)
const format = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

type DatePickerProps = {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
  caption?: string
  /** 필드 외형 — filled(gray-70, 온보딩) · outlined(흰+테두리, 마이페이지) */
  appearance?: 'filled' | 'outlined'
  /** 시트 접근성 라벨 (화면에는 안 보임) */
  title?: string
  className?: string
}

/**
 * 날짜 선택 필드 (TextField date 변형 + 바텀시트 캘린더).
 * 필드 탭 → 하단에서 캘린더 시트가 올라오고, 날짜 탭 → 값 채우고 닫힘.
 * 헤더 없이 캘린더만 — 시트 위(백드롭)를 탭하면 닫힌다. 값은 Date, 표시는 `YYYY.MM.DD`.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = '날짜를 선택해주세요',
  caption,
  appearance,
  title = '날짜 선택',
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TextField
        variant="date"
        appearance={appearance}
        value={value ? format(value) : ''}
        placeholder={placeholder}
        caption={caption}
        onPick={() => setOpen(true)}
        className={className}
      />
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <dialog
            open
            aria-label={title}
            className="relative m-0 w-full rounded-t-16 border-0 bg-white px-5 pt-5 pb-safe-bottom-or-6 text-inherit shadow-upper"
          >
            <Calendar
              value={value}
              defaultMonth={value}
              onSelect={(d) => {
                onChange?.(d)
                setOpen(false)
              }}
            />
          </dialog>
        </div>
      )}
    </>
  )
}
