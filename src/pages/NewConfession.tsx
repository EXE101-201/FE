import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createConfession } from '../lib/api'
import { message } from 'antd'
import { containsBadWords } from '../lib/badWords'

const availableTags = ['stress', 'học_tập', 'mối_quan_hệ', 'gia_đình']

export default function NewConfession() {
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customTags, setCustomTags] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent) {
      e.preventDefault()
      setError('')
      if (!content.trim() || !accepted) {
        setError('Vui lòng nhập nội dung và chấp nhận quy tắc.')
        return
      }
      if (containsBadWords(content)) {
        setError('Nội dung chứa từ ngữ không phù hợp.')
        return
      }
      // Process tags
      const customTagList = customTags.split(',').map(t => t.trim()).filter(t => t)
      const allTags = [...selectedTags, ...customTagList]
      const processedTags = allTags
        .map(tag => tag.toLowerCase().trim())
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
        .slice(0, 5)
      if (processedTags.length === 0) {
        setError('Vui lòng chọn ít nhất một tag.')
        return
      }
      setLoading(true)
      try {
        await createConfession(content.trim(), processedTags, isAnonymous)
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
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Đăng confession ẩn danh</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
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
              #{tag}
            </label>
          ))}
        </div>
      </div>
            <div>
              <p className="font-medium mb-2">Thêm tag tùy chỉnh (phân cách bằng dấu phẩy, tối đa 5 tag tổng cộng):</p>
              <input
                type="text"
                value={customTags}
                onChange={e => setCustomTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="w-full p-2 border rounded"
              />
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
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                    />
                    Đăng ẩn danh
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

