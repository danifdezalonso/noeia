export interface OnboardingData {
  // Step 1
  full_name: string
  email: string
  dob: string
  // Step 2
  profile_picture: string | null
  description: string
  // Step 3
  specialty: string
  // Step 4
  contact_phone: string
  contact_phone_code: string
  contact_email: string
}

export const useOnboarding = () => {
  const data = useState<OnboardingData>('onboarding-data', () => ({
    full_name: '',
    email: '',
    dob: '',
    profile_picture: null,
    description: '',
    specialty: '',
    contact_phone: '',
    contact_phone_code: '+1',
    contact_email: '',
  }))

  const currentStep = useState<number>('onboarding-step', () => 1)
  const direction = useState<'forward' | 'backward'>('onboarding-dir', () => 'forward')

  const reset = () => {
    data.value = {
      full_name: '',
      email: '',
      dob: '',
      profile_picture: null,
      description: '',
      specialty: '',
      contact_phone: '',
      contact_phone_code: '+1',
      contact_email: '',
    }
    currentStep.value = 1
    direction.value = 'forward'
  }

  return { data, currentStep, direction, reset }
}
