import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmPopup } from './ConfirmPopup'

describe('ConfirmPopup', () => {
  it('열리면 본문과 취소/확인 버튼을 보여준다', () => {
    render(
      <ConfirmPopup open onCancel={() => {}} onConfirm={() => {}}>
        서울 종로구를 삭제하시겠습니까?
      </ConfirmPopup>,
    )

    expect(screen.getByRole('alertdialog')).toHaveTextContent('서울 종로구를 삭제하시겠습니까?')
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
  })

  it('닫혀 있으면 렌더하지 않는다', () => {
    render(
      <ConfirmPopup open={false} onCancel={() => {}} onConfirm={() => {}}>
        내용
      </ConfirmPopup>,
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('확인/취소/딤 클릭이 각 콜백을 호출한다', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <ConfirmPopup open onCancel={onCancel} onConfirm={onConfirm}>
        내용
      </ConfirmPopup>,
    )

    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: '취소' }))
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(onCancel).toHaveBeenCalledTimes(2)
  })
})
