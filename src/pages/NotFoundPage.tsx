import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-6xl">🔍</div>
      <h1 className="text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground">요청하신 페이지가 존재하지 않습니다.</p>
      <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
    </div>
  )
}
