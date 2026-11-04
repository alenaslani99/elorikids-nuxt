<script setup lang="ts">
/**
 * Ordered list editor for the admin product form (features, activities,
 * selling points): add, remove, move up/down. Each row is an object with
 * the keys given in `fields`. Validation happens on the server; inputs
 * only cap length.
 */
export interface RowField {
  key: string
  label: string
  max: number
  multiline?: boolean
}

const props = withDefaults(defineProps<{
  id: string
  label: string
  fields: RowField[]
  maxRows: number
  addLabel?: string
  disabled?: boolean
}>(), {
  addLabel: 'Dodaj',
  disabled: false,
})

const rows = defineModel<Record<string, string>[]>({ required: true })

function add() {
  rows.value = [...rows.value, Object.fromEntries(props.fields.map(f => [f.key, '']))]
}

function remove(index: number) {
  rows.value = rows.value.filter((_, i) => i !== index)
}

function move(index: number, delta: -1 | 1) {
  const target = index + delta
  if (target < 0 || target >= rows.value.length) return
  const next = [...rows.value]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  rows.value = next
}
</script>

<template>
  <fieldset :disabled="disabled">
    <legend class="mb-1.5 flex w-full items-center justify-between text-sm font-semibold text-navy">
      <span>{{ label }}</span>
      <span class="text-xs font-normal text-navy/50">{{ rows.length }}/{{ maxRows }}</span>
    </legend>

    <ul v-if="rows.length" class="space-y-2">
      <li
        v-for="(row, i) in rows"
        :key="i"
        class="flex gap-2 rounded-xl bg-cream p-2"
      >
        <div class="min-w-0 flex-1 space-y-1.5">
          <template v-for="field in fields" :key="field.key">
            <textarea
              v-if="field.multiline"
              :id="`${id}-${i}-${field.key}`"
              v-model="row[field.key]"
              :name="`${id}-${i}-${field.key}`"
              :maxlength="field.max"
              :placeholder="field.label"
              :aria-label="`${field.label} ${i + 1}`"
              rows="2"
              class="w-full resize-y rounded-lg border border-cloud/50 bg-white px-2.5 py-1.5 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none"
            />
            <input
              v-else
              :id="`${id}-${i}-${field.key}`"
              v-model="row[field.key]"
              :name="`${id}-${i}-${field.key}`"
              type="text"
              :maxlength="field.max"
              :placeholder="field.label"
              :aria-label="`${field.label} ${i + 1}`"
              class="w-full rounded-lg border border-cloud/50 bg-white px-2.5 py-1.5 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none"
            >
          </template>
        </div>
        <div class="flex shrink-0 flex-col">
          <button
            type="button"
            :disabled="i === 0"
            class="rounded-md p-1 text-navy/50 hover:bg-white hover:text-navy disabled:opacity-30"
            aria-label="Pomeri gore"
            @click="move(i, -1)"
          >
            <Icon name="lucide:chevron-up" class="size-4" />
          </button>
          <button
            type="button"
            :disabled="i === rows.length - 1"
            class="rounded-md p-1 text-navy/50 hover:bg-white hover:text-navy disabled:opacity-30"
            aria-label="Pomeri dole"
            @click="move(i, 1)"
          >
            <Icon name="lucide:chevron-down" class="size-4" />
          </button>
          <button
            type="button"
            class="rounded-md p-1 text-navy/50 hover:bg-white hover:text-coral"
            aria-label="Ukloni"
            @click="remove(i)"
          >
            <Icon name="lucide:x" class="size-4" />
          </button>
        </div>
      </li>
    </ul>

    <button
      v-if="rows.length < maxRows"
      type="button"
      class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue hover:text-navy"
      @click="add"
    >
      <Icon name="lucide:plus" class="size-4" />
      {{ addLabel }}
    </button>
  </fieldset>
</template>
