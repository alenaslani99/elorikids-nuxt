<script setup lang="ts">
useHead({
  title: 'Prijava - elorikids',
  meta: [
    { name: 'description', content: 'Prijavite se na svoj elorikids nalog da biste brže naručivali i pratili porudžbine.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const { setUser } = useAuth()
const router = useRouter()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
})

const { status, errorMessage, setError, reset, clearStale } = useFormStatus()
const submitted = ref(false)

const { emailRegex } = useValidation()

const emailError = computed(() => {
  if (!submitted.value) return ''
  if (!form.email.trim() || !emailRegex.test(form.email.trim())) return 'Unesite ispravnu adresu e-pošte.'
  return ''
})
const passwordError = computed(() =>
  submitted.value && (!form.password || form.password.length < 6) ? 'Lozinka mora imati najmanje 6 karaktera.' : '',
)

// Clear stale error state as soon as the user edits any field
watch(form, () => {
  if (submitted.value) submitted.value = false
  clearStale()
})

async function handleSubmit() {
  reset()
  submitted.value = true

  if (emailError.value || passwordError.value) {
    return
  }

  status.value = 'loading'

  try {
    const res = await $fetch<{ ok: boolean, user?: { name: string, email: string, isOwner?: boolean } }>('/api/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
      },
    })

    if (res.ok && res.user) {
      setUser(res.user)
      // Redirect to intended page or account
      const redirect = (route.query.redirect as string) || '/auth/account'
      router.push(redirect)
    }
    else {
      throw new Error('Neispravan email ili lozinka.')
    }
  }
  catch (e: any) {
    setError(e?.data?.statusMessage || e?.message || 'Došlo je do greške. Pokušajte ponovo.')
  }
}

// Prefill from query if redirected from register
if (route.query.email) {
  form.email = route.query.email as string
}
</script>

<template>
  <div class="bg-cream">
    <AppPageHeader title="Prijava" :breadcrumb-items="[{ label: 'Početna', to: '/' }, { label: 'Prijava' }]" />

    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
          <div class="mb-6 text-center">
            <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue/10">
              <Icon name="lucide:user" class="size-8 text-blue" />
            </div>
            <h2 class="font-unbounded text-2xl font-bold text-navy">
              Dobrodošli nazad!
            </h2>
            <p class="mt-2 text-navy/60">
              Prijavite se da biste brže naručivali i pratili porudžbine.
            </p>
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">
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
              :error="emailError"
            />

            <!-- Password -->
            <AppInput
              id="password"
              v-model="form.password"
              label="Lozinka"
              type="password"
              show-password-toggle
              autocomplete="current-password"
              required
              placeholder="••••••••"
              :disabled="status === 'loading'"
              :error="passwordError"
            />

            <!-- Remember me -->
            <div class="flex items-center text-sm">
              <label class="flex items-center gap-2 text-navy/60">
                <input id="remember" name="remember" type="checkbox" class="size-4 rounded border-cloud text-blue focus:ring-blue/20">
                Zapamti me
              </label>
            </div>

            <!-- Error (always reserved to avoid CLS) -->
            <p
              class="min-h-5 text-sm text-coral transition-opacity duration-200"
              :class="status === 'error' ? 'opacity-100' : 'opacity-0'"
              role="alert"
            >
              {{ errorMessage }}
            </p>

            <AppSubmitButton
              :loading="status === 'loading'"
              label="Prijavi se"
              loading-label="Prijava..."
            />
          </form>

          <!-- Register link -->
          <p class="mt-6 text-center text-sm text-navy/60">
            Nemate nalog?
            <NuxtLink to="/auth/register" class="font-semibold text-blue transition-colors hover:text-navy">
              Registrujte se
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
