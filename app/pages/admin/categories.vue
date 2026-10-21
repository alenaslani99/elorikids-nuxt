<script setup lang="ts">
import type { AdminCategory } from '~~/server/api/admin/categories.get'
import { CATALOG_LIMITS, slugify, slugRegex } from '~~/shared/utils/catalog'

// Gate, header and nav live in the parent pages/admin.vue
useHead({ title: 'Kategorije - Admin panel - elorikids' })

const { errorMessage } = useAdmin()

const { data, refresh } = await useAsyncData(
  'admin-categories',
  () => $fetch<{ categories: AdminCategory[] }>('/api/admin/categories'),
  { default: () => ({ categories: [] }) },
)

const categories = computed(() => data.value?.categories ?? [])

// ── Tree (flattened with depth, server already sorts siblings) ───
interface TreeRow extends AdminCategory { depth: number }

const tree = computed<TreeRow[]>(() => {
  const byParent = new Map<number | null, AdminCategory[]>()
  for (const c of categories.value) {
    const list = byParent.get(c.parentId) ?? []
    list.push(c)
    byParent.set(c.parentId, list)
  }
  const rows: TreeRow[] = []
  const walk = (parentId: number | null, depth: number) => {
    for (const c of byParent.get(parentId) ?? []) {
      rows.push({ ...c, depth })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return rows
})

/** Ids of a category and all its descendants (invalid parents for it). */
function subtreeIds(id: number): Set<number> {
  const ids = new Set([id])
  let grew = true
  while (grew) {
    grew = false
    for (const c of categories.value) {
      if (c.parentId !== null && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id)
        grew = true
      }
    }
  }
  return ids
}

// ── Form (create + edit share one panel) ─────────────────────────
const { status, errorMessage: formError, setError, reset, clearStale } = useFormStatus()

const editingId = ref<number | null>(null)
const form = reactive({ name: '', slug: '', parentId: '' as string, sortOrder: '0' })
const slugTouched = ref(false)
const submitted = ref(false)

const parentOptions = computed(() => {
  const excluded = editingId.value !== null ? subtreeIds(editingId.value) : new Set<number>()
  return tree.value.filter(c => !excluded.has(c.id))
})

// Auto-fill the slug from the name until the slug is edited by hand
watch(() => form.name, (name) => {
  if (!slugTouched.value) form.slug = slugify(name)
})
watch(form, () => clearStale())

const nameError = computed(() => {
  if (!submitted.value) return ''
  if (!form.name.trim()) return 'Naziv je obavezan.'
  if (form.name.trim().length > CATALOG_LIMITS.categoryName) return `Najviše ${CATALOG_LIMITS.categoryName} karaktera.`
  return ''
})
const slugError = computed(() => {
  if (!submitted.value) return ''
  if (!slugRegex.test(form.slug.trim()) || form.slug.trim().length > CATALOG_LIMITS.slug)
    return 'Samo mala slova, brojevi i crtice (npr. knjige-za-decu).'
  return ''
})

function startCreate() {
  editingId.value = null
  Object.assign(form, { name: '', slug: '', parentId: '', sortOrder: '0' })
  slugTouched.value = false
  submitted.value = false
  reset()
}

function startEdit(c: AdminCategory) {
  editingId.value = c.id
  slugTouched.value = true
  Object.assign(form, {
    name: c.name,
    slug: c.slug,
    parentId: c.parentId === null ? '' : String(c.parentId),
    sortOrder: String(c.sortOrder),
  })
  submitted.value = false
  reset()
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit() {
  reset()
  submitted.value = true
  if (nameError.value || slugError.value) return

  status.value = 'loading'
  const body = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    parentId: form.parentId ? Number(form.parentId) : null,
    sortOrder: Number(form.sortOrder) || 0,
  }
  try {
    if (editingId.value === null) {
      await $fetch('/api/admin/categories', { method: 'POST', body })
    }
    else {
      await $fetch(`/api/admin/categories/${editingId.value}`, { method: 'PATCH', body })
    }
    await refresh()
    startCreate()
  }
  catch (e: any) {
    setError(errorMessage(e, 'Čuvanje nije uspelo. Pokušajte ponovo.'))
  }
}

// ── Delete ───────────────────────────────────────────────────────
const deletingId = ref<number | null>(null)
const listError = ref('')

async function deleteCategory(c: AdminCategory) {
  listError.value = ''
  if (!confirm(`Obrisati kategoriju "${c.name}"? Ova radnja se ne može poništiti.`)) return
  deletingId.value = c.id
  try {
    await $fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
    if (editingId.value === c.id) startCreate()
    await refresh()
  }
  catch (e: any) {
    listError.value = errorMessage(e, 'Brisanje nije uspelo.')
  }
  finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-16 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
    <!-- Form panel (first on mobile, right column on desktop) -->
    <section class="lg:order-2">
      <div class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm lg:sticky lg:top-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="font-unbounded text-base font-bold text-navy">
            {{ editingId === null ? 'Nova kategorija' : 'Izmena kategorije' }}
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
            id="category-name"
            v-model="form.name"
            label="Naziv"
            placeholder="npr. Knjige"
            required
            :disabled="status === 'loading'"
            :error="nameError"
          />
          <AppInput
            id="category-slug"
            v-model="form.slug"
            label="Slug (URL)"
            placeholder="npr. knjige"
            required
            :disabled="status === 'loading'"
            :error="slugError"
            @input="slugTouched = true"
          />

          <div>
            <label for="category-parent" class="mb-1.5 block text-sm font-semibold text-navy">
              Nadređena kategorija
            </label>
            <select
              id="category-parent"
              v-model="form.parentId"
              :disabled="status === 'loading'"
              class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            >
              <option value="">
                — Glavna kategorija —
              </option>
              <option v-for="c in parentOptions" :key="c.id" :value="String(c.id)">
                {{ '  '.repeat(c.depth) }}{{ c.name }}
              </option>
            </select>
          </div>

          <AppInput
            id="category-sort"
            v-model="form.sortOrder"
            label="Redosled"
            type="number"
            inputmode="numeric"
            :disabled="status === 'loading'"
          />

          <p
            class="min-h-5 text-sm text-coral transition-opacity duration-200"
            :class="status === 'error' ? 'opacity-100' : 'opacity-0'"
            role="alert"
          >
            {{ formError }}
          </p>

          <AppSubmitButton
            :loading="status === 'loading'"
            :label="editingId === null ? 'Dodaj kategoriju' : 'Sačuvaj izmene'"
            loading-label="Čuvanje..."
          />
        </form>
      </div>
    </section>

    <!-- Category tree -->
    <section class="lg:order-1">
      <div
        v-if="listError"
        class="mb-3 flex items-start gap-2 rounded-xl bg-coral/10 p-3 text-sm text-coral-dark"
        role="alert"
      >
        <Icon name="lucide:alert-circle" class="mt-0.5 size-4 shrink-0" />
        <span>{{ listError }}</span>
      </div>

      <div v-if="tree.length === 0" class="rounded-2xl border border-dashed border-cloud/60 bg-white p-12 text-center">
        <Icon name="lucide:folder-x" class="mx-auto mb-3 size-8 text-navy/30" />
        <p class="text-navy/60">
          Nema kategorija još.
        </p>
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="c in tree"
          :key="c.id"
          class="rounded-2xl border-2 bg-white p-4 shadow-sm transition-colors"
          :class="editingId === c.id ? 'border-blue' : 'border-cloud/40 hover:border-blue/40'"
          :style="{ marginLeft: `${Math.min(c.depth, 4) * 1.5}rem` }"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky/30 text-navy">
                <Icon :name="c.depth === 0 ? 'lucide:folder' : 'lucide:folder-open'" class="size-4" />
              </div>
              <div class="min-w-0">
                <p class="truncate font-semibold text-navy">
                  {{ c.name }}
                </p>
                <p class="truncate text-xs text-navy/50">
                  /{{ c.slug }} · {{ c.productCount }} proizvoda<span v-if="c.childCount"> · {{ c.childCount }} podkategorija</span> · redosled {{ c.sortOrder }}
                </p>
              </div>
            </div>

            <div class="flex shrink-0 gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full border-2 border-cloud/50 px-3 py-1.5 text-xs font-semibold text-navy/70 transition-colors hover:border-navy/40"
                @click="startEdit(c)"
              >
                <Icon name="lucide:pencil" class="size-3.5" />
                Izmeni
              </button>
              <button
                type="button"
                :disabled="deletingId === c.id || c.productCount > 0 || c.childCount > 0"
                :title="c.productCount > 0 || c.childCount > 0 ? 'Moguće je obrisati samo praznu kategoriju' : undefined"
                class="inline-flex items-center gap-1.5 rounded-full border-2 border-cloud/50 px-3 py-1.5 text-xs font-semibold text-navy/70 transition-colors hover:border-coral hover:text-coral disabled:opacity-40 disabled:hover:border-cloud/50 disabled:hover:text-navy/70"
                @click="deleteCategory(c)"
              >
                <Icon name="lucide:trash-2" class="size-3.5" />
                Obriši
              </button>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
