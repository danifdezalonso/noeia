export const useNoeia = () => {
  const open = useState('noeia-open', () => false)
  return { open }
}
