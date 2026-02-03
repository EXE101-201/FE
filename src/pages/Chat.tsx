import { type FormEvent, useEffect, useRef, useState } from 'react'
import api, { startChat, sendChatMessage, getChatHistory, clearChatHistory, getChallenges, updateChallengeProgress } from '../lib/api';
import { message as antdMessage } from 'antd';
import ExpressiveRobot, { type RobotExpression } from '../components/ExpressiveRobot';

type Message = { id: string; role: 'user' | 'assistant'; content: string; expression?: RobotExpression }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expression, setExpression] = useState<RobotExpression>('neutral')
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      setRobotPos({
        x: dragRef.current.initialX + deltaX,
        y: dragRef.current.initialY + deltaY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const onRobotMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: robotPos.x,
      initialY: robotPos.y
    };
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setExpression('thinking')

        // Try to load history
        try {
          const history = await getChatHistory();
          if (Array.isArray(history) && history.length > 0) {
            const formattedMessages: Message[] = history.map((m: any) => ({
              id: m._id || crypto.randomUUID(),
              role: m.role,
              content: m.content,
              expression: m.expression || 'neutral'
            }));
            setMessages(formattedMessages);
            setExpression('happy');
            return;
          }
        } catch (e) {
          console.error("Failed to load history", e);
        }

        // If no history, start new chat
        const data = await startChat()
        const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.message, expression: 'happy' }
        setMessages([aiMsg])
        setExpression('happy')
      } catch (err) {
        console.error('Error starting chat:', err)
        setError('Không thể khởi tạo cuộc trò chuyện. Vui lòng thử lại.')
        setExpression('neutral')
      } finally {
        setIsLoading(false)
      }
    }
    initializeChat()

    // Timer for Dr. MTH challenge (10 minutes)
    const startTimer = async () => {
      try {
        const challenges = await getChallenges();
        const drMTHChallenge = challenges.find((c: any) => c.title.includes("Dr. MTH"));

        if (drMTHChallenge && drMTHChallenge.userProgress && drMTHChallenge.userProgress.status !== 'COMPLETED') {
          console.log("Dr. MTH Challenge found, starting 10m timer...");

          timerRef.current = setTimeout(async () => {
            try {
              await updateChallengeProgress(drMTHChallenge._id);
              antdMessage.success('Chúc mừng! Bạn đã hoàn thành 10 phút tâm sự và cập nhật thử thách!');
            } catch (err) {
              console.error("Auto-update progress failed", err);
            }
          }, 10 * 60 * 1000); // 10 minutes
        }
      } catch (err) {
        console.error("Failed to check challenges for timer", err);
      }
    };

    startTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [])

  const handleClearHistory = async () => {
    if (!messages.length) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?')) return;
    try {
      setIsLoading(true);
      setExpression('thinking');
      await clearChatHistory();
      setMessages([]);
      const data = await startChat();
      const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.message, expression: 'happy' };
      setMessages([aiMsg]);
      setExpression('happy');
    } catch (error) {
      console.error('Error clearing history:', error);
      setError('Lỗi khi xóa lịch sử');
      setExpression('neutral');
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
    setExpression('thinking')

    try {
      setIsLoading(true)
      api.post('/users/log', { type: 'AI_CHAT' }).catch(err => console.error("Log activity error:", err));

      const data = await sendChatMessage(text)
      const reply: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        expression: data.expression as RobotExpression || 'neutral'
      }
      setMessages(m => [...m, reply])
      setExpression(data.expression as RobotExpression || 'happy')
    } catch (err: any) {
      console.error('Error sending message:', err)
      const msg = err.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.'
      setError(msg)
      setExpression('neutral')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#e8f5ed] via-[#dcf3e8] to-[#c7e9d9] flex items-center justify-center p-4 md:p-10 relative overflow-hidden font-inter">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#a8d5ba] rounded-full blur-[100px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#58856c] rounded-full blur-[120px] opacity-20"></div>

      {/* Main Chat Container */}
      <div
        ref={containerRef}
        className="w-full max-w-5xl h-[780px] bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex flex-col relative z-10 border border-white/40 overflow-hidden"
      >

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300"></div>

        {/* Header Controls */}
        <div className="absolute top-6 right-8 z-20 flex gap-2">
          {/* Find Robot Button */}
          <button
            onClick={() => setRobotPos({ x: 0, y: 0 })}
            className="text-[#58856c] hover:text-white transition-all p-3 rounded-full hover:bg-[#58856c] shadow-sm hover:shadow-md flex items-center gap-2 group"
            title="Tìm Robot"
          >
            <span className="hidden group-hover:inline text-[12px] font-bold">Tìm Robot</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Clear History Button */}
          <button
            onClick={handleClearHistory}
            className="text-[#58856c] hover:text-white transition-all p-3 rounded-full hover:bg-[#58856c] shadow-sm hover:shadow-md"
            title="Xóa lịch sử"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* Messages List Area */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scrollbar-hide md:scrollbar-default"
        >
          {messages.map((m, idx) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {m.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center flex-shrink-0 border border-green-100 overflow-hidden">
                  <ExpressiveRobot expression={m.expression || 'neutral'} size={32} />
                </div>
              )}

              <div className={`max-w-[80%] ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={
                  `px-6 py-4 rounded-3xl shadow-sm text-[15px] md:text-[16px] leading-relaxed transition-all hover:shadow-md whitespace-pre-wrap ${m.role === 'user'
                    ? 'bg-gradient-to-tr from-[#58856c] to-[#71a384] text-white rounded-br-none'
                    : 'bg-white/90 text-gray-800 rounded-bl-none border border-white/50'
                  }`
                }>
                  {m.content}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center flex-shrink-0 border border-green-200 overflow-hidden order-2 p-0.5">
                  <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">U</div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-end gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center flex-shrink-0 border border-green-100">
                <ExpressiveRobot expression="thinking" size={32} />
              </div>
              <div className="bg-white/90 px-6 py-4 rounded-3xl rounded-bl-none flex gap-2 items-center shadow-sm border border-white/50">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <span className="bg-red-50/80 backdrop-blur-sm text-red-500 px-6 py-2.5 rounded-2xl text-sm border border-red-100 shadow-sm">
                {error}
              </span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-12 pt-0 z-10">
          <form
            onSubmit={onSubmit}
            className="relative bg-white/70 backdrop-blur-md rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] flex items-center p-2 border border-white/60 group focus-within:ring-4 ring-green-400/10 transition-all duration-300"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-transparent px-6 py-4 outline-none text-gray-800 placeholder:text-gray-400 text-lg"
              placeholder="Chia sẻ nỗi lòng của bạn..."
            />

            {/* Expression Picker */}
            <div className="flex items-center gap-1 pr-2">
              {[
                { type: 'happy', icon: '😊', label: 'Vui vẻ' },
                { type: 'sad', icon: '😔', label: 'Buồn' },
                { type: 'empathetic', icon: '🤝', label: 'Đồng cảm' },
                { type: 'thinking', icon: '💡', label: 'Suy nghĩ' },
                { type: 'surprised', icon: '😲', label: 'Ngạc nhiên' },
                { type: 'neutral', icon: '🤖', label: 'Bình thường' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setExpression(item.type as RobotExpression)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all text-xl hover:bg-green-100/50 ${expression === item.type ? 'bg-green-100 scale-110 shadow-sm border border-green-200' : 'opacity-60 grayscale-[50%] hover:grayscale-0'}`}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>

            <button
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-[#58856c] to-[#71a384] hover:from-[#4a6e5a] hover:to-[#58856c] text-white px-10 py-4 rounded-3xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed h-full flex items-center gap-2 shadow-lg hover:shadow-green-900/10 active:scale-95 transform"
            >
              {isLoading ? (
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></span>
                </div>
              ) : 'Gửi đi'}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
          <p className="text-center mt-4 text-[11px] text-[#58856c]/60 font-medium uppercase tracking-widest">Stu.Mental Health • Chatbot AI đồng hành cùng bạn</p>
        </div>
      </div>

      {/* Decoration Robot - Moved Outside to allow free floating across the entire background */}
      <div
        className="fixed lg:absolute hidden lg:flex flex-col items-center select-none z-[50] group cursor-move transition-transform duration-200"
        style={{
          right: 32 - robotPos.x,
          bottom: 128 - robotPos.y,
          touchAction: 'none'
        }}
        onMouseDown={onRobotMouseDown}
      >
        <ExpressiveRobot expression={expression} size={240} className={`${isDragging ? 'drop-shadow-3xl scale-105' : 'drop-shadow-2xl'} transition-all`} />
        <div className="mt-2 px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full text-[12px] font-bold text-[#58856c] border border-white/40 uppercase tracking-widest shadow-lg">
          Đang {expression === 'thinking' ? 'suy nghĩ' : (expression === 'happy' ? 'vui vẻ' : (expression === 'empathetic' ? 'lắng nghe' : (expression === 'sad' ? 'chia sẻ cùng bạn' : 'online')))}
        </div>
      </div>
    </div>
  );
}
