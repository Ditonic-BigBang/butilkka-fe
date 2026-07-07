import { createTV } from 'tailwind-variants'
import { tailwindMergeConfig } from './cn'

export type { VariantProps } from 'tailwind-variants'

export const tv = createTV({
  twMergeConfig: tailwindMergeConfig,
})
