import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MapPage from './pages/MapPage'

function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold tracking-tight">butilkka-fe</h1>
      <p className="text-gray-500">Vite + React + TypeScript + Tailwind CSS v4</p>
      <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700">
        Tailwind is working ✅
      </button>
    </div>
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
