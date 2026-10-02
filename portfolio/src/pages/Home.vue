<script setup>
import StickerBoard from '../components/StickerBoard.vue'
import { profile, projects, experience, hackathons } from '../data/content.js'

// small helper so entrance transitions stay consistent everywhere
const fade = (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 400, delay } })

// TODO: swap this for the real production URL once ide-portfolio is deployed
// (Vercel, custom domain, etc). Falls back to the local dev server so this
// link is actually testable right now.
const IDE_VERSION_URL = import.meta.env.DEV
  ? 'http://localhost:5176/ide-portfolio/'
  : 'https://TODO-set-real-ide-portfolio-url.vercel.app'
</script>

<template>
  <section class="section about">
    <p class="tagline" v-motion :initial="{ opacity: 0, y: 10 }" :enter="fade(100)">
      {{ profile.tagline }}
    </p>
    <p class="about-text" v-motion :initial="{ opacity: 0, y: 10 }" :enter="fade(200)">
      {{ profile.about }}
    </p>
    <div class="links" v-motion :initial="{ opacity: 0, y: 10 }" :enter="fade(300)">
      <a :href="'mailto:' + profile.links.email">Email</a>
      <a :href="profile.links.linkedin" target="_blank" rel="noopener">LinkedIn</a>
      <a :href="profile.links.github" target="_blank" rel="noopener">GitHub</a>
    </div>
    <a
      :href="IDE_VERSION_URL"
      class="ide-version-btn"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="fade(380)"
    >
      Try the VS Code version →
    </a>
  </section>

  <section class="section">
    <h2 v-motion :initial="{ opacity: 0, y: 14 }" :visible-once="fade(0)">Projects</h2>
    <div class="projects-grid">
      <div
        v-for="(p, i) in projects"
        :key="p.name"
        class="project-card"
        v-motion
        :initial="{ opacity: 0, y: 14 }"
        :visible-once="fade(i * 80)"
      >
        <h3>{{ p.name }}</h3>
        <p>{{ p.description }}</p>
        <div class="tags">
          <span v-for="t in p.tech" :key="t" class="tag">{{ t }}</span>
        </div>
        <div class="project-links">
          <a v-if="p.links.github" :href="p.links.github" target="_blank" rel="noopener">GitHub ↗</a>
          <RouterLink v-for="note in p.notes || []" :key="note.url" :to="note.url">{{ note.title }} →</RouterLink>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <h2 v-motion :initial="{ opacity: 0, y: 14 }" :visible-once="fade(0)">Experience</h2>
    <div class="experience-list">
      <div
        v-for="(job, i) in experience"
        :key="job.company"
        class="experience-item"
        v-motion
        :initial="{ opacity: 0, y: 14 }"
        :visible-once="fade(i * 80)"
      >
        <div class="experience-header">
          <div>
            <h3>{{ job.role }} · {{ job.company }}</h3>
            <p class="period">{{ job.period }}</p>
          </div>
        </div>
        <p class="experience-desc">{{ job.description }}</p>
        <StickerBoard :images="job.images" />
      </div>
    </div>
  </section>

  <section class="section">
    <h2 v-motion :initial="{ opacity: 0, y: 14 }" :visible-once="fade(0)">Hackathons</h2>
    <div class="experience-list">
      <div
        v-for="(hack, i) in hackathons"
        :key="hack.name"
        class="experience-item"
        v-motion
        :initial="{ opacity: 0, y: 14 }"
        :visible-once="fade(i * 80)"
      >
        <div class="experience-header">
          <div>
            <h3>{{ hack.name }}</h3>
            <p class="period">{{ hack.period }}</p>
          </div>
        </div>
        <p class="experience-desc">{{ hack.description }}</p>
        <StickerBoard :images="hack.images" />
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>drag the stickers around — nothing saves, it's just for fun.</p>
  </footer>
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

.tagline {
  font-size: 18px;
  margin: 0 0 8px;
}

.about-text {
  color: var(--muted);
  max-width: 56ch;
  line-height: 1.6;
}

.links {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.links a {
  font-size: 14px;
  text-decoration: none;
  color: var(--accent);
  border-bottom: 1px solid transparent;
}

.links a:hover {
  border-bottom-color: var(--accent);
}

.ide-version-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: var(--text);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.ide-version-btn:hover {
  transform: translateY(-1px);
  border-color: var(--accent);
  color: var(--accent);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.project-card {
  display: block;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-bg);
  transition: border-color 0.15s ease;
}

.project-card:hover {
  border-color: var(--accent);
}

.project-card h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.project-card p {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--muted);
}

.project-links {
  display: flex;
  gap: 14px;
  margin-top: 12px;
}

.project-links a {
  font-size: 13px;
  text-decoration: none;
  color: var(--accent);
  border-bottom: 1px solid transparent;
}

.project-links a:hover {
  border-bottom-color: var(--accent);
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--board-bg);
  color: var(--muted);
}

.experience-item {
  margin-bottom: 40px;
  padding-bottom: 8px;
}

.experience-item h3 {
  margin: 0;
  font-size: 17px;
}

.period {
  margin: 2px 0 10px;
  font-size: 13px;
  color: var(--muted);
}

.experience-desc {
  margin: 0 0 14px;
  color: var(--muted);
  max-width: 60ch;
  line-height: 1.5;
}
</style>
