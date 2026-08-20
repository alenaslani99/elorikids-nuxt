<script setup lang="ts">
useHead({
  title: 'Registracija - elorikids',
  meta: [
    { name: 'description', content: 'Kreirajte elorikids nalog da biste brže naručivali i pratili porudžbine.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const { setUser } = useAuth()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const { status, errorMessage, setError } = useFormStatus()
const showPassword = ref(false)
const agree = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.name.trim()) {
    setError('Unesite ime i prezime.')
    return
  }
  if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
    setError('Unesite ispravnu adresu e-pošte.')
    return
  }
  if (!form.password || form.password.length < 6) {
    setError('Lozinka mora imati najmanje 6 karaktera.')
    return
  }
  if (form.password !== form.passwordConfirm) {
    setError('Lozinke se ne poklapaju.')
    return
  }
  if (!agree.value) {
    setError('Morate prihvatiti uslove korišćenja.')
    return
  }

  status.value = 'loading'

  try {
    const res = await $fetch<{ ok: boolean, user?: { name: string, email: string } }>('/api/register', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
      },
    })

    if (res.ok && res.user) {
      setUser(res.user)
      router.push('/auth/account')
    }
    else {
      throw new Error('Registracija nije uspela.')
    }
  }
  catch (e: any) {
    setError(e?.data?.statusMessage || e?.message || 'Došlo je do greške. Pokušajte ponovo.')
  }
}

// Password strength meter
const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const map = [
    { label: 'Prekratka', color: 'bg-coral' },
    { label: 'Slaba', color: 'bg-coral' },
    { label: 'Osrednja', color: 'bg-yellow' },
    { label: 'Dobra', color: 'bg-blue' },
    { label: 'Jaka', color: 'bg-mint' },
    { label: 'Vrlo jaka', color: 'bg-mint' },
  ]
  return { score, ...map[score] }
})
</script>

<template>
  <div class="bg-cream">
    <AppPageHeader title="Registracija" :breadcrumb-items="[{ label: 'Početna', to: '/' }, { label: 'Registracija' }]" />

    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
          <div class="mb-6 text-center">
            <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-mint/15">
              <Icon name="lucide:user-plus" class="size-8 text-mint" />
            </div>
            <h2 class="font-unbounded text-2xl font-bold text-navy">
              Kreirajte nalog
            </h2>
            <p class="mt-2 text-navy/60">
              Brza registracija - bez čekanja, bez potvrde emailom.
            </p>
          </div>

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

            <!-- Password -->
            <div>
              <AppInput
                id="password"
                v-model="form.password"
                label="Lozinka"
                type="password"
                show-password-toggle
                autocomplete="new-password"
                required
                placeholder="••••••••"
                :disabled="status === 'loading'"
              />

              <!-- Strength meter -->
              <div v-if="form.password" class="mt-2">
                <div class="flex gap-1">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="h-1.5 flex-1 rounded-full transition-colors"
                    :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-cloud/40'"
                  />
                </div>
                <p class="mt-1 text-xs text-navy/50">
                  Jačina lozinke: <span class="font-medium text-navy">{{ passwordStrength.label }}</span>
                </p>
              </div>
            </div>

            <!-- Confirm password -->
            <div>
              <AppInput
                id="passwordConfirm"
                v-model="form.passwordConfirm"
                label="Potvrdite lozinku"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                placeholder="••••••••"
                :disabled="status === 'loading'"
              />
              <p
                v-if="form.passwordConfirm && form.password !== form.passwordConfirm"
                class="mt-1.5 flex items-center gap-1 text-xs text-coral"
              >
                <Icon name="lucide:alert-circle" class="size-3.5" />
                Lozinke se ne poklapaju
              </p>
            </div>

            <!-- Terms -->
            <label class="flex items-start gap-3 text-sm text-navy/70">
              <input
                v-model="agree"
                type="checkbox"
                class="mt-0.5 size-4 rounded border-cloud text-blue focus:ring-blue/20"
                :disabled="status === 'loading'"
              >
              <span>
                Prihvatam
                <NuxtLink to="/legal/terms" class="font-medium text-blue hover:text-navy">uslove korišćenja</NuxtLink>
                i
                <NuxtLink to="/legal/privacy-policy" class="font-medium text-blue hover:text-navy">politiku privatnosti</NuxtLink>.
              </span>
            </label>

            <!-- Error -->
            <p v-if="status === 'error'" class="text-sm text-coral" role="alert">
              {{ errorMessage }}
            </p>

            <AppSubmitButton
              :loading="status === 'loading'"
              label="Registruj se"
              loading-label="Registracija..."
            />
          </form>

          <!-- Login link -->
          <p class="mt-6 text-center text-sm text-navy/60">
            Već imate nalog?
            <NuxtLink to="/auth/login" class="font-semibold text-blue transition-colors hover:text-navy">
              Prijavite se
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
