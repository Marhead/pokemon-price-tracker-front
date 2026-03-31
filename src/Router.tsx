import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainPage } from './pages/MainPage'
import { CardDetailPage } from './pages/CardDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
