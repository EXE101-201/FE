import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addConfession } from '../lib/storage'
import { message } from 'antd'

const availableTags = ['Học tập', 'Stress', 'Mối quan hệ', 'Gia đình']

export default function NewConfession() {
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim() || !accepted) return

    setLoading(true)
    try {
      addConfession(content.trim(), selectedTags)
      message.success('Gửi confession thành công! Đang chờ duyệt.')
      navigate('/confessions')
    } catch (error) {
      message.error('Lỗi khi gửi bài viết')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Đăng confession ẩn danh</h1>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Bạn đang cảm thấy thế nào?"
        className="w-full min-h-40 p-3 border rounded bg-white dark:bg-gray-300"
        required
      />
      <div>
        <p className="font-medium mb-2">Chọn tag (có thể chọn nhiều):</p>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <label key={tag} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => toggleTag(tag)}
                className="rounded"
              />
              #{tag.toLowerCase().replace(' ', '_')}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={accepted}
          onChange={e => setAccepted(e.target.checked)}
          required
        />
        Tôi hiểu đây là không gian tích cực
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={loading || !accepted} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded border">Hủy</button>
      </div>
      <p className="text-sm text-gray-500">Bài viết sẽ được duyệt trước khi hiển thị công khai.</p>
    </form>
  )
}


