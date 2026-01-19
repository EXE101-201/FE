import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { message } from 'antd'

export default function NewConfession() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      await api.post('/confessions', { content: content.trim() })
      message.success('Gửi confession thành công! Đang chờ duyệt.')
      navigate('/confessions')
    } catch (error) {
      message.error('Lỗi khi gửi bài viết')
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Đăng confession ẩn danh</h1>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Chia sẻ câu chuyện của bạn..."
        className="w-full min-h-40 p-3 border rounded bg-white dark:bg-gray-900"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded border">Hủy</button>
      </div>
      <p className="text-sm text-gray-500">Bài viết sẽ được duyệt trước khi hiển thị công khai.</p>
    </form>
  )
}


