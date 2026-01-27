import { type FormEvent, useEffect, useRef, useState } from 'react'
import api, { startChat, sendChatMessage, getChatHistory, clearChatHistory } from '../lib/api';

type Message = { id: string; role: 'user' | 'assistant'; content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to load history
        try {
          const history = await getChatHistory();
          // Check if history is an array
          if (Array.isArray(history) && history.length > 0) {
            const formattedMessages: Message[] = history.map((m: any) => ({
              id: m._id || crypto.randomUUID(),
              role: m.role,
              content: m.content
            }));
            setMessages(formattedMessages);
            return;
          }
        } catch (e) {
          console.error("Failed to load history", e);
        }

        // If no history, start new chat
        const data = await startChat()
        const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.message }
        setMessages([aiMsg])
      } catch (err) {
        console.error('Error starting chat:', err)
        setError('Không thể khởi tạo cuộc trò chuyện. Vui lòng thử lại.')
      } finally {
        setIsLoading(false)
      }
    }
    initializeChat()
  }, [])

  const handleClearHistory = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?')) return;
    try {
      setIsLoading(true);
      await clearChatHistory();
      setMessages([]);
      // Start fresh
      const data = await startChat();
      const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.message };
      setMessages([aiMsg]);
    } catch (error) {
      console.error('Error clearing history:', error);
      setError('Lỗi khi xóa lịch sử');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setError(null)

    try {
      setIsLoading(true)
      // Log AI Chat activity to server
      api.post('/users/log', { type: 'AI_CHAT' }).catch(err => console.error("Log activity error:", err));

      const data = await sendChatMessage(text)
      const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.response }
      setMessages(m => [...m, reply])
    } catch (err: any) {
      console.error('Error sending message:', err)
      const msg = err.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const suggestions = [
    "Mình đang stress vì học",
    "Mình mất động lực",
    "Mình khó ngủ"
  ]

  return (
    <div className="flex flex-col h-[70dvh] border rounded bg-white dark:bg-gray-900 dark:border-white-500 relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleClearHistory}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Làm mới cuộc trò chuyện"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 dark:text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isLoading && (
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
        {isLoading && (
          <div className="text-left">
            <span className="inline-block px-3 py-2 rounded max-w-[80%] bg-gray-100 text-black dark:bg-gray-800 dark:text-white">
              Đang trả lời...
            </span>
          </div>
        )}
        {error && (
          <div className="text-center">
            <span className="inline-block px-3 py-2 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </span>
          </div>
        )}
      </div>
      {messages.filter(m => m.role === 'user').length === 0 && (
        <div className="p-3 border-t">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Gợi ý nhanh:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setInput(s)}
                disabled={isLoading}
                className="px-3 py-1 text-sm border rounded bg-white text-black dark:bg-gray-300 dark:text-white dark:border-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
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
          disabled={isLoading}
          className="flex-1 border rounded px-3 py-2 bg-white dark:bg-gray-300 dark:text-white disabled:opacity-50"
          placeholder="Nhập tin nhắn..."
        />
        <button
          disabled={isLoading}
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>
    </div>
  )
}
