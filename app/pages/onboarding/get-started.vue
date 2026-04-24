<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'

definePageMeta({
  layout: 'onboarding',
  pageTransition: { name: 'ob-slide', mode: 'out-in' },
})

const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')

useHead({ title: 'Get started — Noeia' })

function goToJoin() {
  direction.value = 'forward'
  navigateTo('/onboarding/join')
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-center px-8 py-10 max-w-lg mx-auto w-full">

    <!-- Back — top left, consistent with join & your-organisation -->
    <NuxtLink
      to="/login"
      class="inline-flex items-center gap-1.5 mb-7 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Back to login
    </NuxtLink>

    <!-- Heading -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground mb-1.5 leading-tight tracking-tight">
        Let's get you started
      </h1>
      <p class="text-sm text-muted-foreground leading-relaxed">
        How would you like to begin with Noeia?
      </p>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <!-- Jump right in -->
      <Card
        class="cursor-pointer border-border hover:border-primary/60 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        @click="goToJoin"
      >
        <CardContent class="p-6">
          <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-foreground mb-1.5">Jump right in</h3>
          <p class="text-xs text-muted-foreground leading-relaxed mb-4">
            Set up your profile and start using Noeia immediately.
          </p>
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            Get started
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </CardContent>
      </Card>

      <!-- Book a demo — coming soon -->
      <Card class="border-border bg-muted/40 opacity-60 cursor-not-allowed">
        <CardContent class="p-6 relative">
          <Badge variant="secondary" class="absolute top-4 right-4 text-[10px] font-semibold">
            Coming soon
          </Badge>
          <div class="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-muted-foreground mb-1.5">Book a demo</h3>
          <p class="text-xs text-muted-foreground leading-relaxed mb-4">
            Let our team walk you through everything Noeia can do.
          </p>
          <span class="text-xs font-semibold text-muted-foreground">
            Available soon
          </span>
        </CardContent>
      </Card>

    </div>
  </div>
</template>
