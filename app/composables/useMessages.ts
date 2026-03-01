export interface ChatMessage {
  id: string
  from: 'me' | 'other'
  text: string
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read'
}

export interface Conversation {
  id: string
  name: string
  initials: string
  avatarBg: string
  avatarText: string
  online: boolean
  lastMessage: string
  lastTime: Date
  unread: number
  messages: ChatMessage[]
}

function t(h: number, m: number): Date {
  const d = new Date(); d.setHours(h, m, 0, 0); return d
}
function yesterday(h: number, m: number): Date {
  const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(h, m, 0, 0); return d
}

const seedConversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Sarah Johnson',
    initials: 'SJ',
    avatarBg: 'bg-rose-100',
    avatarText: 'text-rose-700',
    online: true,
    lastMessage: 'Should I bring my medication list?',
    lastTime: t(10, 30),
    unread: 0,
    messages: [
      { id: 'm1', from: 'other', text: 'Hi Dr. Torres, I have a question about my appointment.', timestamp: t(10, 12), status: 'read' },
      { id: 'm2', from: 'me',    text: "Of course, Sarah. What's on your mind?", timestamp: t(10, 13), status: 'read' },
      { id: 'm3', from: 'other', text: 'I need to reschedule my Thursday session. I have a work conflict that just came up.', timestamp: t(10, 15), status: 'read' },
      { id: 'm4', from: 'me',    text: "No problem at all — these things happen. When would work better for you this week?", timestamp: t(10, 17), status: 'read' },
      { id: 'm5', from: 'other', text: 'Would Friday at 3pm work?', timestamp: t(10, 18), status: 'read' },
      { id: 'm6', from: 'me',    text: "Friday at 3pm works perfectly. I've moved the session in the calendar — you should receive an updated confirmation shortly.", timestamp: t(10, 20), status: 'read' },
      { id: 'm7', from: 'other', text: 'Amazing, thank you so much! 🙏', timestamp: t(10, 21), status: 'read' },
      { id: 'm8', from: 'other', text: 'Quick question — should I bring my medication list to the Friday appointment?', timestamp: t(10, 30), status: 'read' },
    ],
  },
  {
    id: 'c2',
    name: 'Michael Brown',
    initials: 'MB',
    avatarBg: 'bg-sky-100',
    avatarText: 'text-sky-700',
    online: false,
    lastMessage: 'Thanks for the resources.',
    lastTime: yesterday(16, 45),
    unread: 0,
    messages: [
      { id: 'm1', from: 'me',    text: 'Hi Michael, I wanted to share a few reading resources related to what we discussed in our last session.', timestamp: yesterday(16, 10), status: 'read' },
      { id: 'm2', from: 'me',    text: "There's a good overview of CBT techniques for sleep anxiety on the NHS website, and I've also attached a short breathing exercise guide.", timestamp: yesterday(16, 11), status: 'read' },
      { id: 'm3', from: 'other', text: "Thanks for the resources. I'll have a look before our next session.", timestamp: yesterday(16, 45), status: 'read' },
    ],
  },
  {
    id: 'c3',
    name: 'Dr. Elena Voss',
    initials: 'EV',
    avatarBg: 'bg-primary/10',
    avatarText: 'text-primary',
    online: true,
    lastMessage: "I'll send over the session notes shortly.",
    lastTime: t(10, 30),
    unread: 2,
    messages: [
      { id: 'm1', from: 'me',    text: 'Good morning, Dr. Voss. Could you confirm your availability for the team meeting on Thursday?', timestamp: t(9, 15), status: 'read' },
      { id: 'm2', from: 'other', text: 'Of course! Thursday afternoon works perfectly for me.', timestamp: t(9, 20), status: 'read' },
      { id: 'm3', from: 'me',    text: "Great, we'll schedule it for 4pm. Also, could you forward the latest patient outcome reports when you get a chance?", timestamp: t(9, 22), status: 'read' },
      { id: 'm4', from: 'other', text: "Will do. I have a few sessions this morning but I'll get to it after lunch.", timestamp: t(9, 25), status: 'read' },
      { id: 'm5', from: 'other', text: "I'll send over the session notes shortly.", timestamp: t(10, 30), status: 'delivered' },
    ],
  },
  {
    id: 'c4',
    name: 'Dr. Marco Silva',
    initials: 'MS',
    avatarBg: 'bg-sky-100',
    avatarText: 'text-sky-700',
    online: false,
    lastMessage: 'Thanks for approving the leave request.',
    lastTime: yesterday(15, 45),
    unread: 0,
    messages: [
      { id: 'm1', from: 'other', text: 'Hi, I submitted a leave request for next Friday. Is that okay?', timestamp: yesterday(14, 30), status: 'read' },
      { id: 'm2', from: 'me',    text: "We've reviewed it and approved the request. No sessions are scheduled that day so it's all clear.", timestamp: yesterday(15, 10), status: 'read' },
      { id: 'm3', from: 'other', text: 'Thanks for approving the leave request.', timestamp: yesterday(15, 45), status: 'read' },
    ],
  },
]

export const useMessages = () => {
  const conversations = useState<Conversation[]>('msg-conversations', () => seedConversations)

  function selectConversation(id: string) {
    const c = conversations.value.find(c => c.id === id)
    if (c) c.unread = 0
  }

  function sendMessage(convId: string, text: string) {
    const c = conversations.value.find(c => c.id === convId)
    if (!c || !text.trim()) return
    c.messages.push({
      id: `m${Date.now()}`,
      from: 'me',
      text: text.trim(),
      timestamp: new Date(),
      status: 'sent',
    })
    c.lastMessage = text.trim()
    c.lastTime = new Date()
  }

  return { conversations, selectConversation, sendMessage }
}
