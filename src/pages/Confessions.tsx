import { Link } from 'react-router-dom'
import { useConfessions } from '../lib/hooks/useConfession'
import { reactToConfessionAPI } from '../lib/api'
import { useState } from 'react'
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
  const availableTags = ['stress', 'học_tập', 'mối_quan_hệ', 'gia_đình']

  const visible = filterTag ? confessions.filter((c: Confession) => c.tags?.includes(filterTag)) : confessions

  const handleReact = async (id: string, emoji: string) => {
    try {
      await reactToConfessionAPI(id, emoji)
      refresh() // Refresh the list after reaction
    } catch (err) {
      console.error('Failed to react:', err)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Confessions</h1>
        <Link to="/confessions/new" className="px-3 py-2 rounded bg-blue-600 text-white">Đăng confession</Link>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterTag('')} className={`px-3 py-1 rounded ${!filterTag ? 'bg-blue-600 text-white' : 'border'}`}>Tất cả</button>
        {availableTags.map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag)} className={`px-3 py-1 rounded ${filterTag === tag ? 'bg-blue-600 text-white' : 'border'}`}>#{tag}</button>
        ))}
      </div>
      <div className="grid gap-3">
        {visible.length === 0 && (
          <p className="text-gray-500">Chưa có bài nào. Hãy là người đầu tiên!</p>
        )}
        {visible.map((c: Confession) => (
          <article key={c.id} className={`rounded border bg-white p-4 shadow-sm dark:bg-gray-300 dark:border-gray-800 ${c.isPremium ? 'border-yellow-400' : ''}`}>
            <p className="whitespace-pre-wrap">{truncateContent(c.content)}</p>
            {c.tags && c.tags.length > 0 && (
              <div className="mt-2 flex gap-1">
                {c.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">#{tag}</span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => handleReact(c.id, '❤️')}
                  className="px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  title={`${c.reactions?.['❤️'] || 0} người đã thả tim`}
                >
                  ❤️ {c.reactions?.['❤️'] || 0}
                </button>
                <Link to={`/confessions/${c.id}`} className="px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
                  💬 {c.commentCount || 0}
                </Link>
              </div>
              <span className="text-gray-500">{getRelativeTime(c.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}


