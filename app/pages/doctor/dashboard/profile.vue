<script setup lang="ts">
import { Eye, Pencil } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge }   from '~/components/ui/badge'
import { Button }  from '~/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '~/components/ui/tooltip'

definePageMeta({ layout: 'dashboard' })

const orgName  = 'MindCare Clinics'
const activeTab = ref('public')
const editMode  = ref(false)

const publicTabRef = ref<{ openPreview: () => void } | null>(null)
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-6 max-w-[1100px]">

      <!-- Page title -->
      <div>
        <h1 class="text-2xl font-bold text-foreground tracking-tight">Mi perfil</h1>
        <p class="text-xs text-muted-foreground mt-1">
          Estás editando tu perfil en {{ orgName }}.
          Para editar tu perfil en otra organización, cámbiala desde la barra lateral.
        </p>
      </div>

      <!-- Profile header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <Avatar class="size-20 shrink-0">
            <AvatarImage :src="avatarUrl('Elena Voss Martínez')" alt="Elena Voss Martínez" />
            <AvatarFallback class="bg-primary/10 text-primary font-bold text-2xl">EV</AvatarFallback>
          </Avatar>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-xl font-bold text-foreground tracking-tight">Elena Voss</h2>
              <Badge variant="secondary" class="text-xs font-medium">Psicóloga</Badge>
            </div>
            <p class="text-sm text-muted-foreground">Psicóloga Clínica · Terapeuta EMDR</p>

            <!-- Read-only status — admin-controlled -->
            <TooltipProvider :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <div class="flex items-center gap-2 w-fit cursor-default">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span class="text-sm text-emerald-600 dark:text-emerald-400">
                      Activo en {{ orgName }}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" class="max-w-[220px] text-xs leading-relaxed">
                  Tu estado en esta organización lo gestiona el administrador.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="outline" size="sm" class="gap-1.5" @click="publicTabRef?.openPreview()">
            <Eye class="w-3.5 h-3.5" />
            Vista previa pública
          </Button>
          <Button variant="outline" size="sm" class="gap-1.5" @click="editMode = !editMode">
            <Pencil class="w-3.5 h-3.5" />
            {{ editMode ? 'Cancelar edición' : 'Editar perfil' }}
          </Button>
        </div>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList class="w-full justify-start">
          <TabsTrigger value="public">Perfil público</TabsTrigger>
          <TabsTrigger value="internal">Información interna</TabsTrigger>
        </TabsList>

        <TabsContent value="public" class="mt-6">
          <MePublicProfileTab ref="publicTabRef" :edit-mode="editMode" :org-name="orgName" />
        </TabsContent>
        <TabsContent value="internal" class="mt-6">
          <MeInternalInfoTab :org-name="orgName" />
        </TabsContent>
      </Tabs>

    </div>
  </div>
</template>
