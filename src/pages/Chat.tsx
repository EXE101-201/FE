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
    if (!messages.length) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?')) return;
    try {
      setIsLoading(true);
      await clearChatHistory();
      setMessages([]);
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
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#d9ede2] flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#a8d5ba] rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-[#58856c] rounded-full blur-3xl opacity-20"></div>

      {/* Main Chat Container */}
      <div className="w-full max-w-5xl h-[750px] bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-2xl flex flex-col relative z-10 border border-white/40 overflow-hidden">

        {/* Header (Optional, for Clear history) */}
        <div className="absolute top-4 right-6 z-20">
          <button
            onClick={handleClearHistory}
            className="text-[#58856c] hover:text-[#3d5c4b] transition-colors p-2 rounded-full hover:bg-white/50"
            title="Xóa lịch sử"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* Messages List Area */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-thin scrollbar-thumb-green-200"
        >
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
            >
              {m.role === 'assistant' && (
                <div className="w-12 h-12 rounded-full bg-[#dcf3e8] flex items-center justify-center flex-shrink-0 border-2 border-white overflow-hidden">
                  <img src="/robot1.png" alt="ai" className="w-full h-full object-cover" />
                </div>
              )}

              <div className={`max-w-[75%] ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={
                  `px-5 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed ${m.role === 'user'
                    ? 'bg-[#58856c] text-white rounded-tr-none'
                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                  }`
                }>
                  {m.content}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 border-2 border-[#58856c] overflow-hidden order-2">
                  <img src="/background-homePage.png" alt="user" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#dcf3e8] flex items-center justify-center flex-shrink-0 border-2 border-white">
                <div className="w-2 h-2 bg-[#58856c] rounded-full animate-bounce"></div>
              </div>
              <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-150"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <span className="bg-red-50 text-red-500 px-4 py-2 rounded-full text-sm border border-red-100">
                {error}
              </span>
            </div>
          )}
        </div>

        {/* Decoration Robot */}
        <div className="absolute right-10 bottom-24 hidden lg:block select-none pointer-events-none z-0">
          <img src="/robot.png" alt="robot decorative" className="w-44 h-44 object-contain opacity-90 drop-shadow-xl" />
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-10 pt-0">
          <form
            onSubmit={onSubmit}
            className="relative bg-white rounded-2xl shadow-lg flex items-center p-2 border border-gray-100 group focus-within:ring-2 ring-[#58856c]/20 transition-all"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-700 placeholder:text-gray-400"
              placeholder="Nhập tin nhắn..."
            />
            <button
              disabled={isLoading || !input.trim()}
              className="bg-[#58856c] hover:bg-[#4a6e5a] text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed h-full flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
            >
              {isLoading ? '...' : 'Gửi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
