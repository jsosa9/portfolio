<script setup>
import { onMounted, ref } from 'vue'

const theme = ref('light')

function apply(t) {
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
  theme.value = t
}

function toggle() {
  apply(theme.value === 'light' ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  apply(saved || (prefersDark ? 'dark' : 'light'))
})
</script>

<template>
  <button class="theme-toggle" @click="toggle" :aria-label="'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' mode'">
    <svg v-if="theme === 'light'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  border-radius: 999px;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: transform 0.15s ease, background 0.15s ease;
}

.theme-toggle:hover {
  background: var(--card-bg);
  transform: scale(1.05);
}
</style>
