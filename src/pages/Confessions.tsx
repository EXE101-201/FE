import { Link } from 'react-router-dom'
import { reactToConfession } from '../lib/storage'
import { useSyncExternalStore, useState } from 'react'

function useConfessions() {
  const subscribe = (cb: () => void) => {
    window.addEventListener('storage', cb)
    return () => window.removeEventListener('storage', cb)
  }
  // Return the raw string as the stable snapshot to avoid creating
  // a new array instance each render; parse it in the component.
  const getSnapshot = () => localStorage.getItem('sm_confessions_v1') ?? '[]'
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

export default function Confessions() {
  const snapshot = useConfessions()
  const [filterTag, setFilterTag] = useState<string>('')
  const confessions = (()=>{
    try { return JSON.parse(snapshot).filter((c: any)=> c.status === 'approved') } catch { return [] }
  })()
  const visible = filterTag ? confessions.filter((c: any) => c.tags?.includes(filterTag)) : confessions
  const availableTags = ['Học tập', 'Stress', 'Mối quan hệ', 'Gia đình']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Confessions</h1>
        <Link to="/confessions/new" className="px-3 py-2 rounded bg-blue-600 text-white">Đăng confession</Link>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterTag('')} className={`px-3 py-1 rounded ${!filterTag ? 'bg-blue-600 text-white' : 'border'}`}>Tất cả</button>
        {availableTags.map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag)} className={`px-3 py-1 rounded ${filterTag === tag ? 'bg-blue-600 text-white' : 'border'}`}>#{tag.toLowerCase().replace(' ', '_')}</button>
        ))}
      </div>
      <div className="grid gap-3">
        {visible.length === 0 && (
          <p className="text-gray-500">Chưa có bài nào. Hãy là người đầu tiên!</p>
        )}
        {visible.map((c:any) => (
          <article key={c.id} className="rounded border bg-white p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <p className="whitespace-pre-wrap">{c.content}</p>
            {c.tags && c.tags.length > 0 && (
              <div className="mt-2 flex gap-1">
                {c.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">#{tag.toLowerCase().replace(' ', '_')}</span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex gap-2">
                {['❤️', '🤍'].map(e => (
                  <button key={e} onClick={() => reactToConfession(c.id, e)} className="px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
                    {e} {c.reactions[e] ?? 0}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{getRelativeTime(c.createdAt)}</span>
                <Link className="text-blue-600" to={`/confessions/${c.id}`}>Bình luận</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}



