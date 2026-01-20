import { type FormEvent, useEffect, useRef, useState } from 'react'
import api from '../lib/api';

type Message = { id: string; role: 'user' | 'assistant'; content: string }

function mockAssistantReply(): string {
  // Very simple empathetic echo for demo
  const tips = [
    'thử hít thở sâu 4-7-8 trong 1 phút',
    'ghi lại 3 điều bạn biết ơn hôm nay',
    'đi dạo 5 phút để đổi không khí',
    'uống một ly nước và duỗi cơ nhẹ',
  ]
  const tip = tips[Math.floor(Math.random() * tips.length)]
  return `Mình hiểu cảm giác đó. Bạn không đơn độc đâu. Bạn có thể ${tip}. Bạn muốn kể thêm chứ?`
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')

    // Log AI Chat activity to server
    api.post('/users/log', { type: 'AI_CHAT' }).catch(err => console.error("Log activity error:", err));

    setTimeout(() => {
      const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: mockAssistantReply() }
      setMessages(m => [...m, reply])
    }, 400)
  }

  const suggestions = [
    "Mình đang stress vì học",
    "Mình mất động lực",
    "Mình khó ngủ"
  ]

  return (
    <div className="flex flex-col h-[70dvh] border rounded bg-white dark:bg-gray-900 dark:border-white-500">
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 dark:text-gray-300 text-sm">Hãy chia sẻ điều bạn đang trải qua. Mình sẽ lắng nghe.</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={
              'inline-block px-3 py-2 rounded max-w-[80%] ' +
              (m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white')
            }>
              {m.content}
            </span>
          </div>
        ))}
      </div>
      {messages.length === 0 && (
        <div className="p-3 border-t">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Gợi ý nhanh:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="px-3 py-1 text-sm border rounded bg-white text-black dark:bg-gray-300 dark:text-white dark:border-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2 bg-white dark:bg-gray-300 dark:text-white"
          placeholder="Nhập tin nhắn..."
        />
        <button className="px-3 py-2 rounded bg-blue-600 text-white">Gửi</button>
      </form>
    </div>
  )
}
