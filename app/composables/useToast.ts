interface Toast {
  id: number
  title: string
  description?: string
}

let counter = 0

export function useToast() {
  const toasts = useState<Toast[]>('app-toasts', () => [])

  function success(title: string, description?: string) {
    const id = ++counter
    toasts.value.push({ id, title, description })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }

  return { toasts, success }
}
