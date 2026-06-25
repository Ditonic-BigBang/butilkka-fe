import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { MobileLayout } from '@/components/layout'
import MapPage from './pages/MapPage'

// 셸(바텀탭)을 쓰는 일반 화면. 지도(/map)는 풀스크린이라 셸 밖에서 렌더.
function Home() {
  return (
    <MobileLayout>
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-gray-900">
        <h1 className="text-2xl font-bold tracking-tight">버틸까?</h1>
        <p className="text-sm text-gray-500">서울 자치구 지도</p>
        <Link
          to="/map"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
        >
          지도 보기
        </Link>
      </div>
    </MobileLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  )
}
