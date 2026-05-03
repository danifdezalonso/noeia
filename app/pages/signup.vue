<script setup lang="ts">
import { Eye, EyeOff, Stethoscope } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import LegalDocumentDialog from '~/components/LegalDocumentDialog.vue'

definePageMeta({ layout: false })

const fullName     = ref('')
const email        = ref('')
const password     = ref('')
const showPassword = ref(false)
const role         = ref<'doctor' | 'organization'>('doctor')
const loading      = ref(false)

// ── Legal consent ─────────────────────────────────────────────────────────────
const agreedTerms    = ref(false)
const agreedDPA      = ref(false)
const marketingOptIn = ref(false)

const termsOpen = ref(false)
const dpaOpen   = ref(false)

const canSubmit = computed(() => agreedTerms.value && agreedDPA.value)

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSignUp() {
  if (!canSubmit.value) return
  loading.value = true
  const path = role.value === 'organization' ? '/onboarding/organization' : '/onboarding/doctor'
  await navigateTo(path)
  loading.value = false
}
</script>

<template>
  <div class="min-h-screen flex bg-background">

    <!-- ── Left brand panel ──────────────────────────────────────────────── -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-sidebar flex-col overflow-hidden border-r border-border">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <div class="absolute top-1/4 left-1/3 w-[480px] h-[480px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />

      <div class="relative flex flex-col h-full px-10 py-10">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
          </div>
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-6 dark:hidden" />
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-6 hidden dark:block" />
        </NuxtLink>

        <div class="flex-1 flex flex-col justify-center max-w-sm">
          <h1 class="text-4xl font-bold tracking-tight text-foreground leading-tight">
            Tu consulta,<br />
            <span class="text-primary">potenciada</span> por IA.
          </h1>
          <p class="mt-4 text-base text-muted-foreground leading-relaxed">
            Únete a miles de profesionales que usan Noeia para automatizar la documentación clínica y dedicar más tiempo a sus pacientes.
          </p>
          <div class="mt-8 grid grid-cols-3 gap-4">
            <div v-for="stat in [{ value: '10k+', label: 'Clínicos' }, { value: '2M+', label: 'Sesiones' }, { value: '60%', label: 'Menos admin' }]" :key="stat.label">
              <p class="text-2xl font-bold text-foreground">{{ stat.value }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-border pt-8">
          <blockquote class="text-sm text-muted-foreground leading-relaxed italic">
            "Configurar nuestra clínica en Noeia llevó menos de un día. Los resúmenes de IA nos ahorran 20 horas a la semana."
          </blockquote>
          <div class="mt-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Stethoscope class="w-4 h-4 text-primary" />
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">Dr. Carlos Méndez</p>
              <p class="text-xs text-muted-foreground">Psiquiatra · Salud Mental Centro</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right form panel ──────────────────────────────────────────────── -->
    <div class="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-10">
      <div class="w-full max-w-sm">

        <!-- Mobile logo -->
        <div class="mb-8 flex justify-center lg:hidden">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
            </div>
            <img src="/Noeia_logo.svg" alt="Noeia" class="h-6 dark:hidden" />
            <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-6 hidden dark:block" />
          </NuxtLink>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold tracking-tight text-foreground">Crea tu cuenta</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">Empieza gratis, sin tarjeta de crédito.</p>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleSignUp">
          <div class="space-y-1.5">
            <Label for="full-name">Nombre completo</Label>
            <Input id="full-name" v-model="fullName" type="text" placeholder="Dra. Ana García" autocomplete="name" required />
          </div>

          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="tú@clinica.com" autocomplete="email" required />
          </div>

          <div class="space-y-1.5">
            <Label for="password">Contraseña</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mín. 8 caracteres"
                autocomplete="new-password"
                required
                class="pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Role selector -->
          <div class="space-y-1.5">
            <Label>Soy</Label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="r in [{ id: 'doctor', label: 'Psicólogo/a', desc: 'Práctica independiente' }, { id: 'organization', label: 'Organización', desc: 'Clínica o red' }]"
                :key="r.id"
                type="button"
                class="flex flex-col items-start gap-0.5 px-4 py-3 rounded-lg border text-left transition-all"
                :class="role === r.id
                  ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/30'
                  : 'border-border hover:border-primary/40 hover:bg-accent text-foreground'"
                @click="role = r.id as 'doctor' | 'organization'"
              >
                <span class="text-sm font-semibold">{{ r.label }}</span>
                <span class="text-[11px] text-muted-foreground">{{ r.desc }}</span>
              </button>
            </div>
          </div>

          <!-- ── Legal consent checkboxes ──────────────────────────────── -->
          <fieldset class="space-y-3 pt-1">
            <legend class="sr-only">Consentimiento legal</legend>

            <!-- 1. Términos y Condiciones (obligatorio) -->
            <div class="flex items-start gap-3">
              <Checkbox
                id="terms"
                :checked="agreedTerms"
                aria-required="true"
                class="mt-0.5 shrink-0"
                @update:checked="(v) => { agreedTerms = v === true }"
              />
              <label
                for="terms"
                class="text-sm text-foreground leading-snug cursor-pointer select-none"
              >
                He leído y acepto los
                <button
                  type="button"
                  class="text-primary hover:text-primary/80 font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  @click.stop="termsOpen = true"
                >
                  Términos y Condiciones</button>.
              </label>
            </div>

            <!-- 2. DPA (obligatorio) -->
            <div class="flex items-start gap-3">
              <Checkbox
                id="dpa"
                :checked="agreedDPA"
                aria-required="true"
                aria-describedby="dpa-helper"
                class="mt-0.5 shrink-0"
                @update:checked="(v) => { agreedDPA = v === true }"
              />
              <div class="space-y-0.5">
                <label
                  for="dpa"
                  class="text-sm text-foreground leading-snug cursor-pointer select-none"
                >
                  He leído y acepto el
                  <button
                    type="button"
                    class="text-primary hover:text-primary/80 font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    @click.stop="dpaOpen = true"
                  >
                    Contrato de Encargo de Tratamiento</button>.
                </label>
                <p id="dpa-helper" class="text-[11px] text-muted-foreground leading-snug">
                  Necesario para tratar datos de pacientes según el RGPD.
                </p>
              </div>
            </div>

            <!-- 3. Marketing (opcional, visualmente diferenciado) -->
            <div class="flex items-start gap-3 pt-2 border-t border-border/60 mt-1">
              <Checkbox
                id="marketing"
                :checked="marketingOptIn"
                class="mt-0.5 shrink-0"
                @update:checked="(v) => { marketingOptIn = v === true }"
              />
              <label
                for="marketing"
                class="text-[12px] text-muted-foreground font-normal leading-snug cursor-pointer select-none"
              >
                Quiero recibir novedades del producto y recursos clínicos por email.
              </label>
            </div>
          </fieldset>

          <!-- Submit — disabled until both mandatory boxes are checked -->
          <Button type="submit" class="w-full" :disabled="loading || !canSubmit">
            {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
          </Button>
        </form>

        <p class="mt-8 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?
          <NuxtLink to="/login" class="text-primary hover:text-primary/80 font-semibold transition-colors ml-1">
            Inicia sesión
          </NuxtLink>
        </p>
      </div>
    </div>

    <!-- ══ Términos y Condiciones dialog ════════════════════════════════════ -->
    <LegalDocumentDialog
      title="Términos y Condiciones"
      last-updated="1 de mayo de 2026"
      :open="termsOpen"
      @update:open="termsOpen = $event"
      @accept="agreedTerms = true"
    >
      <h2>1. Aceptación de los términos</h2>
      <p>Al crear una cuenta en Noeia y hacer clic en «Crear cuenta», aceptas quedar vinculado por estos Términos y Condiciones. Si actúas en nombre de una organización, declaras tener autoridad para aceptarlos en su nombre.</p>
      <p>Si no estás de acuerdo con alguno de estos términos, no debes utilizar el servicio.</p>

      <h2>2. Descripción del servicio</h2>
      <p>Noeia es una plataforma SaaS de gestión clínica para profesionales de la salud mental. Ofrece agenda, expediente clínico, facturación, transcripción de sesiones asistida por IA y generación de notas estructuradas.</p>
      <p>Nos reservamos el derecho de modificar, suspender o discontinuar funcionalidades con aviso previo razonable.</p>

      <h2>3. Cuenta de usuario y responsabilidades</h2>
      <p>Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta. Debes notificarnos de inmediato ante cualquier uso no autorizado.</p>
      <p>Toda la información que proporciones al registrarte debe ser veraz, completa y actualizada.</p>

      <h2>4. Uso aceptable</h2>
      <p>Te comprometes a utilizar el servicio únicamente para fines lícitos y de conformidad con la legislación aplicable. Queda prohibido usar Noeia para actividades fraudulentas, difamar a terceros o intentar acceder de forma no autorizada a los sistemas de la plataforma.</p>
      <p>El uso clínico es exclusivo para profesionales habilitados según la legislación de su territorio.</p>

      <h2>5. Propiedad intelectual</h2>
      <p>Todos los derechos sobre el software, diseño, marca y contenidos propios de Noeia pertenecen a Noeia Technologies S.L. Nada en estos términos te transfiere dichos derechos.</p>
      <p>Los datos clínicos y notas que generes son de tu propiedad; Noeia los trata únicamente como encargado del tratamiento.</p>

      <h2>6. Suscripción y pagos</h2>
      <p>El acceso al servicio está sujeto al plan contratado. Los detalles sobre precios, ciclos de facturación y condiciones de cancelación se establecen en el plan seleccionado y en el contrato de suscripción correspondiente.</p>
      <p>Los precios pueden revisarse con un preaviso mínimo de 30 días.</p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>En la medida en que lo permita la legislación aplicable, Noeia no será responsable de daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del servicio.</p>
      <p>Noeia no sustituye el juicio clínico. Las funciones de IA son herramientas de apoyo y no deben interpretarse como diagnóstico médico.</p>

      <h2>8. Modificaciones del servicio</h2>
      <p>Podemos actualizar estos términos periódicamente. Te notificaremos por email con al menos 15 días de antelación ante cambios materiales. El uso continuado tras la entrada en vigor implica aceptación.</p>

      <h2>9. Terminación</h2>
      <p>Puedes cancelar tu cuenta desde la configuración en cualquier momento. Noeia puede suspender cuentas que incumplan estos términos, previa notificación salvo en casos de infracción grave.</p>
      <p>Tras la cancelación, tus datos se conservan 30 días para exportarlos; después se eliminan conforme a nuestra política de retención.</p>

      <h2>10. Legislación aplicable y jurisdicción</h2>
      <p>Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Madrid, renunciando a cualquier otro fuero que pudiera corresponderles.</p>
      <p><em>Última actualización: 1 de mayo de 2026.</em></p>
    </LegalDocumentDialog>

    <!-- ══ DPA dialog ════════════════════════════════════════════════════════ -->
    <LegalDocumentDialog
      title="Contrato de Encargo de Tratamiento"
      last-updated="1 de mayo de 2026"
      :open="dpaOpen"
      @update:open="dpaOpen = $event"
      @accept="agreedDPA = true"
    >
      <h2>1. Objeto del contrato</h2>
      <p>El presente contrato regula las condiciones bajo las cuales Noeia Technologies S.L. («encargado del tratamiento») trata datos personales por cuenta del profesional o la organización («responsable del tratamiento»), en el marco de la prestación del servicio Noeia, de conformidad con el artículo 28 del RGPD y la LOPDGDD.</p>

      <h2>2. Identificación de las partes</h2>
      <p><strong>Responsable del tratamiento:</strong> el profesional o la entidad clínica que suscribe este contrato al registrarse en Noeia, responsable de los datos personales de sus pacientes.</p>
      <p><strong>Encargado del tratamiento:</strong> Noeia Technologies S.L., que actúa exclusivamente según las instrucciones del responsable en el tratamiento de los datos de pacientes.</p>

      <h2>3. Naturaleza y finalidad del tratamiento</h2>
      <p>El tratamiento consiste en el almacenamiento, procesamiento y análisis de datos de pacientes introducidos por el responsable o generados durante el uso de la plataforma, con la finalidad de facilitar la gestión clínica, la documentación de sesiones y la facturación.</p>
      <p>Noeia no utiliza los datos de pacientes con fines comerciales propios ni los cede a terceros no autorizados.</p>

      <h2>4. Tipos de datos personales tratados</h2>
      <p>Se tratan datos de categoría especial según el artículo 9 del RGPD, incluyendo datos relativos a la salud: historiales clínicos, notas de sesión, transcripciones de audio, diagnósticos de trabajo y tratamientos. También se tratan datos identificativos básicos (nombre, fecha de nacimiento, contacto).</p>

      <h2>5. Categorías de interesados</h2>
      <p>Los interesados son los pacientes del responsable del tratamiento, personas físicas cuyo tratamiento tiene una base jurídica lícita en el contexto de su atención clínica.</p>

      <h2>6. Obligaciones del encargado (Noeia) — Art. 28 RGPD</h2>
      <p>Noeia se compromete a: tratar los datos únicamente según instrucciones documentadas del responsable; garantizar la confidencialidad del personal con acceso a los datos; implementar las medidas de seguridad exigidas por el artículo 32 RGPD; asistir al responsable ante solicitudes de derechos de los interesados; y no subcontratar otros encargados sin autorización previa del responsable.</p>

      <h2>7. Medidas técnicas y organizativas de seguridad</h2>
      <p>Noeia aplica: cifrado en tránsito (TLS 1.2+) y en reposo (AES-256); control de acceso por roles y autenticación multifactor; copias de seguridad cifradas; y registros de auditoría de accesos a datos de salud.</p>
      <p>Las medidas se revisan periódicamente conforme a estándares del sector (ISO 27001, ENS).</p>

      <h2>8. Subencargados</h2>
      <p>Noeia puede recurrir a proveedores de infraestructura cloud para la prestación del servicio, sujetos a obligaciones equivalentes a las de este contrato. El responsable autoriza genéricamente esta subcontratación y Noeia informará de cualquier cambio relevante con antelación suficiente.</p>

      <h2>9. Transferencias internacionales</h2>
      <p>Cuando el tratamiento implique transferencias fuera del Espacio Económico Europeo, Noeia garantizará que se realicen bajo las garantías previstas en el RGPD (decisiones de adecuación, cláusulas contractuales tipo u otras), informando al responsable de cualquier transferencia que afecte a sus datos.</p>

      <h2>10. Devolución o destrucción de datos al finalizar el contrato</h2>
      <p>Tras la terminación contractual, el responsable dispondrá de 30 días para exportar sus datos a través de las herramientas de la plataforma. Transcurrido ese plazo, Noeia procederá a la supresión segura de los datos, salvo que la legislación exija su conservación.</p>

      <h2>11. Auditoría y colaboración con el responsable</h2>
      <p>Noeia facilitará al responsable toda la información necesaria para demostrar el cumplimiento del artículo 28 RGPD y permitirá auditorías con preaviso razonable, sin perjuicio de la confidencialidad de la infraestructura.</p>

      <h2>12. Notificación de brechas de seguridad</h2>
      <p>Ante una brecha que afecte a datos personales, Noeia notificará al responsable sin dilación y en todo caso en el plazo máximo de 72 horas desde su detección, facilitando la información necesaria para que el responsable pueda cumplir con sus obligaciones ante la AEPD cuando corresponda.</p>
      <p><em>Última actualización: 1 de mayo de 2026.</em></p>
    </LegalDocumentDialog>

  </div>
</template>
