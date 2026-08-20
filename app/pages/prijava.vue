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

const status = ref<'idle' | 'loading' | 'error'>('idle')
const errorMessage = ref('')
const showPassword = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
    status.value = 'error'
    errorMessage.value = 'Unesite ispravnu adresu e-pošte.'
    return
  }
  if (!form.password || form.password.length < 6) {
    status.value = 'error'
    errorMessage.value = 'Lozinka mora imati najmanje 6 karaktera.'
    return
  }

  status.value = 'loading'

  try {
    const res = await $fetch<{ ok: boolean, user?: { name: string, email: string } }>('/api/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
      },
    })

    if (res.ok && res.user) {
      setUser(res.user)
      // Redirect to intended page or account
      const redirect = (route.query.redirect as string) || '/nalog'
      router.push(redirect)
    }
    else {
      throw new Error('Neispravan email ili lozinka.')
    }
  }
  catch (e: any) {
    status.value = 'error'
    errorMessage.value = e?.data?.statusMessage || e?.message || 'Došlo je do greške. Pokušajte ponovo.'
  }
}

// Prefill from query if redirected from register
if (route.query.email) {
  form.email = route.query.email as string
}
</script>

<template>
  <div class="bg-cream">
    <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppBreadcrumb :items="[{ label: 'Početna', to: '/' }, { label: 'Prijava' }]" nav-class="mb-4" />
        <h1 class="font-unbounded text-4xl font-extrabold text-navy md:text-5xl">
          Prijava
        </h1>
      </div>
    </section>

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
            <div>
              <label for="email" class="mb-1.5 block text-sm font-semibold text-navy">
                Adresa e-pošte
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                inputmode="email"
                autocomplete="email"
                required
                placeholder="marko@primer.rs"
                class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                :disabled="status === 'loading'"
              >
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="mb-1.5 block text-sm font-semibold text-navy">
                Lozinka
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••"
                  class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 pr-12 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                  :disabled="status === 'loading'"
                >
                <button
                  type="button"
                  :aria-label="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 transition-colors hover:text-navy"
                  @click="showPassword = !showPassword"
                >
                  <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="size-5" />
                </button>
              </div>
            </div>

            <!-- Forgot password -->
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-navy/60">
                <input type="checkbox" class="size-4 rounded border-cloud text-blue focus:ring-blue/20">
                Zapamti me
              </label>
              <NuxtLink to="/zaboravljena-lozinka" class="font-medium text-blue transition-colors hover:text-navy">
                Zaboravili ste lozinku?
              </NuxtLink>
            </div>

            <!-- Error -->
            <p v-if="status === 'error'" class="text-sm text-coral" role="alert">
              {{ errorMessage }}
            </p>

            <!-- Submit -->
            <button
              type="submit"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
              :disabled="status === 'loading'"
            >
              <Icon v-if="status === 'loading'" name="lucide:loader-2" class="size-5 animate-spin" />
              <span>{{ status === 'loading' ? 'Prijava...' : 'Prijavi se' }}</span>
            </button>
          </form>

          <!-- Register link -->
          <p class="mt-6 text-center text-sm text-navy/60">
            Nemate nalog?
            <NuxtLink to="/registracija" class="font-semibold text-blue transition-colors hover:text-navy">
              Registrujte se
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
