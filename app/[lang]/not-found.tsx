import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6">
      <p className="u-mono text-[10px] text-[var(--color-accent)]">erro 404</p>
      <h1 className="u-heading mt-3 text-3xl">Página não encontrada</h1>
      <Link
        href="/pt/"
        className="u-mono mt-8 inline-block text-[11px] text-[var(--color-accent)] hover:underline"
      >
        ← Voltar ao início
      </Link>
    </main>
  )
}
