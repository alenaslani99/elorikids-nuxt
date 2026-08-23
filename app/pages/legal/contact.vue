<script setup lang="ts">
useHead({
  title: 'Kontakt - elorikids',
  meta: [
    { name: 'description', content: 'Stupite u kontakt sa elorikids timom. Pitanja o knjigama, porudžbinama ili dostavi? Pišite nam - odgovaramo u roku od 24h.' },
  ],
})

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const { status, errorMessage, setError, clearStale } = useFormStatus()

const { emailRegex } = useValidation()

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.name.trim()) {
    setError('Unesite vaše ime.')
    return
  }

  if (!form.email.trim()) {
    setError('Unesite adresu e-pošte.')
    return
  }

  if (!emailRegex.test(form.email)) {
    setError('Unesite ispravnu adresu e-pošte.')
    return
  }

  if (!form.message.trim()) {
    setError('Unesite poruku.')
    return
  }

  if (form.message.trim().length < 10) {
    setError('Poruka je prekratka (minimum 10 karaktera).')
    return
  }

  status.value = 'loading'

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        message: form.message,
      },
    })
    status.value = 'success'
  }
  catch {
    setError('Došlo je do greške. Pokušajte ponovo.')
  }
}

// Clear stale status/success message as soon as the user edits any field
watch(form, () => clearStale())

const contactInfo = [
  {
    icon: 'lucide:mail',
    label: 'E-pošta',
    value: 'pozdrav@elorikids.rs',
    href: 'mailto:pozdrav@elorikids.rs',
    accent: 'bg-blue/10 text-blue',
  },
  {
    icon: 'lucide:instagram',
    label: 'Instagram',
    value: '@elorikids',
    href: 'https://instagram.com/elorikids',
    accent: 'bg-coral/10 text-coral',
  },
  {
    icon: 'lucide:clock',
    label: 'Radno vreme',
    value: 'Pon - Pet, 9h - 17h',
    accent: 'bg-mint/15 text-mint',
  },
  {
    icon: 'lucide:truck',
    label: 'Dostava',
    value: 'Cela Srbija, 1-3 radna dana',
    accent: 'bg-purple/10 text-purple',
  },
]
</script>

<template>
  <div>
    <!-- Page header -->
    <section class="bg-gradient-to-b from-sky/30 to-cream py-16 lg:py-20">
      <div class="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <span class="inline-block rounded-full bg-coral/20 px-4 py-1.5 text-sm font-semibold text-coral">
          Kontakt
        </span>
        <h1 class="font-unbounded mt-4 text-4xl font-extrabold text-navy md:text-5xl">
          Stupite u kontakt
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-navy/70">
          Pitanja o knjigama, porudžbinama ili dostavi? Rado ćemo vam pomoći.
          Pišite nam i odgovaramo u roku od 24h.
        </p>
      </div>
    </section>

    <!-- Contact form + info -->
    <section class="bg-cream py-16 lg:py-20">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <!-- Form (3 cols) -->
          <div class="lg:col-span-3">
            <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
              <h2 class="font-unbounded mb-2 text-2xl font-bold text-navy">
                Pošaljite poruku
              </h2>
              <p class="mb-6 text-navy/60">
                Popunite formu ispod i javićemo vam se što pre.
              </p>

              <form class="space-y-5" @submit.prevent="handleSubmit">
                <!-- Name -->
                <AppInput
                  id="name"
                  v-model="form.name"
                  label="Ime i prezime"
                  type="text"
                  autocomplete="name"
                  required
                  placeholder="Marko Marković"
                  :disabled="status === 'loading'"
                />

                <!-- Email -->
                <AppInput
                  id="email"
                  v-model="form.email"
                  label="Adresa e-pošte"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  required
                  placeholder="marko@primer.rs"
                  :disabled="status === 'loading'"
                />

                <!-- Message -->
                <AppTextarea
                  id="message"
                  v-model="form.message"
                  label="Poruka"
                  :rows="5"
                  required
                  placeholder="Kako možemo da vam pomognemo?"
                  :disabled="status === 'loading'"
                />

                <!-- Status message (reserved height prevents layout shift) -->
                <div class="min-h-8">
                  <p v-if="status === 'error'" class="py-1 text-sm font-medium text-coral" role="alert">
                    {{ errorMessage }}
                  </p>
                  <p v-else-if="status === 'success'" class="py-1 text-sm font-medium text-mint" role="status">
                    Hvala na poruci! Javićemo vam se na navedenu e-poštu u roku od 24h.
                  </p>
                </div>

                <AppSubmitButton
                  :loading="status === 'loading'"
                  label="Pošalji poruku"
                  loading-label="Slanje..."
                  color="navy"
                  :full="false"
                  icon="lucide:send"
                />
              </form>
            </div>
          </div>

          <!-- Contact info sidebar (2 cols) -->
          <div class="lg:col-span-2">
            <div class="space-y-4">
              <div
                v-for="info in contactInfo"
                :key="info.label"
                class="flex items-center gap-4 rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  class="flex size-12 shrink-0 items-center justify-center rounded-xl"
                  :class="info.accent"
                >
                  <Icon :name="info.icon" class="size-6" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-navy/50">
                    {{ info.label }}
                  </p>
                  <p v-if="info.href" class="truncate font-semibold text-navy">
                    <a :href="info.href" class="transition-colors hover:text-blue">{{ info.value }}</a>
                  </p>
                  <p v-else class="font-semibold text-navy">
                    {{ info.value }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Trust nudge -->
            <div class="mt-6 rounded-2xl bg-navy p-6 text-white">
              <div class="flex items-center gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow/20">
                  <Icon name="lucide:zap" class="size-5 text-yellow" />
                </div>
                <div>
                  <p class="font-semibold">
                    Brz odgovor
                  </p>
                  <p class="text-sm text-cloud/80">
                    Odgovaramo u roku od 24h na sve poruke.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
