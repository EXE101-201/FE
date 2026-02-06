import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api, { createConfession, joinChallenge, updateChallengeProgress } from '../lib/api'
import { message, App } from 'antd'
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
  const location = useLocation()
  const { modal } = App.useApp()
  const challengeId = location.state?.challengeId


  const checkChallenge = async () => {
    const response = await api.get(`/challenges/${challengeId}`);
    const data = response.data;
    if (!data.userProgress) {
      await joinChallenge(challengeId);
    }
  }
  useEffect(() => {
    if (challengeId) {
      checkChallenge();
    }
  }, [])

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

      if (challengeId) {
        try {
          await updateChallengeProgress(challengeId);
          modal.success({
            title: <span className="text-2xl font-bold text-[#2d5c40]">Chúc mừng!</span>,
            content: (
              <div className="text-center py-4">
                <img src="https://cdn-icons-png.flaticon.com/512/3112/3112946.png" alt="Success" className="w-24 h-24 mx-auto mb-4" />
                <p className="text-lg text-gray-600">
                  Bạn đã hoàn thành thử thách viết tâm sự hôm nay! 🎉 <br />
                  Hãy tiếp tục chia sẻ để lòng mình nhẹ nhàng hơn nhé.
                </p>
              </div>
            ),
            centered: true,
            width: 500,
            okText: 'Tuyệt vời',
            onOk: () => navigate('/confessions')
          });
        } catch (updateErr) {
          console.error("Update challenge failed", updateErr);
          message.success('Gửi confession thành công! Đang chờ duyệt.');
          navigate('/confessions');
        }
      } else {
        message.success('Gửi confession thành công! Đang chờ duyệt.')
        navigate('/confessions')
      }
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
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Decor */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600"></div>

        <form onSubmit={onSubmit} className="p-8 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Chia sẻ tâm tư
            </h1>
            <p className="text-gray-500">Hãy để lòng mình nhẹ nhàng hơn qua những dòng chữ ẩn danh.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-shake">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Nội dung tâm sự
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Bạn đang cảm thấy thế nào? Hãy viết ra đây nhé..."
              className="w-full min-h-[200px] p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none text-gray-800 leading-relaxed"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Chọn chủ đề (Tags)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform active:scale-95 ${selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                    }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={customTags}
                onChange={e => setCustomTags(e.target.value)}
                placeholder="Thêm tag tùy chỉnh (ví dụ: thi_cu, ap_luc...)"
                className="w-full p-3 pl-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm"
              />
              <p className="mt-2 text-[11px] text-gray-400 ml-1">Phân cách các tag bằng dấu phẩy. Tối đa 5 tag tổng cộng.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <label className="relative flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  Đăng dưới tên ẩn danh
                </span>
              </label>

              <label className="relative flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  required
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  Tôi đồng ý với quy tắc cộng đồng
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all active:scale-95"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !accepted}
                className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none active:scale-95"
              >
                {loading ? 'Đang gửi...' : 'Đăng ngay'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-700/70 italic">
              "Sức khỏe tinh thần của bạn quan trọng. Hãy chia sẻ để được thấu hiểu."
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

