import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="text-6xl mb-4">⚡</div>
          <CardTitle className="text-2xl font-bold">포켓몬 카드 시세 트래커</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-foreground font-medium">서비스 준비 중입니다.</p>
          <p className="text-sm text-muted-foreground">
            This service is currently only available in Korean.
            <br />
            Coming soon to other regions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
