<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { getPost } from '../data/notes.js'

const md = new MarkdownIt({ html: false, linkify: true, breaks: false })

const route = useRoute()
const post = computed(() => getPost(route.params.slug))
const renderedHtml = computed(() => (post.value ? md.render(post.value.content) : ''))

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <article v-if="post" class="post">
    <RouterLink to="/notes" class="back-link">&larr; All notes</RouterLink>

    <header class="post-header">
      <p class="post-date">{{ formatDate(post.date) }}</p>
      <h1>{{ post.title }}</h1>
    </header>

    <div class="post-refs" v-if="post.noteUrl || post.commitUrl">
      <a v-if="post.noteUrl" :href="post.noteUrl" target="_blank" rel="noopener" class="ref-link">
        📝 Full notes
      </a>
      <a v-if="post.commitUrl" :href="post.commitUrl" target="_blank" rel="noopener" class="ref-link">
        🔗 Referenced commit
      </a>
    </div>

    <div class="post-body" v-html="renderedHtml"></div>
  </article>

  <div v-else class="not-found">
    <p>Couldn't find that post.</p>
    <RouterLink to="/notes" class="back-link">&larr; All notes</RouterLink>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  font-size: 13px;
  color: var(--muted);
  text-decoration: none;
  margin-bottom: 24px;
}

.back-link:hover {
  color: var(--accent);
}

.post-header {
  margin-bottom: 12px;
}

.post-date {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--muted);
}

.post-header h1 {
  font-size: clamp(24px, 4vw, 32px);
  margin: 0;
  line-height: 1.25;
}

.post-refs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 20px 0 32px;
}

.ref-link {
  font-size: 13px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  text-decoration: none;
  color: var(--text);
  background: var(--card-bg);
  transition: border-color 0.15s ease;
}

.ref-link:hover {
  border-color: var(--accent);
}

.post-body {
  color: var(--text);
  max-width: 65ch;
  line-height: 1.7;
}

.post-body :deep(p) {
  margin: 0 0 16px;
}

.post-body :deep(a) {
  color: var(--accent);
}

.post-body :deep(code) {
  background: var(--board-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.not-found {
  color: var(--muted);
}
</style>
