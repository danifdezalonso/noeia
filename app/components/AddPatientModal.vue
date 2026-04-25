<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '~/components/ui/dialog'


export interface NewPatient {
  name: string
  surname: string
  initials: string
  email: string
  phone: string
}

defineProps<{ existingPatients: { id: string; name: string }[] }>()
const emit = defineEmits<{ close: []; save: [p: NewPatient] }>()

const open = ref(true)
const form = reactive({ name: '', surname: '', email: '', phone: '' })
const errors = reactive({ name: '', surname: '' })

function handleClose() {
  open.value = false
  nextTick(() => emit('close'))
}

function save() {
  errors.name    = form.name.trim()    ? '' : 'Name is required'
  errors.surname = form.surname.trim() ? '' : 'Surname is required'
  if (errors.name || errors.surname) return

  emit('save', {
    name:     form.name.trim(),
    surname:  form.surname.trim(),
    initials: [form.name[0], form.surname[0]].filter(Boolean).join('').toUpperCase(),
    email:    form.email.trim(),
    phone:    form.phone.trim(),
  })
  handleClose()
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => !v && handleClose()">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>New Patient</DialogTitle>
        <p class="text-sm text-muted-foreground">Add the patient's basic information to get started.</p>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <Label class="text-sm font-medium mb-1.5 block">Name <span class="text-rose-500">*</span></Label>
            <Input v-model="form.name" placeholder="First name" :class="errors.name ? 'border-rose-300 focus-visible:ring-rose-300' : ''" @input="errors.name = ''" @keydown.enter="save" />
            <p v-if="errors.name" class="text-rose-500 text-xs mt-1">{{ errors.name }}</p>
          </div>
          <div>
            <Label class="text-sm font-medium mb-1.5 block">Surname <span class="text-rose-500">*</span></Label>
            <Input v-model="form.surname" placeholder="Last name" :class="errors.surname ? 'border-rose-300 focus-visible:ring-rose-300' : ''" @input="errors.surname = ''" @keydown.enter="save" />
            <p v-if="errors.surname" class="text-rose-500 text-xs mt-1">{{ errors.surname }}</p>
          </div>
        </div>

        <div>
          <Label class="text-sm font-medium mb-1.5 block">Email <span class="text-muted-foreground font-normal">(optional)</span></Label>
          <Input v-model="form.email" type="email" placeholder="patient@email.com" @keydown.enter="save" />
        </div>

        <div>
          <Label class="text-sm font-medium mb-1.5 block">Phone <span class="text-muted-foreground font-normal">(optional)</span></Label>
          <Input v-model="form.phone" type="tel" placeholder="+1 555 000 0000" @keydown.enter="save" />
        </div>
      </div>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline" @click="handleClose">Cancel</Button>
        </DialogClose>
        <Button @click="save">Add Patient</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
