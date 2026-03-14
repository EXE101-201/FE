import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom';
import api, { startChat, sendChatMessage, getChatHistory, clearChatHistory, joinChallenge, updateChallengeProgress } from '../lib/api';
import { message as antdMessage } from 'antd';
import type { RobotExpression } from '../components/ExpressiveRobot';

type Message = { id: string; role: 'user' | 'assistant'; content: string; expression?: RobotExpression }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const location = useLocation();
  const challengeId = location.state?.challengeId;
  const [hasUpdatedChallenge, setHasUpdatedChallenge] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

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

  const checkChallenge = async () => {
    if (!challengeId) return;
    try {
      const response = await api.get(`/challenges/${challengeId}`);
      const data = response.data;
      if (!data.userProgress) {
        await joinChallenge(challengeId);
      }
    } catch (e) {
      console.error("Failed to check challenge:", e);
    }
  }

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
              content: m.content,
              expression: m.expression || 'neutral'
            }));
            setMessages(formattedMessages);
            return;
          }
        } catch (e) {
          console.error("Failed to load history", e);
        }

        // If no history, start new chat
        const data = await startChat()
        const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.message, expression: 'happy' }
        setMessages([aiMsg])
      } catch (err) {
        console.error('Error starting chat:', err)
        setError('Không thể khởi tạo cuộc trò chuyện. Vui lòng thử lại.')
      } finally {
        setIsLoading(false)
      }
    }
    initializeChat()
    if (challengeId) {
      checkChallenge();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClearHistory = async () => {
    if (!messages.length) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?')) return;
    try {
      setIsLoading(true);
      await clearChatHistory();
      setMessages([]);
      const data = await startChat();
      const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.message, expression: 'happy' };
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

  // 15 Minute Timer Logic for Challenges
  useEffect(() => {
    if (!challengeId || hasUpdatedChallenge) return;
    
    // Check local storage for existing tracked time for today
    const dateKey = new Date().toISOString().split('T')[0];
    const storageKey = `chat_time_${challengeId}_${dateKey}`;
    
    let elapsed = parseInt(localStorage.getItem(storageKey) || '0');
    setElapsedTime(elapsed);
    
    if (elapsed >= 900) {
       return;
    }

    const interval = setInterval(() => {
      elapsed += 1;
      setElapsedTime(elapsed);
      localStorage.setItem(storageKey, elapsed.toString());
      
      if (elapsed === 900) { // exactly 15 mins
         updateChallengeProgress(challengeId).then(() => {
             setHasUpdatedChallenge(true);
             antdMessage.success('Chúc mừng! Bạn đã hoàn thành 15 phút tâm sự hôm nay! 🎉');
         }).catch(err => {
             if (err.response?.status === 400) setHasUpdatedChallenge(true);
         });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [challengeId, hasUpdatedChallenge]);

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
      const reply: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        expression: data.expression as RobotExpression || 'neutral'
      }
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
    <div className="min-h-[calc(100vh-64px)] bg-[#fdfaf5] flex items-center justify-center p-4 md:p-10 relative overflow-hidden font-inter">
      {/* Background Decorations matching the new image (Solid green curves) */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-[#a9e1cb] rounded-br-[150px] rounded-bl-[150px] -z-10"></div>
      <div className="absolute left-0 top-[20%] w-32 h-32 bg-[#fff] rounded-tr-full rounded-br-full opacity-60"></div>
      <div className="absolute right-0 top-[10%] w-64 h-[400px] bg-[#a7dbcf] rounded-l-full -z-10"></div>
      
      {/* Abstract geometric shapes */}
      <div className="absolute left-10 bottom-40 w-16 h-8 bg-gradient-to-r from-green-300 to-green-400 rounded-t-full opacity-60 transform -rotate-45"></div>
      <div className="absolute right-40 top-32 w-12 h-12 bg-yellow-100 rounded-full opacity-70"></div>

      {/* Main Chat Container - Simple solid box with crisp shadow */}
      <div className="w-full max-w-7xl mx-auto px-4 relative z-10 flex justify-center mt-8">
        <div
          ref={containerRef}
          className="w-full max-w-6xl h-[85vh] min-h-[600px] max-h-[820px] bg-gradient-to-bl from-[#cfeae1] to-[#f4f2e6] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col relative border border-white/40"
        >
          {/* Header Controls */}
          <div className="absolute top-4 right-4 z-20 flex gap-2 items-center">
            {challengeId && !hasUpdatedChallenge && (
               <div className="bg-white/80 px-4 py-1.5 rounded-full text-sm font-semibold text-green-700 shadow-sm mr-2 flex items-center gap-1.5 border border-green-100">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-600">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')} / 15:00
               </div>
            )}
            
            {/* Find Robot Button */}
            <button
              onClick={() => setRobotPos({ x: 0, y: 0 })}
              className="text-[#4a6e5a] hover:text-white transition-all p-2 rounded-full hover:bg-[#58856c] bg-white/50 shadow-sm"
              title="Tìm Robot"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Clear History Button */}
            <button
              onClick={handleClearHistory}
              className="text-[#4a6e5a] hover:text-white transition-all p-2 rounded-full hover:bg-[#58856c] bg-white/50 shadow-sm"
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
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide md:scrollbar-default mt-12 mb-16"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full relative z-20`}
              >
                {/* Bot Avatar */}
                {m.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center flex-shrink-0 border border-white mb-1 overflow-hidden">
                    <img src="/robot.png" alt="doctor robot" className="w-9 h-9 object-contain" />
                  </div>
                )}

                <div className={`max-w-[75%] ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className={
                    `px-5 py-3.5 shadow-sm text-[15px] leading-relaxed transition-all whitespace-pre-wrap ${m.role === 'user'
                      ? 'bg-[#6aa483] text-white rounded-3xl rounded-tr-md'
                      : 'bg-[#f4f7f6] text-gray-800 rounded-3xl rounded-tl-md border border-white/80'
                    }`
                  }>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start items-end gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center flex-shrink-0 border border-white mb-1 overflow-hidden">
                  <img src="/robot.png" alt="doctor robot thinking" className="w-9 h-9 object-contain opacity-80" />
                </div>
                <div className="bg-[#f4f7f6] px-6 py-4 rounded-3xl rounded-tl-md flex gap-2 items-center shadow-sm border border-white/80">
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
          <div className="px-6 md:px-12 pb-8 z-30">
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 relative bg-white rounded-full shadow-lg border border-green-50/50 p-1"
            >
              <div className="flex-1 flex items-center pl-6">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent py-3 outline-none text-gray-700 placeholder:text-gray-400 text-base"
                  placeholder="Nhập tin nhắn..."
                />
              </div>
              <button
                disabled={isLoading || !input.trim()}
                className="bg-[#58856c] hover:bg-[#4a6e5a] text-white px-8 py-3 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
              >
                Gửi
              </button>
            </form>
          </div>

          {/* Floating Robot (Draggable) - Exactly matching reference placement inside the box right corner */}
          <div
            className="absolute right-4 bottom-16 md:right-10 md:bottom-[76px] flex flex-col items-center select-none z-[40] cursor-move transition-transform duration-200"
            style={{
              transform: `translate(${robotPos.x}px, ${robotPos.y}px)`,
              touchAction: 'none'
            }}
            onMouseDown={onRobotMouseDown}
          >
            <img src="/robot.png" alt="robot" className="w-24 h-24 md:w-32 md:h-32 object-contain filter drop-shadow-md" />
          </div>

        </div>
      </div>
    </div>
  );
}
