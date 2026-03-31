export function useLanguageGate(): boolean {
  const lang = navigator.language || navigator.languages?.[0] || ''
  return lang.startsWith('ko')
}
