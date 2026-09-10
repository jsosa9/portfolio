<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps({
  images: { type: Array, required: true }, // [{ src, alt, rotate }]
})

// Dynamically pull in every image dropped into src/assets/stickers/
const stickerAssets = import.meta.glob('../assets/stickers/*', {
  eager: true,
  import: 'default',
})

function resolveSrc(src) {
  // allow either a bare filename key ("placeholder-1") or a full path/URL
  const match = Object.entries(stickerAssets).find(([path]) =>
    path.includes(`/${src}.`) || path.endsWith(src)
  )
  return match ? match[1] : src
}

const VIDEO_EXT = /\.(mp4|webm|mov)$/i

function isVideo(src) {
  // strip any query string (Vite dev server appends cache-busting ?t=... to asset URLs)
  const url = resolveSrc(src).split('?')[0]
  return VIDEO_EXT.test(url)
}

// give each sticker a starting position, plus drag state.
// real positions get laid out once we know the board's actual width (see onMounted).
const stickers = reactive(props.images.map((img, i) => ({ ...img, id: i, x: 0, y: 0, z: 0 })))

let topZ = stickers.length
const boardRef = ref(null)
const boardHeight = ref(320)
let dragging = null // { sticker, offsetX, offsetY }

// sticker footprint scales down on narrow screens so more columns fit —
// keeps photos whole (never cropped), just smaller, which shrinks the
// board's total height instead of piling everything into 2 tall columns.
const MOBILE_BREAKPOINT = 480
const STICKER_SPAN_DESKTOP = 170
const STICKER_SPAN_MOBILE = 108

function getStickerSpan(boardWidth) {
  return boardWidth < MOBILE_BREAKPOINT ? STICKER_SPAN_MOBILE : STICKER_SPAN_DESKTOP
}

function layoutStickers() {
  const width = boardRef.value?.getBoundingClientRect().width || 680
  const span = getStickerSpan(width)
  const cols = Math.max(2, Math.floor(width / span))
  const colWidth = width / cols
  const rows = Math.ceil(stickers.length / cols)

  stickers.forEach((sticker, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    sticker.x = col * colWidth + 10 + ((i * 13) % 30)
    sticker.y = row * span + 10 + ((i * 7) % 30)
    sticker.z = i
  })

  boardHeight.value = rows * span + 40
}

let resizeTimeout = null
function onResize() {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(layoutStickers, 150)
}

onMounted(() => {
  layoutStickers()
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)
  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    clearTimeout(resizeTimeout)
  })

  // only decode/play video stickers while they're actually on screen —
  // an off-screen looping video still costs CPU every frame otherwise
  const videos = boardRef.value?.querySelectorAll('video')
  if (videos?.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.play()
          else entry.target.pause()
        }
      },
      { threshold: 0.1 }
    )
    videos.forEach((v) => observer.observe(v))
  }
})

function startDrag(sticker, event) {
  event.preventDefault()
  const point = event.touches ? event.touches[0] : event
  const boardRect = boardRef.value.getBoundingClientRect()
  dragging = {
    sticker,
    offsetX: point.clientX - boardRect.left - sticker.x,
    offsetY: point.clientY - boardRect.top - sticker.y,
  }
  topZ += 1
  sticker.z = topZ
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('touchend', stopDrag)
}

function onDrag(event) {
  if (!dragging) return
  event.preventDefault()
  const point = event.touches ? event.touches[0] : event
  const boardRect = boardRef.value.getBoundingClientRect()
  // no bounds — stickers can be dragged anywhere, including outside their starting area
  dragging.sticker.x = point.clientX - boardRect.left - dragging.offsetX
  dragging.sticker.y = point.clientY - boardRect.top - dragging.offsetY
}

function stopDrag() {
  dragging = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}
</script>

<template>
  <div ref="boardRef" class="sticker-board" :style="{ minHeight: boardHeight + 'px' }">
    <div
      v-for="sticker in stickers"
      :key="sticker.id"
      class="sticker"
      :style="{
        transform: `translate(${sticker.x}px, ${sticker.y}px) rotate(${sticker.rotate || 0}deg)`,
        zIndex: sticker.z,
      }"
      @mousedown="startDrag(sticker, $event)"
      @touchstart="startDrag(sticker, $event)"
    >
      <video
        v-if="isVideo(sticker.src)"
        :src="resolveSrc(sticker.src)"
        preload="metadata"
        muted
        loop
        playsinline
        disablepictureinpicture
      />
      <img
        v-else
        :src="resolveSrc(sticker.src)"
        :alt="sticker.alt"
        draggable="false"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
</template>

<style scoped>
.sticker-board {
  position: relative;
  width: 100%;
  overflow: visible;
  touch-action: none;
}

.sticker {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  padding: 6px;
  background: var(--sticker-bg);
  border-radius: 6px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.15s ease;
}

.sticker:active {
  cursor: grabbing;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.35);
}

.sticker img,
.sticker video {
  display: block;
  width: auto;
  height: auto;
  max-width: 150px;
  max-height: 150px;
  border-radius: 3px;
  pointer-events: none;
}

@media (max-width: 480px) {
  .sticker img,
  .sticker video {
    max-width: 92px;
    max-height: 92px;
  }
}
</style>
