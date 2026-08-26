<script setup lang="ts">
import type { MediaItem } from '~/composables/useBooks'

/**
 * MediaGallery - video-first product gallery with a swipeable lightbox.
 *
 * Main view: shows the active media item - a real <video> element (with
 * preload="metadata" + #t=0.1 so the browser renders the video's own first
 * frame as the thumbnail, not a separate image) or an image - inside the
 * same rounded-3xl container as before. Dot indicators ("islands") below
 * let the user switch items.
 *
 * Lightbox: fullscreen overlay, swipe on mobile, arrows + keyboard on
 * desktop, dot indicators, position counter. The lightbox itself is v-if
 * (zero cost when closed).
 *
 * Performance:
 * - Video uses preload="metadata" (first frame only, no full download).
 * - Images use NuxtImg (webp, sized).
 * - Lightbox renders nothing until opened (v-if, not v-show).
 * - No external library - vanilla touch handlers.
 */
const props = withDefaults(defineProps<{
  media: MediaItem[]
  badge?: string
  accent?: string
}>(), {
  badge: undefined,
  accent: 'mint',
})

// ── Gallery state ──
const activeIndex = ref(0)
const active = computed(() => props.media[activeIndex.value]!)
const isVideo = computed(() => active.value?.type === 'video')

// ── Lightbox state ──
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const lightboxActive = computed(() => props.media[lightboxIndex.value]!)
const lightboxEl = ref<HTMLElement>()

function openLightbox() {
  lightboxIndex.value = activeIndex.value
  lightboxOpen.value = true
}
function closeLightbox() {
  lightboxOpen.value = false
}
function next() {
  lightboxIndex.value = (lightboxIndex.value + 1) % props.media.length
}
function prev() {
  lightboxIndex.value = (lightboxIndex.value - 1 + props.media.length) % props.media.length
}

// ── Keyboard navigation ──
function onKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})

// Lock body scroll + focus the dialog when open
watch(lightboxOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) nextTick(() => lightboxEl.value?.focus())
})

// ── Swipe / drag (touch + mouse) ──
const dragDelta = ref(0)
let pointerStartX = 0
let isPointerDown = false
let maxDrag = 0

function pointerDown(clientX: number, target: EventTarget | null) {
  // Don't swipe when interacting with the video controls
  if ((target as HTMLElement)?.closest('video')) return
  pointerStartX = clientX
  isPointerDown = true
  maxDrag = 0
}
function pointerMove(clientX: number) {
  if (!isPointerDown) return
  dragDelta.value = clientX - pointerStartX
  maxDrag = Math.max(maxDrag, Math.abs(dragDelta.value))
}
function pointerUp() {
  if (Math.abs(dragDelta.value) > 50) {
    if (dragDelta.value < 0) next()
    else prev()
  }
  dragDelta.value = 0
  isPointerDown = false
  pointerStartX = 0
}
// Track last touch so we can ignore the synthetic mouse events
// browsers fire after a touch sequence (mousedown → mouseup → click).
let lastTouchTime = 0
// Touch wrappers
function onTouchStart(e: TouchEvent) {
  lastTouchTime = Date.now()
  pointerDown(e.touches[0]?.clientX ?? 0, e.target)
}
function onTouchMove(e: TouchEvent) { pointerMove(e.touches[0]?.clientX ?? 0) }
function onTouchEnd() { pointerUp() }
// Mouse wrappers — skip synthetic events fired after a touch
function onMouseDown(e: MouseEvent) {
  if (Date.now() - lastTouchTime < 500) return
  pointerDown(e.clientX, e.target)
}
function onMouseMove(e: MouseEvent) {
  if (Date.now() - lastTouchTime < 500) return
  pointerMove(e.clientX)
}
function onMouseUp() {
  if (Date.now() - lastTouchTime < 500) return
  pointerUp()
}
// Close on backdrop click (mouse only — touch has its own close button)
function onBackdropClick() {
  if (Date.now() - lastTouchTime < 500) return
  if (maxDrag < 10) closeLightbox()
}

// ── Accent dot colors ──
const accentDot: Record<string, { active: string, idle: string }> = {
  mint: { active: 'bg-mint', idle: 'bg-mint/25' },
  purple: { active: 'bg-purple', idle: 'bg-purple/25' },
  coral: { active: 'bg-coral', idle: 'bg-coral/25' },
}
const dot = computed(() => accentDot[props.accent] ?? accentDot.mint!)
</script>

<template>
  <div v-if="media.length" class="space-y-3">
    <!-- ── Main gallery display ── -->
    <button
      type="button"
      class="group relative block w-full overflow-hidden rounded-3xl shadow-lg"
      :aria-label="isVideo ? 'Otvori video pregled' : 'Otvori sliku'"
      @click="openLightbox"
    >
      <!-- Video: real <video> element so the browser shows the video's own
           first frame as the thumbnail (preload="metadata" + #t=0.1). -->
      <template v-if="isVideo">
        <video
          :src="`${active.src}#t=0.1`"
          :alt="active.alt"
          preload="metadata"
          muted
          playsinline
          class="aspect-[4/5] w-full object-cover"
        />
        <div class="absolute inset-0 flex items-center justify-center bg-navy/5 transition-colors group-hover:bg-navy/15">
          <span class="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
            <Icon name="lucide:play" class="size-7 translate-x-0.5 text-navy" />
          </span>
        </div>
      </template>

      <!-- Image -->
      <NuxtImg
        v-else
        :src="active.src"
        :alt="active.alt ?? ''"
        class="aspect-[4/5] w-full object-cover"
        width="400"
        height="500"
        format="webp"
        loading="eager"
      />

      <!-- Badge -->
      <span
        v-if="badge"
        class="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-navy shadow-sm"
      >
        {{ badge }}
      </span>

      <!-- Expand hint -->
      <span class="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/80 text-navy opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        <Icon name="lucide:maximize-2" class="size-4" />
      </span>
    </button>

    <!-- ── Dot indicators ("islands") ── -->
    <div v-if="media.length > 1" class="flex items-center justify-center gap-2">
      <button
        v-for="(item, i) in media"
        :key="i"
        type="button"
        class="h-2.5 rounded-full transition-all duration-200"
        :class="i === activeIndex ? `w-8 ${dot.active}` : `w-2.5 ${dot.idle}`"
        :aria-label="`Prikaži ${i + 1}. od ${media.length}`"
        :aria-current="i === activeIndex ? 'true' : undefined"
        @click="activeIndex = i"
      />
    </div>

    <!-- ── Lightbox ── -->
    <ClientOnly>
      <Teleport to="body">
        <Transition name="lb">
          <div
            v-if="lightboxOpen"
            ref="lightboxEl"
            tabindex="-1"
            class="fixed inset-0 z-[100] flex flex-col bg-navy/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Galerija proizvoda"
          >
            <!-- Top bar: counter + close -->
            <div class="flex items-center justify-between px-4 py-4 text-white/80">
              <span class="font-unbounded text-sm font-semibold">
                {{ lightboxIndex + 1 }} / {{ media.length }}
              </span>
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Zatvori galeriju"
                @click="closeLightbox"
              >
                <Icon name="lucide:x" class="size-5" />
              </button>
            </div>

            <!-- Media content (swipe/drag zone) -->
            <div
              class="flex flex-1 items-center justify-center overflow-hidden px-4"
              @touchstart.passive="onTouchStart"
              @touchmove.passive="onTouchMove"
              @touchend="onTouchEnd"
              @mousedown="onMouseDown"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
              @mouseleave="onMouseUp"
              @click="onBackdropClick"
            >
              <div
                class="transition-transform duration-150 ease-out select-none"
                :style="dragDelta ? { transform: `translateX(${dragDelta}px)` } : undefined"
              >
                <!-- Video - only mounts when this slide is active -->
                <video
                  v-if="lightboxActive.type === 'video'"
                  :key="lightboxIndex"
                  :src="`${lightboxActive.src}#t=0.1`"
                  controls
                  playsinline
                  preload="metadata"
                  class="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
                />
                <!-- Image -->
                <NuxtImg
                  v-else
                  :key="lightboxIndex"
                  :src="lightboxActive.src"
                  :alt="lightboxActive.alt ?? ''"
                  class="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
                  format="webp"
                />
              </div>
            </div>

            <!-- Desktop arrows (hidden on touch screens) -->
            <template v-if="media.length > 1">
              <button
                type="button"
                class="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:flex md:left-4"
                aria-label="Prethodno"
                @click.stop="prev"
              >
                <Icon name="lucide:chevron-left" class="size-6" />
              </button>
              <button
                type="button"
                class="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:flex md:right-4"
                aria-label="Sledeće"
                @click.stop="next"
              >
                <Icon name="lucide:chevron-right" class="size-6" />
              </button>
            </template>

            <!-- Dot indicators -->
            <div v-if="media.length > 1" class="flex items-center justify-center gap-2 pb-6 pt-2">
              <button
                v-for="(item, i) in media"
                :key="i"
                type="button"
                class="h-2.5 rounded-full transition-all duration-200"
                :class="i === lightboxIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/25'"
                :aria-label="`Prikaži ${i + 1}. od ${media.length}`"
                :aria-current="i === lightboxIndex ? 'true' : undefined"
                @click="lightboxIndex = i"
              />
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.2s ease;
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .lb-enter-active,
  .lb-leave-active {
    transition: none;
  }
}
</style>
