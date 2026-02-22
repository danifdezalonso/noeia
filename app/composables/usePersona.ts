export type PersonaRole = 'doctor' | 'organization'

export interface Persona {
  role: PersonaRole
  name: string
  orgName: string
  avatarInitials: string
}

export const usePersona = () => {
  const persona = useState<Persona>('persona', () => ({
    role: 'doctor',
    name: 'Dr. Torres',
    orgName: '',
    avatarInitials: 'DT',
  }))

  function deriveInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('')
  }

  function setDoctor(name: string) {
    persona.value = {
      role: 'doctor',
      name,
      orgName: '',
      avatarInitials: deriveInitials(name) || 'DT',
    }
  }

  function setOrganization(adminName: string, orgName: string) {
    persona.value = {
      role: 'organization',
      name: adminName,
      orgName,
      avatarInitials: deriveInitials(orgName) || 'ORG',
    }
  }

  return { persona, setDoctor, setOrganization }
}
