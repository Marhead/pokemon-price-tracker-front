import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-bold text-lg">포켓몬 카드 시세</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              홈
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
