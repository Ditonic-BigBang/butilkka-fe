import { MobileLayout } from '@/components/layout'

function App() {
  return (
    <MobileLayout>
      <div className="flex flex-col items-center gap-4 bg-amber-300 px-6 py-10 text-gray-900">
        <h1 className="text-2xl font-bold tracking-tight">버틸까?</h1>
        <p className="text-sm text-gray-500">모바일 공통 레이아웃 </p>
      </div>
    </MobileLayout>
  )
}

export default App
