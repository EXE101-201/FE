import { useParams, useNavigate } from 'react-router-dom'
import { getConfessionDetail, addCommentAPI, reactToConfessionAPI, deleteConfessionAPI, deleteCommentAPI } from '../lib/api'
import { useState, useEffect } from 'react'
import type { Confession } from '../lib/hooks/useConfession'
import { useUser } from '../lib/hooks/hooks'
import { containsBadWords } from '../lib/badWords'

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

export default function ConfessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const [confession, setConfession] = useState<Confession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Bạn có chắc muốn xóa confession này?')) return
    try {
      await deleteConfessionAPI(id)
      navigate('/confessions')
    } catch (err: any) {
      setError(err.message || 'Failed to delete confession')
    }
  }

  useEffect(() => {
    const fetchConfession = async () => {
      if (!id) return
      try {
        const data = await getConfessionDetail(id)
        setConfession(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch confession')
      } finally {
        setLoading(false)
      }
    }
    fetchConfession()
  }, [id])

  const handleReact = async (emoji: string) => {
    if (!confession) return
    try {
      await reactToConfessionAPI(confession.id, emoji)
      // Refresh confession
      const data = await getConfessionDetail(confession.id)
      setConfession(data)
    } catch (err) {
      console.error('Failed to react:', err)
    }
  }

  const handleDeleteComment = async (confessionId: string, commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return
    try {
      await deleteCommentAPI(confessionId, commentId)
      // Refresh confession
      const data = await getConfessionDetail(confessionId)
      setConfession(data)
    } catch (err: any) {
      console.error('Failed to delete comment:', err)
      alert(err.response?.data?.message || 'Không thể xóa bình luận')
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !confession) return
    if (containsBadWords(comment)) {
      alert('Bình luận chứa từ ngữ không phù hợp.')
      return
    }
    try {
      await addCommentAPI(confession.id, comment.trim())
      setComment('')
      // Refresh confession
      const data = await getConfessionDetail(confession.id)
      setConfession(data)
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!confession) return <p className="text-gray-500">Không tìm thấy.</p>

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button
        onClick={() => navigate('/confessions')}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700 dark:text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="text-gray-700 dark:text-white">Quay lại</span>
      </button>
      <article className="rounded border bg-white p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">By {confession.author}</p>
            <span className="text-xs text-white bg-gray-700/50 px-2 py-0.5 rounded-full">{getRelativeTime(confession.createdAt)}</span>
          </div>
          {(confession.isOwner || (user && user.role === 'admin')) && (
            <button onClick={handleDelete} className="px-3 py-1 text-sm bg-red-600 dark:bg-red-600 text-white rounded hover:bg-red-700">
              Xóa
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap dark:text-white">{confession.content}</p>
        {confession.tags && confession.tags.length > 0 && (
          <div className="mt-2 flex gap-1">
            {confession.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">#{tag}</span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm border-t dark:border-gray-700 pt-4">
          {/* Like Button */}
          <div className="relative group/react">
            <button
              onClick={() => handleReact('like')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all ${confession.myReaction === 'like' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="text-xl">❤️</span>
              <span className="font-bold text-base">{confession.reactions?.['like'] || 0}</span>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/react:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl z-20">
              {confession.reactions?.['like'] || 0} người đã thích
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Dislike Button */}
          <div className="relative group/react">
            <button
              onClick={() => handleReact('dislike')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all ${confession.myReaction === 'dislike' ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="text-xl">💔</span>
              <span className="font-bold text-base">{confession.reactions?.['dislike'] || 0}</span>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/react:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl z-20">
              {confession.reactions?.['dislike'] || 0} người không thích
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </article>
      <section>
        <h2 className="font-medium mb-2">Bình luận</h2>
        <p className="text-sm text-gray-600 mb-2">Hãy để lại lời động viên, đồng cảm hoặc chia sẻ nhẹ nhàng. Tránh tranh luận hoặc phán xét.</p>
        <div className="space-y-2">
          {confession.comments?.length === 0 && <p className="text-gray-500">Chưa có bình luận.</p>}
          {confession.comments?.map((cm: { id: string; content: string; createdAt: number; user: { _id: string; fullName: string } }) => (
            <div key={cm.id} className="text-sm p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-800 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium dark:text-gray-300">{cm.user.fullName}</p>
                  <p className="dark:text-white">{cm.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(cm.createdAt).toLocaleString()}</p>
                </div>
                {user && (user.id === cm.user._id || user._id === cm.user._id || user.id === confession.authorId || user._id === confession.authorId) && (
                  <button
                    onClick={() => handleDeleteComment(confession.id, cm.id || (cm as any)._id)}
                    className="text-xs text-red-500 dark:text-white dark:bg-red-600 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-700 rounded transition"
                    title="Xóa bình luận"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)} className="flex-1 border rounded px-3 py-2 bg-white dark:bg-gray-300 dark:text-white dark:border-gray-700 dark:placeholder-gray-400" placeholder="Viết bình luận tích cực..." />
          <button className="px-3 py-2 rounded bg-blue-600 text-white">Gửi</button>
        </form>
      </section>
    </div >
  )
}


