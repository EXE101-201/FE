import { Link } from 'react-router-dom'
import { useConfessions } from '../lib/hooks/useConfession'
import { reactToConfessionAPI, getConfessionTags } from '../lib/api'
import { useState, useEffect } from 'react'
import type { Confession } from '../lib/hooks/useConfession'

function getRelativeTime(timestamp: any): string {
  const date = new Date(timestamp)
  const time = date.getTime()
  if (isNaN(time)) return 'Không rõ thời gian'
  const now = Date.now()
  const diff = now - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

function truncateContent(content: string, maxLength: number = 200): string {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

export default function Confessions() {
  const { confessions, loading, error, refresh } = useConfessions()
  const [filterTag, setFilterTag] = useState<string>('')
  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getConfessionTags()
        setAvailableTags(tags)
      } catch (err) {
        console.error('Failed to fetch tags:', err)
      }
    }
    fetchTags()
  }, [])

  const visible = filterTag ? confessions.filter((c: Confession) => c.tags?.includes(filterTag)) : confessions

  const handleReact = async (id: string, emoji: string) => {
    try {
      await reactToConfessionAPI(id, emoji)
      refresh() // Refresh the list after reaction
    } catch (err) {
      console.error('Failed to react:', err)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f7f5]">
      {/* New Header Section */}
      <div className="bg-gradient-to-r from-[#e8f5e9] to-[#dcfce7] border-b border-green-100">
        <div className="max-w-[1400px] mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a3a2a] mb-2 font-serif">Confessions</h1>
            <p className="text-[#58856c] text-lg font-medium opacity-80">Nơi chia sẻ những tâm tư, áp lực và câu chuyện cuộc sống của bạn</p>
          </div>
          <Link
            to="/confessions/new"
            className="px-8 py-3.5 rounded-full bg-white text-[#58856c] font-bold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 border border-green-100 flex items-center gap-2 group"
          >
            <span className="text-blue-500 font-extrabold text-xl group-hover:rotate-12 transition-transform">+</span>
            Đăng confession
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Simplified Search Bar */}
        <div className="bg-[#e9eff6] rounded-[2rem] p-2 flex flex-wrap items-center gap-4 mb-8 shadow-inner overflow-x-auto whitespace-nowrap">
          <div className="relative group min-w-[300px] flex-1">
            <input
              type="text"
              placeholder="tìm kiếm"
              className="w-full bg-[#c2e7cf] pl-6 pr-4 py-3 rounded-full text-[#58856c] placeholder-[#58856c]/60 font-bold outline-none border-2 border-transparent focus:border-green-400 transition-all placeholder:font-bold"
            />
          </div>

          <div className="flex items-center bg-white/60 px-4 py-2.5 rounded-full border border-white/40 gap-2 mr-2">
            <span className="font-bold text-gray-700 text-sm">Chủ đề mới nhất</span>
            <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Tags */}
          <aside className="w-full lg:w-64 flex-shrink-0 sticky top-24">
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-4 border border-white/60 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 px-2 flex items-center gap-2">
                <span className="text-blue-500">#</span> Chủ đề
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setFilterTag('')}
                  className={`px-4 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 text-left shadow-sm ${!filterTag ? 'bg-[#3b82f6] text-white' : 'bg-white text-gray-800 border border-transparent'}`}
                >
                  Tất cả confession
                </button>
                {availableTags.map((tag, idx) => {
                  const icons = ['🎵', '📚', '🧘', '☀️', '🌱', '💡', '🌈'];
                  const labels: Record<string, string> = {
                    'Music': '#cuộc sống',
                    'Study': 'cuộc sống',
                    'Meditation': 'học_tập',
                    'Sun': 'nhạt đời',
                    'Stress': 'stress'
                  };
                  return (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`px-4 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 text-left shadow-sm ${filterTag === tag ? 'bg-[#3b82f6] text-white' : 'bg-white text-gray-800 border border-transparent hover:bg-gray-50'}`}
                    >
                      <span className="text-xl">{icons[idx % icons.length]}</span>
                      <span className="text-[14px]">{labels[tag] || tag.toLowerCase()}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Middle Column: Posts */}
          <main className="flex-1 flex flex-col gap-6 w-full lg:min-w-0">
            {loading ? (
              <div className="bg-white/60 backdrop-blur-md p-12 rounded-[2.5rem] shadow-sm border border-white/60 text-center animate-pulse">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
                <p className="text-[#58856c] font-bold text-lg">Đang tải những tâm tình...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50/80 backdrop-blur-md p-8 rounded-3xl border border-red-100 text-center shadow-sm">
                <p className="text-red-500 font-bold mb-2">Đã có lỗi xảy ra!</p>
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={() => refresh()} className="mt-4 px-6 py-2 bg-red-100 text-red-600 rounded-full font-bold hover:bg-red-200 transition-colors">Thử lại</button>
              </div>
            ) : (
              <div className="grid gap-6">
                {visible.length === 0 && (
                  <div className="bg-white/60 backdrop-blur-md p-12 rounded-[2.5rem] border border-dashed border-gray-300 text-center shadow-sm">
                    <p className="text-gray-500 font-medium">Chưa có bài nào trong chủ đề này. Hãy là người đầu tiên!</p>
                  </div>
                )}
                {visible.map((c: Confession) => (
                  <article key={c.id} className={`group rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700 ${c.isPremium ? 'border-yellow-400 ring-1 ring-yellow-400/20' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${c.isPremium ? 'bg-yellow-100 text-yellow-600' : 'bg-[#e8f5e9] text-[#58856c]'}`}>
                          {c.author ? c.author[0].toUpperCase() : 'A'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{c.author || 'Người ẩn danh'}</h3>
                          <p className="text-xs text-white bg-[#58856c]/50 px-3 py-0.5 rounded-full inline-block backdrop-blur-sm">{getRelativeTime(c.createdAt)}</p>
                        </div>
                      </div>
                      {c.isPremium && (
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] uppercase font-black rounded-full shadow-sm">Premium</span>
                      )}
                    </div>

                    <Link to={`/confessions/${c.id}`} className="block">
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-4 text-[16px]">
                        {truncateContent(c.content, 500)}
                      </p>
                    </Link>

                    <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-700 pt-4 mt-2">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleReact(c.id, 'like')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${c.myReaction === 'like' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}>
                          <span className="text-lg">❤️</span>
                          <span className="font-bold">{c.reactions?.['like'] || 0}</span>
                        </button>
                        <button onClick={() => handleReact(c.id, 'dislike')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${c.myReaction === 'dislike' ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                          <span className="text-lg">💔</span>
                          <span className="font-bold">{c.reactions?.['dislike'] || 0}</span>
                        </button>
                        <Link to={`/confessions/${c.id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-[#58856c] transition-all font-bold">
                          <span className="text-lg">💬</span>
                          {c.commentCount || 0}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          {/* Right Column: Tâm điểm */}
          <aside className="hidden xl:block w-[320px] flex-shrink-0 sticky top-24">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-5">
              <div className="flex items-center gap-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l4.318-4.318a2.25 2.25 0 0 0 0-3.182L11.159 3.659A2.25 2.25 0 0 0 9.568 3Z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-800">Tâm điểm</h2>
              </div>

              <div className="space-y-6">
                {/* Highlight Card 1 */}
                <div className="bg-[#f0f4f8] rounded-2xl p-4 relative overflow-hidden group cursor-pointer border border-transparent hover:border-blue-100 transition-colors">
                  <div className="flex gap-3 mb-3">
                    <div className="w-24 h-24 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 border border-white/40">
                      <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" alt="meditation" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[12px] leading-tight text-gray-600 font-medium line-clamp-4">"Bố mẹ luôn ép tôi làm việc bài tập họ luôn không lắng nghe những gì chúng tôi nói..."</p>
                  </div>
                  <div className="flex justify-center mb-2">
                    <div className="w-20 h-20 opacity-90 group-hover:scale-110 transition-transform">
                      <img src="https://cdni.iconscout.com/illustration/premium/thumb/female-practicing-meditation-illustration-download-in-svg-png-gif-file-formats--health-exercise-fitness-lady-yoga-pack-sports-games-illustrations-6454848.png" alt="meditating girl" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black uppercase rounded shadow-[0_2px_10px_rgba(245,158,11,0.3)]">Premium</div>
                </div>

                {/* Highlight Card 2 */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center text-xl flex-shrink-0 group-hover:rotate-12 transition-transform">📖</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-[#58856c] transition-colors">Dinh dưỡng mùa thi</h3>
                      <p className="text-[11px] text-gray-500 leading-tight">Lớp vỡ định hướng giải nén tinh thần bạn mỗi ngày</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 rounded-full text-[10px] font-bold text-sky-600 border border-sky-100/50">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /></svg>
                      Course Premium
                    </div>
                    <span className="text-[14px] font-bold text-gray-300">0</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
