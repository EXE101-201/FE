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

  if (loading) return <p className="text-center py-10">Loading...</p>
  if (error) return <p className="text-center py-10 text-red-500">Error: {error}</p>

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar: Tags */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l4.318-4.318a2.25 2.25 0 0 0 0-3.182L11.159 3.659A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            Chủ đề
          </h2>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setFilterTag('')}
              className={`text-left px-3 py-2 rounded-md transition-colors ${!filterTag ? 'bg-blue-500 text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Tất cả confession
            </button>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`text-left px-3 py-2 rounded-md transition-colors ${filterTag === tag ? 'bg-blue-500 text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </aside>

        {/* Middle Column: Confessions Feed */}
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">Confessions</h1>
            <Link to="/confessions/new" className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg active:scale-95">
              Đăng confession
            </Link>
          </div>

          <div className="grid gap-6">
            {visible.length === 0 && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-dashed dark:border-gray-700 text-center">
                <p className="text-gray-500 dark:text-gray-400">Chưa có bài nào trong chủ đề này. Hãy là người đầu tiên!</p>
              </div>
            )}
            {visible.map((c: Confession) => (
              <article key={c.id} className={`group rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700 ${c.isPremium ? 'border-yellow-400 ring-1 ring-yellow-400/20' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${c.isPremium ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                      {c.author ? c.author[0].toUpperCase() : 'A'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{c.author || 'Anonymous'}</h3>
                      <p className="text-xs text-white bg-gray-800/40 px-2 py-0.5 rounded-full inline-block">{getRelativeTime(c.createdAt)}</p>
                    </div>
                  </div>
                  {c.isPremium && (
                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] uppercase font-bold rounded">Premium</span>
                  )}
                </div>

                <Link to={`/confessions/${c.id}`} className="block">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-4 line-clamp-4">
                    {truncateContent(c.content, 400)}
                  </p>
                </Link>

                {c.tags && c.tags.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap mb-4">
                    {c.tags.map((tag: string) => (
                      <button
                        key={tag}
                        onClick={(e) => { e.preventDefault(); setFilterTag(tag); }}
                        className="text-xs font-medium text-white bg-blue-600 dark:bg-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t dark:border-gray-700 pt-4 mt-2">
                  <div className="flex items-center gap-4">
                    {/* Like Button */}
                    <div className="relative group/tooltip">
                      <button
                        onClick={() => handleReact(c.id, 'like')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm transition-all ${c.myReaction === 'like' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className="text-lg">❤️</span>
                        <span className="font-semibold">{c.reactions?.['like'] || 0}</span>
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
                        {c.reactions?.['like'] || 0} người đã thích
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900"></div>
                      </div>
                    </div>

                    {/* Dislike Button */}
                    <div className="relative group/tooltip">
                      <button
                        onClick={() => handleReact(c.id, 'dislike')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm transition-all ${c.myReaction === 'dislike' ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className="text-lg">💔</span>
                        <span className="font-semibold">{c.reactions?.['dislike'] || 0}</span>
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
                        {c.reactions?.['dislike'] || 0} người không thích
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900"></div>
                      </div>
                    </div>

                    {/* Comments Button */}
                    <Link
                      to={`/confessions/${c.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-semibold shadow-sm"
                    >
                      <span className="text-lg">💬</span>
                      {c.commentCount || 0}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Right Sidebar: Ad Placeholder */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center border-b dark:border-gray-600">
              Quảng cáo
            </div>
            <div className="p-2">
              <img
                src="/background-homePage.png"
                alt="Advertisement"
                className="w-full h-auto rounded-md object-cover min-h-[400px]"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x600?text=Your+Ad+Here'
                }}
              />
            </div>
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">"Hãy chăm sóc sức khỏe tinh thần của bạn mỗi ngày."</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}


