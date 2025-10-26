import { Link } from 'react-router-dom'
import { reactToConfession } from '../lib/storage'
import { useSyncExternalStore } from 'react'

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

export default function Confessions() {
  const snapshot = useConfessions()
  const confessions = (()=>{
    try { return JSON.parse(snapshot).filter((c: any)=> c.status === 'approved') } catch { return [] }
  })()
  const visible = confessions
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Confessions</h1>
        <Link to="/confessions/new" className="px-3 py-2 rounded bg-blue-600 text-white">Đăng confession</Link>
      </div>
      <div className="grid gap-3">
        {visible.length === 0 && (
          <p className="text-gray-500">Chưa có bài nào. Hãy là người đầu tiên!</p>
        )}
        {visible.map((c:any) => (
          <article key={c.id} className="rounded border bg-white p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <p className="whitespace-pre-wrap">{c.content}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex gap-2">
                {['❤️', '👍', '😢', '🤗'].map(e => (
                  <button key={e} onClick={() => reactToConfession(c.id, e)} className="px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
                    {e} {c.reactions[e] ?? 0}
                  </button>
                ))}
              </div>
              <Link className="text-blue-600" to={`/confessions/${c.id}`}>Bình luận</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}



