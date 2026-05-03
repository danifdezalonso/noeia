<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Button } from '~/components/ui/button'
import { Alert, AlertDescription } from '~/components/ui/alert'

const props = defineProps<{
  title: string
  lastUpdated: string
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  /** Fired when the user clicks "He leído y entiendo" — parent should check the associated checkbox */
  'accept': []
}>()

function handleAccept() {
  emit('accept')
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent
      class="sm:max-w-2xl flex flex-col gap-0 p-0 overflow-hidden"
      style="max-height: min(90vh, 800px);"
    >
      <!-- ── Header ──────────────────────────────────────────────── -->
      <DialogHeader class="shrink-0 px-6 pt-6 pb-4 border-b">
        <DialogTitle class="text-lg font-semibold">{{ props.title }}</DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          Última actualización: {{ props.lastUpdated }}
        </DialogDescription>
      </DialogHeader>

      <!-- ── Scrollable body ────────────────────────────────────── -->
      <ScrollArea class="flex-1 min-h-0">
        <div class="px-6 py-5 space-y-5">
          <!-- Placeholder banner -->
          <Alert class="border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20">
            <Info class="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <AlertDescription class="text-amber-800 dark:text-amber-300 text-xs leading-snug">
              Documento de muestra. La versión definitiva será revisada por asesoría legal antes del lanzamiento.
            </AlertDescription>
          </Alert>

          <!-- Document content -->
          <div class="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
            <slot />
          </div>
        </div>
      </ScrollArea>

      <!-- ── Sticky footer ──────────────────────────────────────── -->
      <div class="shrink-0 border-t bg-background px-6 py-4">
        <Button class="w-full" @click="handleAccept">
          He leído y entiendo
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
