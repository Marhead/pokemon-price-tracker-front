export function Footer() {
  return (
    <footer className="border-t mt-auto py-6 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          포켓몬 카드 시세 트래커 &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
