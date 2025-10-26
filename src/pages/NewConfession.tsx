import { FormEvent, useState } from 'react'
import { addConfession } from '../lib/storage'
import { useNavigate } from 'react-router-dom'

export default function NewConfession() {
  const [content, setContent] = useState('')
  const navigate = useNavigate()
  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    const c = addConfession(content.trim())
    navigate(`/confessions/${c.id}`)
  }
  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Đăng confession ẩn danh</h1>
      <textarea
        value={content}
        onChange={e=>setContent(e.target.value)}
        placeholder="Chia sẻ câu chuyện của bạn..."
        className="w-full min-h-40 p-3 border rounded bg-white dark:bg-gray-900"
      />
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Gửi</button>
        <button type="button" onClick={()=>navigate(-1)} className="px-4 py-2 rounded border">Hủy</button>
      </div>
      <p className="text-sm text-gray-500">Bài viết sẽ được duyệt trước khi hiển thị công khai.</p>
    </form>
  )
}



