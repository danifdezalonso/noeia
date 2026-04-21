// ─── Static data ─────────────────────────────────────────────────────────────

export const COUNTRIES = [
  { name: 'Argentina',      flag: '🇦🇷' },
  { name: 'Australia',      flag: '🇦🇺' },
  { name: 'Brazil',         flag: '🇧🇷' },
  { name: 'Canada',         flag: '🇨🇦' },
  { name: 'Chile',          flag: '🇨🇱' },
  { name: 'Colombia',       flag: '🇨🇴' },
  { name: 'France',         flag: '🇫🇷' },
  { name: 'Germany',        flag: '🇩🇪' },
  { name: 'Ireland',        flag: '🇮🇪' },
  { name: 'Italy',          flag: '🇮🇹' },
  { name: 'Mexico',         flag: '🇲🇽' },
  { name: 'Netherlands',    flag: '🇳🇱' },
  { name: 'New Zealand',    flag: '🇳🇿' },
  { name: 'Portugal',       flag: '🇵🇹' },
  { name: 'South Africa',   flag: '🇿🇦' },
  { name: 'Spain',          flag: '🇪🇸' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States',  flag: '🇺🇸' },
]

export const LANGUAGES = [
  { name: 'English',    flag: '🇬🇧' },
  { name: 'Spanish',    flag: '🇪🇸' },
  { name: 'Portuguese', flag: '🇧🇷' },
  { name: 'French',     flag: '🇫🇷' },
  { name: 'German',     flag: '🇩🇪' },
  { name: 'Italian',    flag: '🇮🇹' },
  { name: 'Dutch',      flag: '🇳🇱' },
]

export const PHONE_PREFIXES = [
  { country: 'United States',  flag: '🇺🇸', code: '+1' },
  { country: 'United Kingdom', flag: '🇬🇧', code: '+44' },
  { country: 'Australia',      flag: '🇦🇺', code: '+61' },
  { country: 'Canada',         flag: '🇨🇦', code: '+1' },
  { country: 'Ireland',        flag: '🇮🇪', code: '+353' },
  { country: 'New Zealand',    flag: '🇳🇿', code: '+64' },
  { country: 'South Africa',   flag: '🇿🇦', code: '+27' },
  { country: 'Argentina',      flag: '🇦🇷', code: '+54' },
  { country: 'Brazil',         flag: '🇧🇷', code: '+55' },
  { country: 'Chile',          flag: '🇨🇱', code: '+56' },
  { country: 'Colombia',       flag: '🇨🇴', code: '+57' },
  { country: 'Mexico',         flag: '🇲🇽', code: '+52' },
  { country: 'France',         flag: '🇫🇷', code: '+33' },
  { country: 'Germany',        flag: '🇩🇪', code: '+49' },
  { country: 'Italy',          flag: '🇮🇹', code: '+39' },
  { country: 'Netherlands',    flag: '🇳🇱', code: '+31' },
  { country: 'Portugal',       flag: '🇵🇹', code: '+351' },
  { country: 'Spain',          flag: '🇪🇸', code: '+34' },
  { country: 'India',          flag: '🇮🇳', code: '+91' },
  { country: 'Japan',          flag: '🇯🇵', code: '+81' },
  { country: 'South Korea',    flag: '🇰🇷', code: '+82' },
  { country: 'Singapore',      flag: '🇸🇬', code: '+65' },
  { country: 'UAE',            flag: '🇦🇪', code: '+971' },
]

export const SPECIALTIES = [
  'Clinical Psychology',
  'Counselling Psychology',
  'Neuropsychology',
  'Health Psychology',
  'Forensic Psychology',
  'Child & Adolescent Psychology',
  'Cognitive Behavioural Therapy (CBT)',
  'Psychotherapy',
  'Psychiatry',
  'Sport & Exercise Psychology',
  'Occupational Psychology',
  'Educational Psychology',
  'Other',
]

export const ROLES = [
  'Individual clinician',
  'Clinical lead, department lead, head of...',
  'Executive team (CIO, CMIO, CEO etc.)',
  'Owner or practice manager',
]

export const TEAM_SIZES = ['Just me', '2–5', '6–20', '21–50', '51+']

// ─── Form state ───────────────────────────────────────────────────────────────

export interface OnboardingFormState {
  firstName: string
  lastName: string
  specialty: string[]
  role: string
  country: string
  language: string
  phone: string
  agreedToTerms: boolean
  orgName: string
  teamSize: string
}

export interface PhonePrefix {
  country: string
  flag: string
  code: string
}

// ─── Composable ───────────────────────────────────────────────────────────────

export const useOnboardingForm = () => {
  const form = useState<OnboardingFormState>('onboarding-form', () => ({
    firstName: '',
    lastName: '',
    specialty: [],
    role: '',
    country: '',
    language: '',
    phone: '',
    agreedToTerms: false,
    orgName: '',
    teamSize: '',
  }))

  const selectedPhonePrefix = useState<PhonePrefix>('onboarding-phone-prefix', () => PHONE_PREFIXES[0])

  // ─── Validation ─────────────────────────────────────────────────────────────

  function validateJoin(): { ok: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}
    let ok = true

    if (!form.value.firstName.trim()) { errors.firstName = 'Required'; ok = false }
    if (!form.value.lastName.trim()) { errors.lastName = 'Required'; ok = false }
    if (!form.value.country) { errors.country = 'Please select a country'; ok = false }
    if (!form.value.language) { errors.language = 'Please select a language'; ok = false }
    if (!form.value.agreedToTerms) { errors.terms = 'You must agree to the terms'; ok = false }

    return { ok, errors }
  }

  function validateOrg(): { ok: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}
    let ok = true

    if (!form.value.orgName.trim()) { errors.orgName = 'Required'; ok = false }
    if (!form.value.specialty.length) { errors.specialty = 'Required'; ok = false }
    if (!form.value.role) { errors.role = 'Please select a role'; ok = false }
    if (!form.value.teamSize) { errors.teamSize = 'Please select a team size'; ok = false }

    return { ok, errors }
  }

  return {
    form,
    selectedPhonePrefix,
    validateJoin,
    validateOrg,
  }
}
