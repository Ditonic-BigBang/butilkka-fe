import { cn } from '@/shared/lib/cn'

type EmptyStateProps = {
  message: string
  className?: string
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <p
      className={cn(
        'flex items-center justify-center py-20 text-body-l-medium text-gray-400',
        className,
      )}
    >
      {message}
    </p>
  )
}
