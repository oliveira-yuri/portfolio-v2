import type { ReactNode } from 'react'

export function Section({
  id,
  title,
  children,
}: {
  id: string
  title?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="reveal border-t border-[var(--color-border)] py-14">
      {title ? (
        <h2 className="u-mono mb-8 text-[11px] text-[var(--color-dim)]">{title}</h2>
      ) : null}
      {children}
    </section>
  )
}
