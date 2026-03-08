export const useNoeia = () => {
  const open = useState('noeia-open', () => false)
  const mode = useState<'ai' | 'todos' | 'quickstart'>('noeia-mode', () => 'ai')
  return { open, mode }
}
