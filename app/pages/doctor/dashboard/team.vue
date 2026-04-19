<script setup lang="ts">
import {
  Mail, Phone, MapPin, Globe, Star, ExternalLink, MessageSquare,
} from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

interface ContactInfo {
  email: string
  phone: string
  location: string
  website?: string
}

interface Organization {
  name: string
  initials: string
  avatarColor: string
  description: string
  specialty: string
  contact: ContactInfo
  founded: string
  size: string
}

interface Professional {
  id: string
  name: string
  initials: string
  avatarColor: string
  title: string
  specialty: string
  description: string
  contact: ContactInfo
  rate: string
  rating: number
  yearsExperience: number
}

const organization: Organization = {
  name: 'Mindful Health Collective',
  initials: 'MH',
  avatarColor: 'bg-violet-600',
  specialty: 'Mental Health & Psychiatry',
  description: 'A multidisciplinary mental health clinic delivering evidence-based care across psychiatry, psychology, and allied health. We combine clinical rigour with compassionate practice to support individuals, families, and organisations through every stage of mental health recovery.',
  contact: {
    email: 'hello@mindfulhealth.com.au',
    phone: '+61 2 9876 5432',
    location: 'Sydney, NSW — Melbourne, VIC',
    website: 'mindfulhealth.com.au',
  },
  founded: '2014',
  size: '24 clinicians',
}

const professionals: Professional[] = [
  {
    id: 'p1',
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    avatarColor: 'bg-violet-500',
    title: 'Consultant Psychiatrist',
    specialty: 'Mood & Anxiety Disorders',
    description: 'Sarah specialises in complex mood disorders, treatment-resistant depression, and perinatal psychiatry. She integrates pharmacological and psychological approaches, with a particular interest in ketamine-assisted therapy.',
    contact: {
      email: 's.chen@mindfulhealth.com.au',
      phone: '+61 2 9876 5401',
      location: 'Sydney, NSW',
    },
    rate: '$380 / session',
    rating: 4.9,
    yearsExperience: 14,
  },
  {
    id: 'p2',
    name: 'Dr. James Whitfield',
    initials: 'JW',
    avatarColor: 'bg-sky-500',
    title: 'Clinical Psychologist',
    specialty: 'CBT & Trauma',
    description: 'James is a highly experienced clinical psychologist with expertise in cognitive behavioural therapy, EMDR, and schema therapy. He works primarily with adults presenting with PTSD, complex trauma, and personality difficulties.',
    contact: {
      email: 'j.whitfield@mindfulhealth.com.au',
      phone: '+61 2 9876 5402',
      location: 'Sydney, NSW',
    },
    rate: '$260 / session',
    rating: 4.8,
    yearsExperience: 11,
  },
  {
    id: 'p3',
    name: 'Dr. Ananya Patel',
    initials: 'AP',
    avatarColor: 'bg-emerald-500',
    title: 'General Practitioner',
    specialty: 'Mental Health GP',
    description: 'Ananya bridges primary and specialist care, providing mental health assessments, medication reviews, and care coordination for patients across the lifespan. She holds a FRACGP with additional qualifications in addiction medicine.',
    contact: {
      email: 'a.patel@mindfulhealth.com.au',
      phone: '+61 2 9876 5403',
      location: 'Melbourne, VIC',
    },
    rate: '$180 / session',
    rating: 4.7,
    yearsExperience: 9,
  },
  {
    id: 'p4',
    name: 'Dr. Lena Müller',
    initials: 'LM',
    avatarColor: 'bg-rose-500',
    title: 'Neuropsychologist',
    specialty: 'Cognitive Assessment',
    description: 'Lena conducts comprehensive neuropsychological assessments for ADHD, autism spectrum conditions, acquired brain injury, and neurodegenerative disorders. Her reports are widely used in NDIS planning and legal contexts.',
    contact: {
      email: 'l.muller@mindfulhealth.com.au',
      phone: '+61 2 9876 5404',
      location: 'Sydney, NSW',
    },
    rate: '$320 / session',
    rating: 4.9,
    yearsExperience: 12,
  },
  {
    id: 'p5',
    name: 'Dr. Marcus Webb',
    initials: 'MW',
    avatarColor: 'bg-amber-500',
    title: 'Psychotherapist',
    specialty: 'ACT & Mindfulness',
    description: 'Marcus draws on Acceptance and Commitment Therapy, mindfulness-based cognitive therapy, and somatic approaches to help clients build psychological flexibility and manage chronic stress, burnout, and life transitions.',
    contact: {
      email: 'm.webb@mindfulhealth.com.au',
      phone: '+61 2 9876 5405',
      location: 'Melbourne, VIC',
    },
    rate: '$220 / session',
    rating: 4.7,
    yearsExperience: 8,
  },
  {
    id: 'p6',
    name: 'Dr. Priya Nair',
    initials: 'PN',
    avatarColor: 'bg-teal-500',
    title: 'Child & Adolescent Psychiatrist',
    specialty: 'Child & Adolescent',
    description: 'Priya works with children and young people aged 4–25 presenting with ADHD, autism, anxiety, and early psychosis. She collaborates closely with families and schools to deliver coordinated, developmentally appropriate care.',
    contact: {
      email: 'p.nair@mindfulhealth.com.au',
      phone: '+61 2 9876 5406',
      location: 'Sydney, NSW',
    },
    rate: '$420 / session',
    rating: 5.0,
    yearsExperience: 16,
  },
]
</script>

<template>
  <div class="flex-1 overflow-y-auto bg-background">
    <div class="max-w-5xl mx-auto px-8 py-8 space-y-10">

      <!-- Page header -->
      <div>
        <h1 class="text-3xl font-bold text-foreground">Team</h1>
        <p class="text-muted-foreground mt-1 text-sm">Your organisation and its clinical professionals.</p>
      </div>

      <!-- ── Organisation card ─────────────────────────────────────────────── -->
      <div class="border border-border rounded-2xl bg-card overflow-hidden">
        <div class="px-8 py-7 flex gap-7 items-start">

          <!-- Avatar -->
          <div :class="['w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm', organization.avatarColor]">
            {{ organization.initials }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl font-bold text-foreground">{{ organization.name }}</h2>
                <p class="text-sm text-muted-foreground mt-0.5">{{ organization.specialty }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">Est. {{ organization.founded }}</span>
                <span class="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">{{ organization.size }}</span>
              </div>
            </div>

            <p class="text-sm text-muted-foreground mt-3 leading-relaxed max-w-2xl">{{ organization.description }}</p>

            <!-- Contact row -->
            <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <a :href="`mailto:${organization.contact.email}`" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail class="w-3.5 h-3.5 shrink-0" />
                {{ organization.contact.email }}
              </a>
              <span class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone class="w-3.5 h-3.5 shrink-0" />
                {{ organization.contact.phone }}
              </span>
              <span class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin class="w-3.5 h-3.5 shrink-0" />
                {{ organization.contact.location }}
              </span>
              <a v-if="organization.contact.website" :href="`https://${organization.contact.website}`" target="_blank" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Globe class="w-3.5 h-3.5 shrink-0" />
                {{ organization.contact.website }}
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Professionals ─────────────────────────────────────────────────── -->
      <section>
        <h2 class="text-base font-semibold text-foreground mb-4">Professionals</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="p in professionals"
            :key="p.id"
            class="border border-border rounded-xl bg-card p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
          >
            <!-- Top: avatar + name + rate -->
            <div class="flex items-start gap-4">
              <div :class="['w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white text-sm font-bold', p.avatarColor]">
                {{ p.initials }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-foreground truncate">{{ p.name }}</p>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ p.title }}</p>
                  </div>
                  <span class="shrink-0 text-xs font-semibold text-foreground bg-muted border border-border rounded-lg px-2.5 py-1">
                    {{ p.rate }}
                  </span>
                </div>
                <!-- Specialty tag + rating -->
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {{ p.specialty }}
                  </span>
                  <span class="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                    {{ p.rating.toFixed(1) }}
                  </span>
                  <span class="text-xs text-muted-foreground">· {{ p.yearsExperience }}y exp.</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-muted-foreground leading-relaxed line-clamp-3">{{ p.description }}</p>

            <!-- Contact + action -->
            <div class="flex items-center justify-between gap-3 pt-1 border-t border-border/60">
              <div class="flex items-center gap-4 min-w-0">
                <a :href="`mailto:${p.contact.email}`" class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors truncate">
                  <Mail class="w-3 h-3 shrink-0" />
                  <span class="truncate">{{ p.contact.email }}</span>
                </a>
                <span class="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <MapPin class="w-3 h-3 shrink-0" />
                  {{ p.contact.location }}
                </span>
              </div>
              <button class="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-accent transition-colors">
                <MessageSquare class="w-3 h-3" />
                Message
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>
