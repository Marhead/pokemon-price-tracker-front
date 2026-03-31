import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLanguageGate } from './hooks/useLanguageGate'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { Router } from './Router'

const queryClient = new QueryClient()

export default function App() {
  const isKorean = useLanguageGate()
  return (
    <QueryClientProvider client={queryClient}>
      {isKorean ? <Router /> : <ComingSoonPage />}
    </QueryClientProvider>
  )
}
