<script setup lang="ts">
import type { AdminProductImage } from '~~/server/utils/media'
import { IMAGE_ACCEPT, MEDIA_LIMITS, VIDEO_ACCEPT, formatBytes } from '~~/shared/utils/media'

/**
 * Gallery manager for one product (admin): upload images/videos to R2,
 * edit alt text, reorder (first image = cover on the storefront), delete.
 * Uploads use XHR for a progress bar - videos can be tens of MB.
 */
const props = defineProps<{ productId: number, productTitle: string }>()
const emit = defineEmits<{ changed: [] }>()

const { errorMessage } = useAdmin()

const { data, refresh, status: loadStatus } = useAsyncData(
  () => `admin-product-images-${props.productId}`,
  () => $fetch<{ images: AdminProductImage[] }>(`/api/admin/products/${props.productId}/images`),
  { default: () => ({ images: [] }), watch: [() => props.productId] },
)
const images = computed(() => data.value?.images ?? [])
const coverId = computed(() => images.value.find(i => i.kind === 'image')?.id)
const isFull = computed(() => images.value.length >= MEDIA_LIMITS.perProduct)

const error = ref('')
const busy = ref(false)

async function changed() {
  await refresh()
  emit('changed')
}

// ── Upload (XHR for progress) ────────────────────────────────────
const progress = ref<{ label: string, percent: number } | null>(null)

function upload(form: FormData, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `/api/admin/products/${props.productId}/images`)
    xhr.responseType = 'json'
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) progress.value = { label, percent: Math.round((e.loaded / e.total) * 100) }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      // Same shape errorMessage() reads from $fetch errors
      reject({ statusCode: xhr.status, data: xhr.response })
    }
    xhr.onerror = () => reject({ data: { statusMessage: 'Mrežna greška tokom otpremanja.' } })
    progress.value = { label, percent: 0 }
    xhr.send(form)
  })
}

function checkSize(file: File, max: number): boolean {
  if (file.size <= max) return true
  error.value = `"${file.name}" je prevelik (${formatBytes(file.size)}, najviše ${formatBytes(max)}).`
  return false
}

async function onImagesPicked(e: Event) {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  if (!files.length) return
  error.value = ''

  const room = MEDIA_LIMITS.perProduct - images.value.length
  if (files.length > room) {
    error.value = `Možete dodati još ${room} fajl(ova) za ovaj proizvod.`
    return
  }
  if (!files.every(f => checkSize(f, MEDIA_LIMITS.imageBytes))) return

  busy.value = true
  try {
    for (const [i, file] of files.entries()) {
      const form = new FormData()
      form.append('file', file)
      await upload(form, files.length > 1 ? `Slika ${i + 1}/${files.length}` : 'Slika')
    }
  }
  catch (err: any) {
    error.value = errorMessage(err, 'Otpremanje nije uspelo.')
  }
  finally {
    progress.value = null
    busy.value = false
    await changed()
  }
}

// Video: file + optional poster + alt, sent together
const videoOpen = ref(false)
const videoFile = ref<File | null>(null)
const posterFile = ref<File | null>(null)
const videoAlt = ref('')

function pickFirst(e: Event): File | null {
  return (e.target as HTMLInputElement).files?.[0] ?? null
}

async function uploadVideo() {
  error.value = ''
  if (!videoFile.value) {
    error.value = 'Izaberite MP4 video.'
    return
  }
  if (!checkSize(videoFile.value, MEDIA_LIMITS.videoBytes)) return
  if (posterFile.value && !checkSize(posterFile.value, MEDIA_LIMITS.imageBytes)) return

  const form = new FormData()
  form.append('file', videoFile.value)
  if (posterFile.value) form.append('poster', posterFile.value)
  if (videoAlt.value.trim()) form.append('alt', videoAlt.value.trim())

  busy.value = true
  try {
    await upload(form, 'Video')
    videoOpen.value = false
    videoFile.value = null
    posterFile.value = null
    videoAlt.value = ''
  }
  catch (err: any) {
    error.value = errorMessage(err, 'Otpremanje videa nije uspelo.')
  }
  finally {
    progress.value = null
    busy.value = false
    await changed()
  }
}

// ── Alt text (saved on blur/enter, only when changed) ────────────
const altDrafts = reactive<Record<number, string>>({})
watch(images, (list) => {
  for (const img of list) altDrafts[img.id] = img.alt ?? ''
}, { immediate: true })

async function saveAlt(img: AdminProductImage) {
  const alt = (altDrafts[img.id] ?? '').trim()
  if (alt === (img.alt ?? '')) return
  error.value = ''
  try {
    await $fetch(`/api/admin/products/${props.productId}/images/${img.id}`, { method: 'PATCH', body: { alt } })
    await refresh()
  }
  catch (err: any) {
    error.value = errorMessage(err, 'Čuvanje opisa nije uspelo.')
  }
}

// ── Reorder / delete ─────────────────────────────────────────────
async function move(index: number, delta: -1 | 1) {
  const ids = images.value.map(i => i.id)
  const target = index + delta
  if (target < 0 || target >= ids.length) return
  ;[ids[index], ids[target]] = [ids[target]!, ids[index]!]
  error.value = ''
  busy.value = true
  try {
    await $fetch(`/api/admin/products/${props.productId}/images/order`, { method: 'PUT', body: { ids } })
    await changed()
  }
  catch (err: any) {
    error.value = errorMessage(err, 'Promena redosleda nije uspela.')
  }
  finally {
    busy.value = false
  }
}

async function remove(img: AdminProductImage) {
  if (!confirm(img.kind === 'video' ? 'Obrisati ovaj video?' : 'Obrisati ovu sliku?')) return
  error.value = ''
  busy.value = true
  try {
    await $fetch(`/api/admin/products/${props.productId}/images/${img.id}`, { method: 'DELETE' })
    await changed()
  }
  catch (err: any) {
    error.value = errorMessage(err, 'Brisanje nije uspelo.')
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm">
    <div class="mb-1 flex items-center justify-between gap-3">
      <h2 class="font-unbounded text-base font-bold text-navy">
        Slike i video
      </h2>
      <span class="text-xs text-navy/50">{{ images.length }}/{{ MEDIA_LIMITS.perProduct }}</span>
    </div>
    <p class="mb-4 text-xs text-navy/50">
      Prva slika je naslovna. Bez otpremljenih fajlova sajt prikazuje postojeće slike iz koda.
    </p>

    <!-- Gallery list -->
    <p v-if="loadStatus === 'pending' && !images.length" class="py-6 text-center text-sm text-navy/50">
      Učitavanje...
    </p>
    <p v-else-if="!images.length" class="rounded-xl border border-dashed border-cloud/60 py-6 text-center text-sm text-navy/50">
      Još nema otpremljenih fajlova.
    </p>
    <ul v-else class="space-y-2">
      <li
        v-for="(img, i) in images"
        :key="img.id"
        class="flex items-center gap-3 rounded-xl bg-cream p-2"
      >
        <div class="relative size-14 shrink-0 overflow-hidden rounded-lg bg-cloud/40">
          <NuxtImg
            v-if="img.kind === 'image' || img.posterKey"
            provider="media"
            :src="(img.kind === 'image' ? img.key : img.posterKey)!"
            :alt="img.alt ?? productTitle"
            width="56"
            height="56"
            fit="cover"
            format="webp"
            class="size-full object-cover"
          />
          <span
            v-if="img.kind === 'video'"
            class="absolute inset-0 flex items-center justify-center bg-navy/30 text-white"
          >
            <Icon name="lucide:play" class="size-5" />
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="mb-1 flex items-center gap-2 text-xs text-navy/50">
            <span
              v-if="img.id === coverId"
              class="rounded-full bg-mint/20 px-2 py-0.5 font-semibold text-mint-dark"
            >Naslovna</span>
            <span>{{ img.kind === 'video' ? 'Video' : 'Slika' }} · {{ formatBytes(img.sizeBytes) }}</span>
          </div>
          <input
            :id="`image-alt-${img.id}`"
            v-model="altDrafts[img.id]"
            :name="`image-alt-${img.id}`"
            type="text"
            :maxlength="MEDIA_LIMITS.alt"
            placeholder="Opis slike (alt)"
            :aria-label="`Opis za ${i + 1}. fajl`"
            class="w-full rounded-lg border border-cloud/50 bg-white px-2 py-1 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none"
            @blur="saveAlt(img)"
            @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
          >
        </div>

        <div class="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            :disabled="busy || i === 0"
            class="rounded-md p-1 text-navy/50 hover:bg-white hover:text-navy disabled:opacity-30"
            aria-label="Pomeri gore"
            @click="move(i, -1)"
          >
            <Icon name="lucide:chevron-up" class="size-4" />
          </button>
          <button
            type="button"
            :disabled="busy || i === images.length - 1"
            class="rounded-md p-1 text-navy/50 hover:bg-white hover:text-navy disabled:opacity-30"
            aria-label="Pomeri dole"
            @click="move(i, 1)"
          >
            <Icon name="lucide:chevron-down" class="size-4" />
          </button>
        </div>
        <button
          type="button"
          :disabled="busy"
          class="shrink-0 rounded-md p-1.5 text-navy/50 hover:bg-white hover:text-coral disabled:opacity-30"
          aria-label="Obriši"
          @click="remove(img)"
        >
          <Icon name="lucide:trash-2" class="size-4" />
        </button>
      </li>
    </ul>

    <!-- Progress -->
    <div v-if="progress" class="mt-4" role="status">
      <div class="mb-1 flex justify-between text-xs text-navy/60">
        <span>Otpremanje: {{ progress.label }}</span>
        <span>{{ progress.percent }}%</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-cloud/40">
        <div class="h-full rounded-full bg-blue transition-all" :style="{ width: `${progress.percent}%` }" />
      </div>
    </div>

    <p v-if="error" class="mt-3 text-sm text-coral" role="alert">
      {{ error }}
    </p>

    <!-- Actions -->
    <div v-if="!isFull" class="mt-4 flex flex-wrap gap-2">
      <label
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue"
        :class="busy && 'pointer-events-none opacity-50'"
      >
        <Icon name="lucide:image-plus" class="size-4" />
        Dodaj slike
        <input
          id="product-images-input"
          name="product-images-input"
          type="file"
          :accept="IMAGE_ACCEPT"
          multiple
          class="sr-only"
          :disabled="busy"
          @change="onImagesPicked"
        >
      </label>
      <button
        type="button"
        :disabled="busy"
        class="inline-flex items-center gap-1.5 rounded-full border-2 border-cloud/50 px-4 py-2 text-sm font-semibold text-navy/70 transition-colors hover:border-navy/40 disabled:opacity-50"
        @click="videoOpen = !videoOpen"
      >
        <Icon name="lucide:video" class="size-4" />
        Dodaj video
      </button>
    </div>
    <p class="mt-2 text-xs text-navy/50">
      JPG, PNG ili WebP do {{ formatBytes(MEDIA_LIMITS.imageBytes) }} · MP4 do {{ formatBytes(MEDIA_LIMITS.videoBytes) }}
    </p>

    <!-- Video form -->
    <div v-if="videoOpen && !isFull" class="mt-4 space-y-3 rounded-xl bg-cream p-4">
      <div>
        <label for="product-video-file" class="mb-1 block text-sm font-semibold text-navy">Video (MP4)</label>
        <input
          id="product-video-file"
          name="product-video-file"
          type="file"
          :accept="VIDEO_ACCEPT"
          :disabled="busy"
          class="block w-full text-sm text-navy/70 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy"
          @change="videoFile = pickFirst($event)"
        >
      </div>
      <div>
        <label for="product-video-poster" class="mb-1 block text-sm font-semibold text-navy">
          Naslovna slika videa <span class="font-normal text-navy/50">(opciono)</span>
        </label>
        <input
          id="product-video-poster"
          name="product-video-poster"
          type="file"
          :accept="IMAGE_ACCEPT"
          :disabled="busy"
          class="block w-full text-sm text-navy/70 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy"
          @change="posterFile = pickFirst($event)"
        >
        <p class="mt-1 text-xs text-navy/50">
          Bez nje se prikazuje prva slika proizvoda.
        </p>
      </div>
      <input
        id="product-video-alt"
        v-model="videoAlt"
        name="product-video-alt"
        type="text"
        :maxlength="MEDIA_LIMITS.alt"
        placeholder="Opis videa (opciono)"
        aria-label="Opis videa"
        class="w-full rounded-lg border border-cloud/50 bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none"
      >
      <button
        type="button"
        :disabled="busy || !videoFile"
        class="w-full rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue disabled:opacity-50"
        @click="uploadVideo"
      >
        Otpremi video
      </button>
    </div>
  </div>
</template>
