<script setup lang="ts">
import type { AdminProduct } from '~~/server/api/admin/products.get'
import type { AdminCategory } from '~~/server/api/admin/categories.get'
import { CATALOG_LIMITS, slugify, slugRegex } from '~~/shared/utils/catalog'
import { formatDateShort as formatDate } from '~~/shared/utils/format'

// Gate, header and nav live in the parent pages/admin.vue
useHead({ title: 'Proizvodi - Admin panel - elorikids' })

const { errorMessage } = useAdmin()

const [{ data: productsData, refresh: refreshProducts }, { data: categoriesData }] = await Promise.all([
  useAsyncData(
    'admin-products',
    () => $fetch<{ products: AdminProduct[] }>('/api/admin/products'),
    { default: () => ({ products: [] }) },
  ),
  useAsyncData(
    'admin-categories',
    () => $fetch<{ categories: AdminCategory[] }>('/api/admin/categories'),
    { default: () => ({ categories: [] }) },
  ),
])

const products = computed(() => productsData.value?.products ?? [])

// Categories as an indented tree for the <select>
const categoryOptions = computed(() => {
  const all = categoriesData.value?.categories ?? []
  const rows: { id: number, label: string }[] = []
  const walk = (parentId: number | null, depth: number) => {
    for (const c of all.filter(c => c.parentId === parentId)) {
      rows.push({ id: c.id, label: `${'  '.repeat(depth)}${c.name}` })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return rows
})

// ── Filtering (client-side - the catalog is small) ───────────────
const searchInput = ref('')
const categoryFilter = ref<string>('all')
const activeFilter = ref<'all' | 'active' | 'inactive'>('all')

const filteredProducts = computed(() => {
  const q = searchInput.value.trim().toLowerCase()
  return products.value.filter((p) => {
    if (q && !p.title.toLowerCase().includes(q) && !p.slug.includes(q)) return false
    if (categoryFilter.value === 'none' && p.categoryId !== null) return false
    if (categoryFilter.value !== 'all' && categoryFilter.value !== 'none' && String(p.categoryId) !== categoryFilter.value) return false
    if (activeFilter.value === 'active' && !p.active) return false
    if (activeFilter.value === 'inactive' && p.active) return false
    return true
  })
})

const activeTabs = computed(() => [
  { key: 'all' as const, label: 'Svi', count: products.value.length },
  { key: 'active' as const, label: 'Aktivni', count: products.value.filter(p => p.active).length },
  { key: 'inactive' as const, label: 'Neaktivni', count: products.value.filter(p => !p.active).length },
])

// ── Form (create + edit share one panel) ─────────────────────────
const { status, errorMessage: formError, setError, reset, clearStale } = useFormStatus()

const editingId = ref<number | null>(null)
const form = reactive({
  title: '',
  slug: '',
  categoryId: '' as string,
  price: '',
  salePrice: '',
  active: true,
})
const slugTouched = ref(false)
const submitted = ref(false)

watch(() => form.title, (title) => {
  if (editingId.value === null && !slugTouched.value) form.slug = slugify(title)
})
watch(form, () => clearStale())

const titleError = computed(() => {
  if (!submitted.value) return ''
  if (!form.title.trim()) return 'Naziv je obavezan.'
  if (form.title.trim().length > CATALOG_LIMITS.productTitle) return `Najviše ${CATALOG_LIMITS.productTitle} karaktera.`
  return ''
})
const slugError = computed(() => {
  if (!submitted.value || editingId.value !== null) return ''
  if (!slugRegex.test(form.slug.trim()) || form.slug.trim().length > CATALOG_LIMITS.slug)
    return 'Samo mala slova, brojevi i crtice (npr. prvi-koraci).'
  return ''
})

function isValidPrice(value: string): boolean {
  const n = Number(value)
  return /^\d+$/.test(value.trim()) && n >= CATALOG_LIMITS.priceMin && n <= CATALOG_LIMITS.priceMax
}
const priceError = computed(() => {
  if (!submitted.value) return ''
  if (!isValidPrice(form.price)) return 'Unesite ceo broj u dinarima.'
  return ''
})
const salePriceError = computed(() => {
  if (!submitted.value || !form.salePrice.trim()) return ''
  if (!isValidPrice(form.salePrice)) return 'Unesite ceo broj u dinarima.'
  if (isValidPrice(form.price) && Number(form.salePrice) >= Number(form.price)) return 'Mora biti niža od redovne cene.'
  return ''
})

function startCreate() {
  editingId.value = null
  Object.assign(form, { title: '', slug: '', categoryId: '', price: '', salePrice: '', active: true })
  slugTouched.value = false
  submitted.value = false
  reset()
}

function startEdit(p: AdminProduct) {
  editingId.value = p.id
  Object.assign(form, {
    title: p.title,
    slug: p.slug,
    categoryId: p.categoryId === null ? '' : String(p.categoryId),
    price: p.price === null ? '' : String(p.price),
    salePrice: p.salePrice === null ? '' : String(p.salePrice),
    active: p.active,
  })
  submitted.value = false
  reset()
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit() {
  reset()
  submitted.value = true
  if (titleError.value || slugError.value || priceError.value || salePriceError.value) return

  status.value = 'loading'
  const body = {
    title: form.title.trim(),
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    active: form.active,
    price: Number(form.price),
    salePrice: form.salePrice.trim() ? Number(form.salePrice) : null,
  }
  try {
    if (editingId.value === null) {
      await $fetch('/api/admin/products', { method: 'POST', body: { ...body, slug: form.slug.trim() } })
    }
    else {
      await $fetch(`/api/admin/products/${editingId.value}`, { method: 'PATCH', body })
    }
    await refreshProducts()
    startCreate()
  }
  catch (e: any) {
    setError(errorMessage(e, 'Čuvanje nije uspelo. Pokušajte ponovo.'))
  }
}

// ── Row actions ──────────────────────────────────────────────────
const busyId = ref<number | null>(null)
const listError = ref('')

async function toggleActive(p: AdminProduct) {
  listError.value = ''
  if (p.price === null) {
    listError.value = 'Proizvod nema cenu - otvorite izmenu i unesite cenu.'
    return
  }
  busyId.value = p.id
  try {
    await $fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      body: { title: p.title, categoryId: p.categoryId, active: !p.active, price: p.price, salePrice: p.salePrice },
    })
    await refreshProducts()
  }
  catch (e: any) {
    listError.value = errorMessage(e, 'Promena statusa nije uspela.')
  }
  finally {
    busyId.value = null
  }
}

async function deleteProduct(p: AdminProduct) {
  listError.value = ''
  const ordersNote = p.orderCount > 0
    ? `\n\nProizvod se nalazi u ${p.orderCount} stavki porudžbina - one ostaju sačuvane, ali razmislite o deaktivaciji umesto brisanja.`
    : ''
  if (!confirm(`Trajno obrisati proizvod "${p.title}" i istoriju cena?${ordersNote}`)) return
  busyId.value = p.id
  try {
    await $fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
    if (editingId.value === p.id) startCreate()
    await refreshProducts()
  }
  catch (e: any) {
    listError.value = errorMessage(e, 'Brisanje nije uspelo.')
  }
  finally {
    busyId.value = null
  }
}

function formatPrice(amount: number): string {
  return `${amount.toLocaleString('sr-RS')} RSD`
}
</script>

<template>
  <div>
    <!-- Controls bar -->
    <section class="mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-3 rounded-2xl border-2 border-cloud/40 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div class="relative flex-1">
          <Icon name="lucide:search" class="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-navy/40" />
          <input
            id="product-search"
            v-model="searchInput"
            name="product-search"
            type="text"
            placeholder="Pretraga po nazivu ili slugu..."
            class="w-full rounded-xl border-2 border-cloud/50 bg-cream py-2.5 pl-11 pr-4 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
          >
        </div>

        <select
          id="product-category-filter"
          v-model="categoryFilter"
          name="product-category-filter"
          aria-label="Filter po kategoriji"
          class="rounded-xl border-2 border-cloud/50 bg-cream px-4 py-2.5 text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">
            Sve kategorije
          </option>
          <option value="none">
            Bez kategorije
          </option>
          <option v-for="c in categoryOptions" :key="c.id" :value="String(c.id)">
            {{ c.label }}
          </option>
        </select>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in activeTabs"
            :key="tab.key"
            type="button"
            class="rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
            :class="activeFilter === tab.key
              ? 'bg-navy text-white'
              : 'bg-cream text-navy/60 hover:text-navy'"
            @click="activeFilter = tab.key"
          >
            {{ tab.label }}
            <span class="ml-1 opacity-60">{{ tab.count }}</span>
          </button>
        </div>
      </div>
    </section>

    <div class="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <!-- Form panel (first on mobile, right column on desktop) -->
      <section class="lg:order-2">
        <div class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="font-unbounded text-base font-bold text-navy">
              {{ editingId === null ? 'Novi proizvod' : 'Izmena proizvoda' }}
            </h2>
            <button
              v-if="editingId !== null"
              type="button"
              class="text-sm font-semibold text-navy/50 transition-colors hover:text-coral"
              @click="startCreate"
            >
              Otkaži
            </button>
          </div>

          <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
            <AppInput
              id="product-title"
              v-model="form.title"
              label="Naziv"
              placeholder="npr. Prvi koraci"
              required
              :disabled="status === 'loading'"
              :error="titleError"
            />

            <div>
              <AppInput
                id="product-slug"
                v-model="form.slug"
                label="Slug (URL)"
                placeholder="npr. prvi-koraci"
                required
                :disabled="status === 'loading' || editingId !== null"
                :error="slugError"
                @input="slugTouched = true"
              />
              <p v-if="editingId !== null" class="text-xs text-navy/50">
                Slug se ne menja nakon kreiranja (koristi se u linkovima, korpama i porudžbinama).
              </p>
            </div>

            <div>
              <label for="product-category" class="mb-1.5 block text-sm font-semibold text-navy">
                Kategorija
              </label>
              <select
                id="product-category"
                v-model="form.categoryId"
                :disabled="status === 'loading'"
                class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
              >
                <option value="">
                  — Bez kategorije —
                </option>
                <option v-for="c in categoryOptions" :key="c.id" :value="String(c.id)">
                  {{ c.label }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <AppInput
                id="product-price"
                v-model="form.price"
                label="Redovna cena"
                placeholder="2000"
                inputmode="numeric"
                required
                :disabled="status === 'loading'"
                :error="priceError"
              />
              <AppInput
                id="product-sale-price"
                v-model="form.salePrice"
                label="Akcijska cena"
                placeholder="opciono"
                inputmode="numeric"
                :disabled="status === 'loading'"
                :error="salePriceError"
              />
            </div>

            <label class="flex cursor-pointer items-center gap-3 rounded-xl bg-cream p-3">
              <input
                id="product-active"
                v-model="form.active"
                name="product-active"
                type="checkbox"
                :disabled="status === 'loading'"
                class="size-5 rounded accent-blue"
              >
              <span class="text-sm">
                <span class="font-semibold text-navy">Aktivan</span>
                <span class="block text-xs text-navy/50">Neaktivan proizvod se ne može poručiti.</span>
              </span>
            </label>

            <p
              class="min-h-5 text-sm text-coral transition-opacity duration-200"
              :class="status === 'error' ? 'opacity-100' : 'opacity-0'"
              role="alert"
            >
              {{ formError }}
            </p>

            <AppSubmitButton
              :loading="status === 'loading'"
              :label="editingId === null ? 'Dodaj proizvod' : 'Sačuvaj izmene'"
              loading-label="Čuvanje..."
            />
          </form>
        </div>
      </section>

      <!-- Product list -->
      <section class="lg:order-1">
        <div
          v-if="listError"
          class="mb-3 flex items-start gap-2 rounded-xl bg-coral/10 p-3 text-sm text-coral-dark"
          role="alert"
        >
          <Icon name="lucide:alert-circle" class="mt-0.5 size-4 shrink-0" />
          <span>{{ listError }}</span>
        </div>

        <div v-if="filteredProducts.length === 0" class="rounded-2xl border border-dashed border-cloud/60 bg-white p-12 text-center">
          <Icon name="lucide:package-x" class="mx-auto mb-3 size-8 text-navy/30" />
          <p class="text-navy/60">
            {{ products.length === 0 ? 'Nema proizvoda još.' : 'Nema proizvoda koji odgovaraju filteru.' }}
          </p>
        </div>

        <ul v-else class="space-y-3">
          <li
            v-for="p in filteredProducts"
            :key="p.id"
            class="rounded-2xl border-2 bg-white p-5 shadow-sm transition-colors"
            :class="editingId === p.id ? 'border-blue' : 'border-cloud/40 hover:border-blue/40'"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="font-unbounded font-bold text-navy">{{ p.title }}</span>
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    :class="p.active ? 'bg-mint/20 text-mint-dark' : 'bg-cloud/40 text-navy/60'"
                  >
                    <span class="size-1.5 rounded-full" :class="p.active ? 'bg-mint-dark' : 'bg-navy/40'" />
                    {{ p.active ? 'Aktivan' : 'Neaktivan' }}
                  </span>
                  <span
                    v-if="p.salePrice !== null"
                    class="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral-dark"
                  >
                    Akcija
                  </span>
                </div>

                <div class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p class="flex items-center gap-2 text-navy/70">
                    <Icon name="lucide:link" class="size-4 shrink-0 text-navy/40" />
                    <span class="truncate">/{{ p.slug }}</span>
                  </p>
                  <p class="flex items-center gap-2 text-navy/70">
                    <Icon name="lucide:folder" class="size-4 shrink-0 text-navy/40" />
                    {{ p.categoryName ?? 'Bez kategorije' }}
                  </p>
                  <p class="flex items-center gap-2 text-navy/70">
                    <Icon name="lucide:shopping-bag" class="size-4 shrink-0 text-navy/40" />
                    Stavki u porudžbinama: {{ p.orderCount }}
                  </p>
                  <p class="flex items-center gap-2 text-navy/70">
                    <Icon name="lucide:calendar" class="size-4 shrink-0 text-navy/40" />
                    Izmenjen {{ formatDate(p.updatedAt) }}
                  </p>
                </div>
              </div>

              <div class="flex shrink-0 flex-col gap-3 sm:items-end">
                <div class="sm:text-right">
                  <p v-if="p.currentPrice !== null" class="font-unbounded text-lg font-extrabold text-navy">
                    {{ formatPrice(p.currentPrice) }}
                  </p>
                  <p v-else class="text-sm font-semibold text-coral">
                    Nema cene
                  </p>
                  <p v-if="p.salePrice !== null && p.price !== null" class="text-sm text-navy/40 line-through">
                    {{ formatPrice(p.price) }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-full border-2 border-cloud/50 px-3 py-1.5 text-xs font-semibold text-navy/70 transition-colors hover:border-navy/40"
                    @click="startEdit(p)"
                  >
                    <Icon name="lucide:pencil" class="size-3.5" />
                    Izmeni
                  </button>
                  <button
                    type="button"
                    :disabled="busyId === p.id"
                    class="inline-flex items-center gap-1.5 rounded-full border-2 border-cloud/50 px-3 py-1.5 text-xs font-semibold text-navy/70 transition-colors hover:border-navy/40 disabled:opacity-40"
                    @click="toggleActive(p)"
                  >
                    <Icon :name="p.active ? 'lucide:eye-off' : 'lucide:eye'" class="size-3.5" />
                    {{ p.active ? 'Deaktiviraj' : 'Aktiviraj' }}
                  </button>
                  <button
                    type="button"
                    :disabled="busyId === p.id"
                    class="inline-flex items-center gap-1.5 rounded-full border-2 border-cloud/50 px-3 py-1.5 text-xs font-semibold text-navy/70 transition-colors hover:border-coral hover:text-coral disabled:opacity-40"
                    @click="deleteProduct(p)"
                  >
                    <Icon name="lucide:trash-2" class="size-3.5" />
                    Obriši
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
