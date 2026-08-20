<script setup lang="ts">
useHead({
  title: 'Pratite porudžbinu - elorikids',
  meta: [
    { name: 'description', content: 'Unesite broj porudžbine i pratite status vaše isporuke u realnom vremenu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

// --- Dummy order database (simulated) ---
interface OrderStep {
  label: string
  description: string
  date?: string
}

interface DummyOrder {
  id: string
  status: 'processed' | 'shipped' | 'delivered'
  steps: OrderStep[]
}

const dummyOrders: DummyOrder[] = [
  {
    id: 'EK-2025-00142',
    status: 'shipped',
    steps: [
      { label: 'Porudžbina primljena', description: 'Vaša porudžbina je uspešno kreirana.', date: '15. avgust 2025.' },
      { label: 'Priprema za slanje', description: 'Knjige su spakovane i predate kuriru.', date: '16. avgust 2025.' },
      { label: 'U transportu', description: 'Pošiljka je na putu do vas.', date: '17. avgust 2025.' },
      { label: 'Isporuka', description: 'Očekivana isporuka 19. avgust 2025.' },
    ],
  },
  {
    id: 'EK-2025-00098',
    status: 'delivered',
    steps: [
      { label: 'Porudžbina primljena', description: 'Vaša porudžbina je uspešno kreirana.', date: '8. avgust 2025.' },
      { label: 'Priprema za slanje', description: 'Knjige su spakovane i predate kuriru.', date: '9. avgust 2025.' },
      { label: 'U transportu', description: 'Pošiljka je na putu do vas.', date: '10. avgust 2025.' },
      { label: 'Isporučeno', description: 'Pošiljka je uspešno isporučena.', date: '12. avgust 2025.' },
    ],
  },
  {
    id: 'EK-2025-00150',
    status: 'processed',
    steps: [
      { label: 'Porudžbina primljena', description: 'Vaša porudžbina je uspešno kreirana.', date: '18. avgust 2025.' },
      { label: 'Priprema za slanje', description: 'Knjige se trenutno pakuju.', date: '18. avgust 2025.' },
      { label: 'U transportu', description: 'Čeka preuzimanje od strane kurira.' },
      { label: 'Isporuka', description: 'Očekivana isporuka 20. avgust 2025.' },
    ],
  },
]

// --- Form state ---
const orderId = ref('')
const { status, errorMessage, setError } = useFormStatus()
const foundOrder = ref<DummyOrder | null>(null)

// Which steps are "completed" = those with a date set
function stepState(order: DummyOrder): ('done' | 'current' | 'pending')[] {
  return order.steps.map((step, i) => {
    if (step.date) return 'done'
    // First step without a date = current (in-progress)
    const firstPending = order.steps.findIndex(s => !s.date)
    return i === firstPending ? 'current' : 'pending'
  })
}

// Status badge styling
const statusConfig: Record<DummyOrder['status'], { label: string, class: string }> = {
  processed: { label: 'U obradi', class: 'bg-yellow/20 text-navy' },
  shipped: { label: 'U transportu', class: 'bg-blue/10 text-blue' },
  delivered: { label: 'Isporučeno', class: 'bg-mint/20 text-navy' },
}

async function handleSubmit() {
  errorMessage.value = ''
  foundOrder.value = null
  status.value = 'loading'

  // Simulate network delay
  await new Promise(r => setTimeout(r, 700))

  const trimmed = orderId.value.trim().toUpperCase()
  if (!trimmed) {
    setError('Unesite broj porudžbine.')
    return
  }

  const match = dummyOrders.find(o => o.id === trimmed)
  if (match) {
    foundOrder.value = match
    status.value = 'success'
  } else {
    setError(`Porudžbina "${trimmed}" nije pronađena. Proverite broj i pokušajte ponovo.`)
  }
}
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
              Broj porudžbine izgleda kao "EK-2025-00142".
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
              placeholder="EK-2025-00142"
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
                Za testiranje probajte:
                <button type="button" class="font-semibold text-blue underline-offset-2 hover:underline" @click="orderId = 'EK-2025-00142'; handleSubmit()">
                  EK-2025-00142
                </button>,
                <button type="button" class="font-semibold text-blue underline-offset-2 hover:underline" @click="orderId = 'EK-2025-00098'; handleSubmit()">
                  EK-2025-00098
                </button>,
                <button type="button" class="font-semibold text-blue underline-offset-2 hover:underline" @click="orderId = 'EK-2025-00150'; handleSubmit()">
                  EK-2025-00150
                </button>
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
              :class="statusConfig[foundOrder.status].class"
            >
              {{ statusConfig[foundOrder.status].label }}
            </span>
          </div>

          <!-- Timeline -->
          <ol class="mt-8 space-y-6">
            <li
              v-for="(step, i) in foundOrder.steps"
              :key="i"
              class="flex gap-4"
            >
              <!-- Step indicator -->
              <div class="flex flex-col items-center">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                  :class="[
                    stepState(foundOrder)[i] === 'done' ? 'border-mint bg-mint text-white' : '',
                    stepState(foundOrder)[i] === 'current' ? 'border-blue bg-blue text-white' : '',
                    stepState(foundOrder)[i] === 'pending' ? 'border-cloud bg-cloud/30 text-navy/40' : '',
                  ]"
                >
                  <Icon
                    v-if="stepState(foundOrder)[i] === 'done'"
                    name="lucide:check"
                    class="size-5"
                  />
                  <Icon
                    v-else-if="stepState(foundOrder)[i] === 'current'"
                    name="lucide:loader-2"
                    class="size-5 animate-spin"
                  />
                  <span v-else class="text-sm font-bold">{{ i + 1 }}</span>
                </div>
                <!-- Connector line -->
                <div
                  v-if="i < foundOrder.steps.length - 1"
                  class="mt-1 w-0.5 flex-1"
                  :class="stepState(foundOrder)[i] === 'done' ? 'bg-mint' : 'bg-cloud/40'"
                />
              </div>

              <!-- Step content -->
              <div class="flex-1 pb-2">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-semibold text-navy">{{ step.label }}</h3>
                  <span
                    v-if="stepState(foundOrder)[i] === 'current'"
                    class="rounded-full bg-blue/10 px-2 py-0.5 text-xs font-semibold text-blue"
                  >
                    U toku
                  </span>
                </div>
                <p class="mt-1 text-sm text-navy/60">{{ step.description }}</p>
                <p v-if="step.date" class="mt-1 text-xs text-navy/40">{{ step.date }}</p>
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
