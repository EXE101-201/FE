import { listConfessions, moderateConfession } from '../lib/storage'

export default function Admin() {
  const pending = listConfessions(true).filter(c => c.status === 'pending')
  const approved = listConfessions(true).filter(c => c.status === 'approved')
  const rejected = listConfessions(true).filter(c => c.status === 'rejected')

  const totalReactions = approved.reduce((sum, c)=> sum + Object.values(c.reactions).reduce((a,b)=>a+b,0), 0)
  const totalComments = approved.reduce((sum, c)=> sum + c.comments.length, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Quản trị</h1>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded border bg-white dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-500">Đang chờ duyệt</p>
          <p className="text-2xl font-semibold">{pending.length}</p>
        </div>
        <div className="p-4 rounded border bg-white dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-500">Tổng cảm xúc</p>
          <p className="text-2xl font-semibold">{totalReactions}</p>
        </div>
        <div className="p-4 rounded border bg-white dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-500">Tổng bình luận</p>
          <p className="text-2xl font-semibold">{totalComments}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Duyệt bài</h2>
        {pending.length === 0 && <p className="text-gray-500 text-sm">Không có bài chờ duyệt.</p>}
        {pending.map(c => (
          <div key={c.id} className="p-3 border rounded bg-white dark:bg-gray-900 dark:border-gray-800">
            <p className="whitespace-pre-wrap mb-2">{c.content}</p>
            <div className="flex gap-2">
              <button onClick={()=>{moderateConfession(c.id, 'approved'); location.reload()}} className="px-3 py-2 rounded bg-green-600 text-white">Duyệt</button>
              <button onClick={()=>{moderateConfession(c.id, 'rejected'); location.reload()}} className="px-3 py-2 rounded bg-red-600 text-white">Từ chối</button>
            </div>
          </div>
        ))}
      </section>

      {rejected.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium">Đã từ chối</h2>
          {rejected.map(c => (
            <div key={c.id} className="text-sm p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-800">
              {c.content}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}



