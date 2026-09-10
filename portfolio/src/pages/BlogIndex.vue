<script setup>
import { posts } from '../data/blog.js'

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
  <section class="section">
    <h2 v-motion :initial="{ opacity: 0, y: 14 }" :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }">
      Blog
    </h2>

    <p v-if="!posts.length" class="empty">Nothing posted yet — check back soon.</p>

    <div class="post-list">
      <RouterLink
        v-for="(post, i) in posts"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        class="post-card"
        v-motion
        :initial="{ opacity: 0, y: 14 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: i * 80 } }"
      >
        <p class="post-date">{{ formatDate(post.date) }}</p>
        <h3>{{ post.title }}</h3>
        <p class="post-excerpt">{{ post.excerpt }}</p>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.section {
  margin-bottom: 56px;
}

.section h2 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-bottom: 16px;
}

.empty {
  color: var(--muted);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  display: block;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  background: var(--card-bg);
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.post-date {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--muted);
}

.post-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.post-excerpt {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
  max-width: 60ch;
}
</style>
