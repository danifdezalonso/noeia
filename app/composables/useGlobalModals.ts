export const useGlobalModals = () => {
  const sessionModalOpen = useState('gm_session', () => false)
  const patientModalOpen = useState('gm_patient', () => false)
  const billModalOpen    = useState('gm_bill',    () => false)

  return { sessionModalOpen, patientModalOpen, billModalOpen }
}
