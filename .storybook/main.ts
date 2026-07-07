import type { StorybookConfig } from '@storybook/react-vite'
import type { PluginOption } from 'vite'

// vite-plugin-pwa 는 앱 전용 — Storybook 빌드에 서비스워커/매니페스트가 새어 들어가지 않게 제거.
const isPwaPlugin = (p: unknown): boolean =>
  !!p &&
  typeof p === 'object' &&
  'name' in p &&
  String((p as { name?: unknown }).name).startsWith('vite-plugin-pwa')

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  viteFinal: (viteConfig) => {
    const flat = ((viteConfig.plugins ?? []) as unknown[]).flat(Infinity) as unknown[]
    viteConfig.plugins = flat.filter((p) => !isPwaPlugin(p)) as PluginOption[]
    return viteConfig
  },
}
export default config
