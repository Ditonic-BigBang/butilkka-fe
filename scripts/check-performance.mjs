import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url))
const ENTRY_GZIP_BUDGET = 180 * 1024
const PRECACHE_BUDGET = 500 * 1024

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`
}

function fail(message) {
  console.error(`✗ ${message}`)
  process.exitCode = 1
}

if (!existsSync(DIST_DIR)) {
  throw new Error('dist가 없습니다. pnpm build를 먼저 실행해주세요.')
}

const manifestPath = path.join(DIST_DIR, '.vite/manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const entry = Object.values(manifest).find((item) => item.isEntry)

if (!entry?.file) {
  fail('Vite manifest에서 초기 entry를 찾지 못했습니다.')
} else {
  const entryContents = readFileSync(path.join(DIST_DIR, entry.file))
  const entryGzipSize = gzipSync(entryContents).byteLength
  console.log(`초기 entry gzip: ${formatKb(entryGzipSize)} / ${formatKb(ENTRY_GZIP_BUDGET)}`)
  if (entryGzipSize > ENTRY_GZIP_BUDGET) {
    fail(`초기 entry gzip 예산을 ${formatKb(entryGzipSize - ENTRY_GZIP_BUDGET)} 초과했습니다.`)
  }
}

const manifestSources = Object.keys(manifest).join('\n')
const assetNames = readdirSync(path.join(DIST_DIR, 'assets'))
if (
  /msw|shared\/api\/mocks/i.test(manifestSources) ||
  assetNames.some((name) => /msw/i.test(name))
) {
  fail('프로덕션 manifest 또는 asset 청크에 MSW가 포함되어 있습니다.')
}
if (existsSync(path.join(DIST_DIR, 'mockServiceWorker.js'))) {
  fail('프로덕션 dist에 mockServiceWorker.js가 포함되어 있습니다.')
}

const serviceWorkerPath = path.join(DIST_DIR, 'sw.js')
if (!existsSync(serviceWorkerPath)) {
  fail('PWA service worker를 찾지 못했습니다.')
} else {
  const serviceWorker = readFileSync(serviceWorkerPath, 'utf8')
  const precacheUrls = [
    ...new Set([...serviceWorker.matchAll(/url:"([^"]+)"/g)].map((match) => match[1])),
  ]
  const precacheUrlSet = new Set(precacheUrls)
  let precacheSize = 0

  for (const url of precacheUrls) {
    const filePath = path.join(DIST_DIR, url)
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      fail(`선캐시 파일을 dist에서 찾지 못했습니다: ${url}`)
      continue
    }
    precacheSize += statSync(filePath).size
  }

  console.log(`PWA 선캐시: ${formatKb(precacheSize)} / ${formatKb(PRECACHE_BUDGET)}`)
  if (precacheSize > PRECACHE_BUDGET) {
    fail(`PWA 선캐시 예산을 ${formatKb(precacheSize - PRECACHE_BUDGET)} 초과했습니다.`)
  }
  if (precacheUrls.some((url) => /mockServiceWorker|msw/i.test(url))) {
    fail('PWA 선캐시 목록에 MSW 파일이 포함되어 있습니다.')
  }

  for (const importKey of entry?.imports ?? []) {
    const importedFile = manifest[importKey]?.file
    if (importedFile && !precacheUrlSet.has(importedFile)) {
      fail(`초기 entry의 정적 의존성이 선캐시에서 빠졌습니다: ${importedFile}`)
    }
  }
}

if (existsSync(path.join(DIST_DIR, 'seoul.geojson'))) {
  fail('1.2MB seoul.geojson이 프로덕션 산출물에 남아 있습니다.')
}

if (!process.exitCode) {
  console.log('✓ 성능 예산과 프로덕션 MSW 제외 조건을 모두 통과했습니다.')
}
