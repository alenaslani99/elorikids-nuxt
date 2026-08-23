<script setup lang="ts">
useHead({
  title: 'Pratite porudžbinu - elorikids',
  meta: [
    { name: 'description', content: 'Unesite broj porudžbine i pratite status vaše isporuke u realnom vremenu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

// --- Types matching the /api/order/[id] response ---
interface TimelineStep {
  status: string
  at: string
}

interface FoundOrder {
  id: string
  status: string
  createdAt: string
  customer: { name: string, city: string }
  totals: { subtotal: number, shipping: number, grandTotal: number }
  items: { slug: string, title: string, price: number, quantity: number }[]
  timeline: TimelineStep[]
}

// --- Form state ---
const orderId = ref('')
const { status, errorMessage, setError } = useFormStatus()
const foundOrder = ref<FoundOrder | null>(null)

// --- Status metadata lives in shared/utils/order-status.ts ---
import { getOrderStatusMeta, LIFECYCLE_STEPS } from '~~/shared/utils/order-status'
import { formatDateLong as formatDate } from '~~/shared/utils/format'

interface DisplayStep {
  status: string
  label: string
  description: string
  at: string | null
  state: 'done' | 'current' | 'pending'
}

// Build display steps: all lifecycle phases shown, with state + timestamp
function buildSteps(order: FoundOrder): DisplayStep[] {
  const timelineMap = new Map(order.timeline.map(t => [t.status, t.at]))

  if (order.status === 'cancelled') {
    const steps: DisplayStep[] = LIFECYCLE_STEPS
      .filter(s => timelineMap.has(s))
      .map(s => {
        const meta = getOrderStatusMeta(s)
        return { status: s, label: meta.label, description: meta.description, at: timelineMap.get(s) ?? null, state: 'done' as const }
      })
    const cancelledMeta = getOrderStatusMeta('cancelled')
    steps.push({ status: 'cancelled', label: cancelledMeta.label, description: cancelledMeta.description, at: timelineMap.get('cancelled') ?? null, state: 'done' as const })
    return steps
  }

  const lastReached = order.timeline[order.timeline.length - 1]?.status

  return LIFECYCLE_STEPS.map((s) => {
    const meta = getOrderStatusMeta(s)
    const at = timelineMap.get(s) ?? null
    if (at) {
      if (s === lastReached && order.status !== 'delivered') {
        return { status: s, label: meta.label, description: meta.description, at, state: 'current' as const }
      }
      return { status: s, label: meta.label, description: meta.description, at, state: 'done' as const }
    }
    return { status: s, label: meta.label, description: meta.description, at: null, state: 'pending' as const }
  })
}

async function handleSubmit() {
  errorMessage.value = ''
  foundOrder.value = null
  status.value = 'loading'

  const trimmed = orderId.value.trim().toUpperCase()
  if (!trimmed) {
    setError('Unesite broj porudžbine.')
    return
  }

  try {
    const res = await $fetch<FoundOrder>(`/api/order/${trimmed}`)
    foundOrder.value = res
    status.value = 'success'
  }
  catch (e: any) {
    setError(e?.data?.statusMessage || 'Porudžbina nije pronađena. Proverite broj i pokušajte ponovo.')
  }
}

// Auto-search if order ID is in the URL query (?id=EK-...)
const route = useRoute()
onMounted(() => {
  const queryId = route.query.id as string
  if (queryId) {
    orderId.value = queryId
    handleSubmit()
  }
})
</script>

<template>
  <div class="bg-cream">
    <!-- Page header -->
    <AppPageHeader
      title="Gde je moja porudžbina?"
      badge="Pratite porudžbinu"
      badge-class="bg-blue/10 text-blue"
      subtitle="Unesite broj vaše porudžbine koji ste dobili u potvrdi e-pošte i pratite status isporuke u realnom vremenu."
      :breadcrumb-items="[{ label: 'Početna', to: '/' }, { label: 'Pratite porudžbinu' }]"
    />

    <!-- Tracking form -->
    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
          <div class="mb-6 text-center">
            <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue/10">
              <Icon name="lucide:package-search" class="size-8 text-blue" />
            </div>
            <h2 class="font-unbounded text-2xl font-bold text-navy">
              Pronađite vašu porudžbinu
            </h2>
            <p class="mt-2 text-navy/60">
              Broj porudžbine izgleda kao "EK-2026-000001".
            </p>
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <AppInput
              id="orderId"
              v-model="orderId"
              label="Broj porudžbine"
              type="text"
              inputmode="text"
              autocomplete="off"
              required
              placeholder="EK-2026-000001"
              :disabled="status === 'loading'"
            />

            <!-- Error -->
            <p v-if="status === 'error'" class="text-sm text-coral" role="alert">
              {{ errorMessage }}
            </p>

            <AppSubmitButton
              :loading="status === 'loading'"
              label="Prati porudžbinu"
              loading-label="Pretraga..."
            />
          </form>

          <!-- Hint -->
          <div class="mt-6 rounded-2xl bg-sky/20 p-4 text-sm text-navy/60">
            <p class="flex items-start gap-2">
              <Icon name="lucide:info" class="mt-0.5 size-4 shrink-0 text-blue" />
              <span>
                Broj porudžbine ste dobili u potvrdi e-pošte nakon naručivanja. Format: EK-YYYY-NNNNNN.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Order result -->
    <section v-if="foundOrder" class="pb-16">
      <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
          <!-- Order header -->
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-cloud/40 pb-6">
            <div>
              <p class="text-sm text-navy/50">Porudžbina</p>
              <p class="font-unbounded text-2xl font-extrabold text-navy">{{ foundOrder.id }}</p>
            </div>
            <span
              class="rounded-full px-4 py-1.5 text-sm font-semibold"
              :class="getOrderStatusMeta(foundOrder.status).badgeClass"
            >
              {{ getOrderStatusMeta(foundOrder.status).label }}
            </span>
          </div>

          <!-- Order details: items + totals -->
          <div class="mb-8 rounded-2xl bg-cream p-5">
            <p class="mb-3 text-sm font-semibold text-navy">Stavke porudžbine</p>
            <ul class="space-y-2">
              <li
                v-for="item in foundOrder.items"
                :key="item.slug"
                class="flex items-center justify-between text-sm text-navy/70"
              >
                <span>{{ item.title }} <span class="text-navy/40">× {{ item.quantity }}</span></span>
                <span class="font-medium">{{ (item.price * item.quantity).toLocaleString('sr-RS') }} RSD</span>
              </li>
            </ul>
            <div class="mt-3 border-t border-cloud/40 pt-3 text-sm">
              <div class="flex justify-between text-navy/60">
                <span>Knjige</span>
                <span>{{ foundOrder.totals.subtotal.toLocaleString('sr-RS') }} RSD</span>
              </div>
              <div class="flex justify-between text-navy/60">
                <span>Dostava</span>
                <span>{{ foundOrder.totals.shipping === 0 ? 'Besplatno' : `${foundOrder.totals.shipping.toLocaleString('sr-RS')} RSD` }}</span>
              </div>
              <div class="mt-1 flex justify-between font-bold text-navy">
                <span>Ukupno</span>
                <span>{{ foundOrder.totals.grandTotal.toLocaleString('sr-RS') }} RSD</span>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <ol class="mt-8 space-y-6">
            <li
              v-for="(step, i) in buildSteps(foundOrder)"
              :key="step.status"
              class="flex gap-4"
            >
              <!-- Step indicator -->
              <div class="flex flex-col items-center">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                  :class="[
                    step.state === 'done' ? 'border-mint bg-mint text-white' : '',
                    step.state === 'current' ? 'border-blue bg-blue text-white' : '',
                    step.state === 'pending' ? 'border-cloud bg-cloud/30 text-navy/40' : '',
                  ]"
                >
                  <Icon
                    v-if="step.state === 'done'"
                    name="lucide:check"
                    class="size-5"
                  />
                  <Icon
                    v-else-if="step.state === 'current'"
                    name="lucide:loader-2"
                    class="size-5 animate-spin"
                  />
                  <span v-else class="text-sm font-bold">{{ i + 1 }}</span>
                </div>
                <!-- Connector line -->
                <div
                  v-if="i < buildSteps(foundOrder).length - 1"
                  class="mt-1 w-0.5 flex-1"
                  :class="step.state === 'done' ? 'bg-mint' : 'bg-cloud/40'"
                />
              </div>

              <!-- Step content -->
              <div class="flex-1 pb-2">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-semibold text-navy">{{ step.label }}</h3>
                  <span
                    v-if="step.state === 'current'"
                    class="rounded-full bg-blue/10 px-2 py-0.5 text-xs font-semibold text-blue"
                  >
                    U toku
                  </span>
                </div>
                <p class="mt-1 text-sm text-navy/60">{{ step.description }}</p>
                <p v-if="step.at" class="mt-1 text-xs text-navy/40">{{ formatDate(step.at) }}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <AppCtaSection
      title="Problem sa porudžbinom?"
      subtitle="Naš tim podrške je tu da pomogne. Kontaktirajte nas i rešićemo sve nedoumice."
      primary-label="Kontaktirajte nas"
      primary-to="/legal/contact"
      secondary-label="Česta pitanja"
      secondary-to="/faq"
    />
  </div>
</template>
