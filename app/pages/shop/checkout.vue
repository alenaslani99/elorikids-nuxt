<script setup lang="ts">
useHead({
    title: "Porudžbina - elorikids",
    meta: [
        {
            name: "description",
            content:
                "Završite porudžbinu - unesite podatke za dostavu i pošaljite porudžbinu. Plaćanje se vrši pri preuzimanju.",
        },
        { name: "robots", content: "noindex, nofollow" },
    ],
});

const { items, total, shipping, grandTotal, clear } = useCart();
const { getBook } = useBooks();
const { user } = useAuth();

const router = useRouter();

// Redirect to cart if empty
onMounted(() => {
    if (items.value.length === 0) {
        router.replace("/shop/cart");
    }
});

const form = reactive({
    name: "",
    phone: "",
    email: "",
    street: "",
    streetNumber: "",
    city: "",
    postal: "",
    note: "",
});

// Prefill name + email from the logged-in user's session.
// Only fills empty fields so the user's own edits are never overwritten.
watch(
    user,
    (u) => {
        if (!u) return;
        if (!form.name) form.name = u.name;
        if (!form.email) form.email = u.email;
    },
    { immediate: true },
);

const { status, errorMessage, setError, reset, clearStale } = useFormStatus();
const submitted = ref(false);

const {
    emailRegex,
    nameRegex,
    serbianPhoneRegex: phoneRegex,
    postalRegex,
    streetNumberRegex,
} = useValidation();

const nameError = computed(() =>
    submitted.value && (!form.name.trim() || !nameRegex.test(form.name.trim()))
        ? "Unesite ime i prezime (najmanje dve reči)."
        : "",
);
const phoneError = computed(() =>
    submitted.value &&
    (!form.phone.trim() || !phoneRegex.test(form.phone.trim()))
        ? "Format: +381 6X XXX XXXX"
        : "",
);
const emailError = computed(() => {
    if (!submitted.value) return "";
    if (!form.email.trim() || !emailRegex.test(form.email.trim()))
        return "Unesite ispravnu adresu e-pošte.";
    return "";
});
const streetError = computed(() =>
    submitted.value && !form.street.trim() ? "Unesite ulicu." : "",
);
const streetNumberError = computed(() => {
    if (!submitted.value) return "";
    if (!form.streetNumber.trim()) return "Unesite broj.";
    if (!streetNumberRegex.test(form.streetNumber.trim()))
        return "Format: broj, broj/broj ili BB.";
    return "";
});
const cityError = computed(() =>
    submitted.value && !form.city.trim() ? "Unesite grad." : "",
);
const postalError = computed(() =>
    submitted.value &&
    (!form.postal.trim() || !postalRegex.test(form.postal.trim()))
        ? "5 cifara, ne može početi nulom."
        : "",
);
const noteError = computed(() => {
    const trimmed = form.note.trim();
    if (submitted.value && trimmed && trimmed.length < 10)
        return "Napomena mora imati najmanje 10 karaktera.";
    if (trimmed.length > 500)
        return "Napomena je preduga (maksimum 500 karaktera).";
    return "";
});

// Clear stale error state as soon as the user edits any field
watch(form, () => {
    if (submitted.value) submitted.value = false;
    clearStale();
});

async function handleSubmit() {
    reset();
    submitted.value = true;

    if (
        nameError.value ||
        phoneError.value ||
        emailError.value ||
        streetError.value ||
        streetNumberError.value ||
        cityError.value ||
        postalError.value ||
        noteError.value
    ) {
        return;
    }

    status.value = "loading";

    try {
        const res = await $fetch<{ ok: boolean; orderId?: string }>(
            "/api/order",
            {
                method: "POST",
                body: {
                    customer: {
                        name: form.name,
                        phone: form.phone,
                        email: form.email,
                        street: form.street,
                        streetNumber: form.streetNumber,
                        city: form.city,
                        postal: form.postal,
                        note: form.note,
                    },
                    items: items.value.map((i) => ({
                        slug: i.slug,
                        title: i.title,
                        price: i.price,
                        quantity: i.quantity,
                    })),
                },
            },
        );

        if (res.ok) {
            clear();
            status.value = "success";
            router.push(`/shop/thank-you?id=${res.orderId ?? ""}`);
        } else {
            throw new Error("Nepoznata greška");
        }
    } catch (e: any) {
        setError(
            e?.data?.statusMessage ||
                e?.message ||
                "Došlo je do greške. Pokušajte ponovo.",
        );
    }
}
</script>

<template>
    <div class="bg-cream">
        <AppPageHeader
            title="Podaci za dostavu"
            subtitle="Popunite podatke ispod i mi ćemo vas kontaktirati radi potvrde porudžbine. Plaćanje se vrši pri preuzimanju."
            :breadcrumb-items="[
                { label: 'Početna', to: '/' },
                { label: 'Korpa', to: '/shop/cart' },
                { label: 'Porudžbina' },
            ]"
        />

        <section class="py-12 lg:py-16">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="grid gap-10 lg:grid-cols-5 lg:gap-12">
                    <!-- Form -->
                    <div class="lg:col-span-3">
                        <div
                            class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm"
                        >
                            <h2
                                class="font-unbounded mb-2 text-2xl font-bold text-navy"
                            >
                                Vaši podaci
                            </h2>
                            <p class="mb-6 text-navy/60">
                                Sva polja sa * su obavezna.
                            </p>

                            <form
                                class="space-y-5"
                                @submit.prevent="handleSubmit"
                            >
                                <!-- Name -->
                                <AppInput
                                    id="name"
                                    v-model="form.name"
                                    label="Ime i prezime *"
                                    type="text"
                                    autocomplete="name"
                                    placeholder="Marko Marković"
                                    :disabled="status === 'loading'"
                                    :error="nameError"
                                    capitalize
                                />

                                <!-- Phone + Email -->
                                <div class="grid gap-5 sm:grid-cols-2">
                                    <AppInput
                                        id="phone"
                                        v-model="form.phone"
                                        label="Telefon *"
                                        type="tel"
                                        inputmode="tel"
                                        autocomplete="tel"
                                        placeholder="+381 60 123 4567"
                                        :disabled="status === 'loading'"
                                        :error="phoneError"
                                    />
                                    <AppInput
                                        id="email"
                                        v-model="form.email"
                                        label="E-pošta *"
                                        type="email"
                                        inputmode="email"
                                        autocomplete="email"
                                        placeholder="marko@primer.rs"
                                        :disabled="status === 'loading'"
                                        :error="emailError"
                                    />
                                </div>

                                <!-- Street + Number -->
                                <div
                                    class="grid gap-5 sm:grid-cols-[1fr_140px]"
                                >
                                    <AppInput
                                        id="street"
                                        v-model="form.street"
                                        label="Ulica *"
                                        type="text"
                                        autocomplete="address-line1"
                                        placeholder="Bulevar Oslobodjenja"
                                        :disabled="status === 'loading'"
                                        :error="streetError"
                                        capitalize
                                    />
                                    <AppInput
                                        id="streetNumber"
                                        v-model="form.streetNumber"
                                        label="Broj *"
                                        type="text"
                                        autocomplete="address-line2"
                                        inputmode="text"
                                        placeholder="13, 66/10, BB"
                                        :disabled="status === 'loading'"
                                        :error="streetNumberError"
                                    />
                                </div>

                                <!-- City + Postal -->
                                <div class="grid gap-5 sm:grid-cols-2">
                                    <AppInput
                                        id="city"
                                        v-model="form.city"
                                        label="Grad *"
                                        type="text"
                                        autocomplete="address-level2"
                                        placeholder="Novi Sad"
                                        :disabled="status === 'loading'"
                                        :error="cityError"
                                        capitalize
                                    />
                                    <AppInput
                                        id="postal"
                                        v-model="form.postal"
                                        label="Poštanski broj *"
                                        type="text"
                                        inputmode="numeric"
                                        autocomplete="postal-code"
                                        placeholder="21000"
                                        :error="postalError"
                                    />
                                </div>

                                <!-- Note -->
                                <AppTextarea
                                    id="note"
                                    v-model="form.note"
                                    label="Napomena (opciono)"
                                    :rows="3"
                                    :max-length="500"
                                    placeholder="Npr. pozvoni pre dostave, podatci o detetu..."
                                    :disabled="status === 'loading'"
                                    :error="noteError"
                                />

                                <!-- Error + submit: error overlays the gap so no extra reserved block is needed -->
                                <div class="relative">
                                    <AppSubmitButton
                                        :loading="status === 'loading'"
                                        label="Naruči"
                                        loading-label="Slanje porudžbine..."
                                    />
                                    <!-- Inline error (absolute so it overlays without taking flow space → no layout shift, no extra padding) -->
                                    <p
                                        class="absolute left-0 top-full flex items-center justify-center gap-1 pt-1 text-sm text-coral transition-opacity duration-200"
                                        :class="
                                            status === 'error'
                                                ? 'opacity-100'
                                                : 'opacity-0 pointer-events-none'
                                        "
                                        role="alert"
                                    >
                                        <Icon
                                            name="lucide:alert-circle"
                                            class="size-4 shrink-0"
                                        />
                                        <span>{{
                                            errorMessage || "\u00A0"
                                        }}</span>
                                    </p>
                                </div>

                                <p class="text-center text-sm text-navy/50">
                                    Plaćanje se vrši pouzećem (pouzeće) pri
                                    preuzimanju.
                                </p>
                            </form>
                        </div>
                    </div>

                    <!-- Order summary -->
                    <div class="lg:col-span-2">
                        <div class="lg:sticky lg:top-32">
                            <div
                                class="rounded-3xl border-2 border-cloud/40 bg-white p-6 shadow-sm"
                            >
                                <h2
                                    class="font-unbounded mb-6 text-xl font-bold text-navy"
                                >
                                    Vaša porudžbina
                                </h2>

                                <!-- Items -->
                                <ul class="space-y-4">
                                    <li
                                        v-for="item in items"
                                        :key="item.slug"
                                        class="flex items-center gap-4"
                                    >
                                        <NuxtLink
                                            :to="`/books/${item.slug}`"
                                            class="shrink-0"
                                        >
                                            <div
                                                class="overflow-hidden rounded-lg"
                                            >
                                                <NuxtImg
                                                    :src="`/${getBook(item.slug)?.img ?? ''}`"
                                                    :alt="item.title"
                                                    class="h-16 w-14 object-cover"
                                                    width="56"
                                                    height="64"
                                                    format="webp"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </NuxtLink>
                                        <div class="min-w-0 flex-1">
                                            <p
                                                class="truncate font-semibold text-navy"
                                            >
                                                {{ item.title }}
                                            </p>
                                            <p class="text-sm text-navy/50">
                                                {{ item.quantity }} ×
                                                {{
                                                    item.price.toLocaleString(
                                                        "sr-RS",
                                                    )
                                                }}
                                                RSD
                                            </p>
                                        </div>
                                        <span class="font-semibold text-navy">
                                            {{
                                                (
                                                    item.price * item.quantity
                                                ).toLocaleString("sr-RS")
                                            }}
                                        </span>
                                    </li>
                                </ul>

                                <div class="my-5 border-t border-cloud/40" />

                                <!-- Totals -->
                                <AppOrderTotals
                                    :total="total"
                                    :shipping="shipping"
                                    :grand-total="grandTotal"
                                />

                                <div
                                    class="mt-6 flex items-start gap-3 rounded-2xl bg-sky/20 p-4 text-sm text-navy/70"
                                >
                                    <Icon
                                        name="lucide:info"
                                        class="size-5 shrink-0 text-blue"
                                    />
                                    <span
                                        >Nakon slanja porudžbine javićemo vam se
                                        telefonom ili emailom radi potvrde.
                                        Plaćanje pri preuzimanju.</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
