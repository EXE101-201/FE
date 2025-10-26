import { FormEvent, useState } from 'react'
import { addHabit, listHabits, tickHabit } from '../lib/storage'

export default function Habits() {
  const [title, setTitle] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const habits = listHabits()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addHabit(title.trim())
    setTitle('')
    setRefreshKey(k=>k+1)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Thói quen nhỏ</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} className="flex-1 border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="Ví dụ: Uống nước, hít thở 1 phút..." />
        <button className="px-3 py-2 rounded bg-blue-600 text-white">Thêm</button>
      </form>
      <div className="grid gap-2">
        {habits.length === 0 && <p className="text-gray-500">Chưa có thói quen nào.</p>}
        {habits.map(h => (
          <div key={h.id} className="flex items-center justify-between border rounded p-3 bg-white dark:bg-gray-900 dark:border-gray-800">
            <div>
              <p className="font-medium">{h.title}</p>
              <p className="text-xs text-gray-500">Chuỗi ngày: {h.streak}{h.lastDone ? ` (gần nhất: ${h.lastDone})` : ''}</p>
            </div>
            <button onClick={()=>{tickHabit(h.id); setRefreshKey(k=>k+1)}} className="px-3 py-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">Đã làm hôm nay</button>
          </div>
        ))}
      </div>
    </div>
  )
}



