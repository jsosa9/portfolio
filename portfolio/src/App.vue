<script setup>
import ThemeToggle from './components/ThemeToggle.vue'
import { profile } from './data/content.js'
import { useSmoothScroll } from './composables/useSmoothScroll.js'

useSmoothScroll()

const fade = (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 400, delay } })
</script>

<template>
  <div class="page">
    <header
      class="header"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="fade(0)"
    >
      <div class="name-group">
        <span class="js-badge" aria-hidden="true">JS</span>
        <h1 class="name">{{ profile.name }}</h1>
      </div>
      <div class="header-right">
        <nav class="nav">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          <RouterLink to="/notes" class="nav-link">Notes</RouterLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 20px 80px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav-link {
  font-size: 14px;
  text-decoration: none;
  color: var(--muted);
  border-bottom: 1px solid transparent;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  color: var(--text);
  border-bottom-color: var(--accent);
}

.name-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.name {
  font-size: clamp(28px, 5vw, 40px);
  margin: 0;
}

.js-badge {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  width: clamp(32px, 6vw, 40px);
  height: clamp(32px, 6vw, 40px);
  padding: 3px 5px;
  background: #f7df1e;
  color: #1a1a1a;
  font-family: Helvetica, Arial, sans-serif;
  font-weight: 700;
  font-size: clamp(12px, 2.2vw, 15px);
  line-height: 1;
  border-radius: 4px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}
</style>

<style>
.footer {
  margin-top: 60px;
  text-align: center;
  font-size: 13px;
  color: var(--muted);
}
</style>
