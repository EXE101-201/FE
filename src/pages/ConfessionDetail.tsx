import { useParams } from 'react-router-dom'
import { addComment, getConfession, reactToConfession } from '../lib/storage'
import { useMemo, useState } from 'react'

export default function ConfessionDetail() {
  const { id } = useParams()
  const confession = useMemo(()=> id ? getConfession(id) : undefined, [id])
  const [comment, setComment] = useState('')
  if (!confession) return <p className="text-gray-500">Không tìm thấy.</p>
  return (
    <div className="space-y-4">
      <article className="rounded border bg-white p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <p className="whitespace-pre-wrap">{confession.content}</p>
        {confession.tags && confession.tags.length > 0 && (
          <div className="mt-2 flex gap-1">
            {confession.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">#{tag.toLowerCase().replace(' ', '_')}</span>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-sm">
          {['❤️', '🤍'].map(e => (
            <button key={e} onClick={() => reactToConfession(confession.id, e)} className="px-2 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
              {e} {confession.reactions[e] ?? 0}
            </button>
          ))}
        </div>
      </article>
      <section>
        <h2 className="font-medium mb-2">Bình luận</h2>
        <p className="text-sm text-gray-600 mb-2">Hãy để lại lời động viên, đồng cảm hoặc chia sẻ nhẹ nhàng. Tránh tranh luận hoặc phán xét.</p>
        <div className="space-y-2">
          {confession.comments.length === 0 && <p className="text-gray-500">Chưa có bình luận.</p>}
          {confession.comments.map(cm => (
            <div key={cm.id} className="text-sm p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-800">
              <p>{cm.content}</p>
              <p className="text-xs text-gray-500">{new Date(cm.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <form onSubmit={(e)=>{e.preventDefault(); if(!comment.trim()) return; addComment(confession.id, comment.trim()); setComment('')}} className="mt-3 flex gap-2">
          <input value={comment} onChange={e=>setComment(e.target.value)} className="flex-1 border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="Viết bình luận tích cực..." />
          <button className="px-3 py-2 rounded bg-blue-600 text-white">Gửi</button>
        </form>
      </section>
    </div>
  )
}



