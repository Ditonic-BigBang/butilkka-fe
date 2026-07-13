import { cn } from '@/shared/lib/cn'

type ErrorRetryProps = {
  message: string
  onRetry: () => void
  className?: string
}

export function ErrorRetry({ message, onRetry, className }: ErrorRetryProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-20 text-center', className)}>
      <p className="text-body-l-medium text-gray-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-max bg-gray-900 px-4 py-2 text-body-m-medium text-white active:bg-gray-800"
      >
        다시 시도
      </button>
    </div>
  )
}
