import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'

export function Mdx({ source }: { source: string }) {
  return (
    <div className="u-prose mdx text-[var(--color-muted)]">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [rehypePrettyCode, { theme: 'github-dark-default', keepBackground: false }],
            ],
          },
        }}
      />
    </div>
  )
}
