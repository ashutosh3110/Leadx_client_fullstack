import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import AmbassadorCard from "../user/AmbassadorCard"
import Pagination from "../user/Pagination"

const apiBase = import.meta.env.VITE_API_URL || window.LEADX_API_BASE || ""

const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const ChatForm = ({ open, onClose, ambassador, configKey }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
      setSubmitting(false)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !phone || !message) return alert("Please fill all fields")
    try {
      setSubmitting(true)
      const data = await fetchJSON(`${apiBase}/api/embed/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configKey, ambassadorId: ambassador?._id, name, email, phone, message }),
      })
      if (data?.success) {
        alert("Message submitted! We'll contact you via email.")
        onClose()
      } else {
        alert(data?.message || "Failed to submit")
      }
    } catch (err) {
      console.error(err)
      alert("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Chat with {ambassador?.name || "Ambassador"}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full border rounded p-2" placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="w-full border rounded p-2" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <textarea className="w-full border rounded p-2" rows={4} placeholder="Your message" value={message} onChange={(e)=>setMessage(e.target.value)} />
          <button disabled={submitting} className="w-full bg-indigo-600 text-white rounded p-2 disabled:opacity-50">{submitting?"Sending...":"Send"}</button>
        </form>
      </div>
    </div>
  )
}

export default function EmbedView() {
  const { configKey } = useParams()
  const [cfg, setCfg] = useState(null)
  const [ambassadors, setAmbassadors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)

  const [chatOpen, setChatOpen] = useState(false)
  const [selectedAmb, setSelectedAmb] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const cfgRes = await fetchJSON(`${apiBase}/api/embed/public/config/${configKey}`)
        const cfgData = cfgRes?.data || cfgRes // respo wrapper
        setCfg(cfgData)

        const ambRes = await fetchJSON(`${apiBase}/api/auth/ambassadors/public`)
        const all = ambRes?.data || []
        const ids = (cfgData?.ambassadorIds || [])
        const filtered = ids.length ? all.filter(a => ids.includes(String(a._id))) : all
        setAmbassadors(filtered)
        setError("")
      } catch (e) {
        console.error(e)
        setError("Failed to load embed view")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [configKey])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(ambassadors.length / itemsPerPage)), [ambassadors.length, itemsPerPage])
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentAmbassadors = useMemo(() => ambassadors.slice(startIndex, startIndex + itemsPerPage), [ambassadors, startIndex, itemsPerPage])

  const handleChat = (amb) => {
    setSelectedAmb(amb)
    setChatOpen(true)
  }

  const handleCloseChat = () => {
    setChatOpen(false)
    setSelectedAmb(null)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">{cfg?.uiConfig?.titleText || "Chat with an Ambassador"}</h1>
          <p className="text-sm text-gray-600 text-center mt-2">Showing {ambassadors.length} ambassadors</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 overflow-x-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-hidden">
            {currentAmbassadors.map((amb) => (
              <AmbassadorCard key={amb._id} ambassador={amb} onChat={handleChat} onViewProfile={() => {}} />
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n)=>{ setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      <ChatForm open={chatOpen} onClose={handleCloseChat} ambassador={selectedAmb} configKey={configKey} />
    </div>
  )
}
