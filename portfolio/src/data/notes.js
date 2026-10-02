// Notes are plain markdown files in src/notes/*.md, each with a YAML-ish
// frontmatter block up top. Drop a new .md file in there and it shows up here
// automatically — same pattern as StickerBoard's asset glob.

// Deliberately not pulling in a YAML parser for a handful of flat string
// fields — this covers `key: value` frontmatter, nothing nested.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const [, frontmatter, content] = match
  const data = {}
  for (const line of frontmatter.split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    value = value.replace(/^['"]|['"]$/g, '') // strip surrounding quotes if any
    data[key] = value
  }
  return { data, content: content.trim() }
}

function slugify(filePath) {
  return filePath.split('/').pop().replace(/\.md$/, '')
}

const rawPosts = import.meta.glob('../notes/*.md', { eager: true, query: '?raw', import: 'default' })

export const posts = Object.entries(rawPosts)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw)
    return {
      slug: slugify(path),
      title: data.title || slugify(path),
      date: data.date || '',
      noteUrl: data.noteUrl || null,
      commitUrl: data.commitUrl || null,
      excerpt: data.excerpt || '',
      content,
    }
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))

export function getPost(slug) {
  return posts.find((p) => p.slug === slug)
}
