import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { ambassadorAPI, embedAPI } from '../utils/apicopy'

const Embeds = () => {
  const [loading, setLoading] = useState(false)
  const [ambassadors, setAmbassadors] = useState([])
  const [configs, setConfigs] = useState([])

  const [form, setForm] = useState({
    clientWebUrl: '',
    clientWebName: '',
    ambassadorIds: [],
    uiConfig: {
      themeColor: '#4f46e5',
      position: 'right',
      buttonText: 'Chat with Ambassador',
      titleText: 'Ask our Ambassadors',
      logoUrl: '',
    },
    soldTo: {
      clientName: '',
      clientEmail: '',
      websiteUrl: '',
    }
  })

  const apiBase = import.meta.env.VITE_API_URL || ''

  const loadData = async () => {
    try {
      setLoading(true)
      const ambRes = await ambassadorAPI.getAllAmbassadors()
      const list = Array.isArray(ambRes?.data) ? ambRes.data : []
      const onlyVerifiedAmbs = list.filter(u => u.role === 'ambassador' && u.isVerified)
      setAmbassadors(onlyVerifiedAmbs)

      const cfgRes = await embedAPI.listConfigs()
      setConfigs(Array.isArray(cfgRes?.data) ? cfgRes.data : [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load embeds data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await embedAPI.createConfig(form)
      if (res?.success) {
        toast.success('Embed config created')
        setForm({
          clientWebUrl: '',
          clientWebName: '',
          ambassadorIds: [],
          uiConfig: { themeColor: '#4f46e5', position: 'right', buttonText: 'Chat with Ambassador', titleText: 'Ask our Ambassadors', logoUrl: '' },
          soldTo: { clientName: '', clientEmail: '', websiteUrl: '' }
        })
        loadData()
      } else {
        toast.error(res?.message || 'Failed to create')
      }
    } catch (e) {
      console.error(e)
      toast.error(e?.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id) => {
    try {
      setLoading(true)
      const res = await embedAPI.toggleStatus(id)
      if (res?.success) {
        toast.success('Status updated')
        loadData()
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to toggle status')
    } finally {
      setLoading(false)
    }
  }

  const recordSale = async (id, payload) => {
    try {
      setLoading(true)
      const res = await embedAPI.recordSale(id, payload)
      if (res?.success) {
        toast.success('Sale recorded')
        loadData()
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to record sale')
    } finally {
      setLoading(false)
    }
  }

  const AmbassadorSelect = () => (
    <div className="space-y-2">
      <label className="font-medium">Select Ambassadors</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-auto p-2 border rounded">
        {ambassadors.map(a => {
          const checked = form.ambassadorIds.includes(a._id)
          return (
            <label key={a._id} className={`flex items-center gap-2 p-2 rounded border ${checked ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...form.ambassadorIds, a._id]
                    : form.ambassadorIds.filter(id => id !== a._id)
                  setForm(prev => ({ ...prev, ambassadorIds: next }))
                }}
              />
              <span>{a.name}</span>
            </label>
          )
        })}
      </div>
    </div>
  )

  const ScriptSnippet = ({ configKey }) => {
    const src = `${apiBase}/api/embed/widget/${configKey}.js`
    const snippet = `<script src="${src}" async></script>`
    return (
      <div className="mt-2">
        <div className="text-xs text-slate-500 mb-1">Embed this on client site:</div>
        <pre className="bg-slate-900 text-green-300 text-sm p-3 rounded overflow-auto"><code>{snippet}</code></pre>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Create Embed Configuration</h2>
        <form onSubmit={handleCreate} className="grid gap-4 max-w-3xl p-4 bg-white rounded shadow">
          <div>
            <label className="block text-sm font-medium">Client Website URL</label>
            <input className="mt-1 w-full border rounded p-2" placeholder="https://clientdomain.com" value={form.clientWebUrl} onChange={(e)=>setForm(prev=>({...prev, clientWebUrl: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Client Website Name</label>
            <input className="mt-1 w-full border rounded p-2" placeholder="Client Name" value={form.clientWebName} onChange={(e)=>setForm(prev=>({...prev, clientWebName: e.target.value}))} />
          </div>
          <AmbassadorSelect />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Theme Color</label>
              <input type="color" className="mt-1 w-16 h-10 p-1 border rounded" value={form.uiConfig.themeColor} onChange={(e)=>setForm(prev=>({...prev, uiConfig: { ...prev.uiConfig, themeColor: e.target.value }}))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Position</label>
              <select className="mt-1 w-full border rounded p-2" value={form.uiConfig.position} onChange={(e)=>setForm(prev=>({...prev, uiConfig: { ...prev.uiConfig, position: e.target.value }}))}>
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Button Text</label>
              <input className="mt-1 w-full border rounded p-2" value={form.uiConfig.buttonText} onChange={(e)=>setForm(prev=>({...prev, uiConfig: { ...prev.uiConfig, buttonText: e.target.value }}))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Title Text</label>
              <input className="mt-1 w-full border rounded p-2" value={form.uiConfig.titleText} onChange={(e)=>setForm(prev=>({...prev, uiConfig: { ...prev.uiConfig, titleText: e.target.value }}))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Logo URL (optional)</label>
              <input className="mt-1 w-full border rounded p-2" value={form.uiConfig.logoUrl} onChange={(e)=>setForm(prev=>({...prev, uiConfig: { ...prev.uiConfig, logoUrl: e.target.value }}))} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Client Name (for history)</label>
              <input className="mt-1 w-full border rounded p-2" value={form.soldTo.clientName} onChange={(e)=>setForm(prev=>({...prev, soldTo: { ...prev.soldTo, clientName: e.target.value }}))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Client Email</label>
              <input className="mt-1 w-full border rounded p-2" value={form.soldTo.clientEmail} onChange={(e)=>setForm(prev=>({...prev, soldTo: { ...prev.soldTo, clientEmail: e.target.value }}))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Client Website</label>
              <input className="mt-1 w-full border rounded p-2" value={form.soldTo.websiteUrl} onChange={(e)=>setForm(prev=>({...prev, soldTo: { ...prev.soldTo, websiteUrl: e.target.value }}))} />
            </div>
          </div>

          <div>
            <button disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">{loading ? 'Saving...' : 'Create Config'}</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Embed Configurations</h2>
        <div className="overflow-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Client</th>
                <th className="p-3">Config Key</th>
                <th className="p-3">Status</th>
                <th className="p-3">Sold To</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(cfg => (
                <tr key={cfg._id} className="border-b align-top">
                  <td className="p-3">
                    <div className="font-medium">{cfg.clientWebName}</div>
                    <div className="text-xs text-slate-500">{cfg.clientWebUrl}</div>
                    <ScriptSnippet configKey={cfg.configKey} />
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">{cfg.configKey}</code>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${cfg.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{cfg.status ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{cfg.soldTo?.clientName || '-'}</div>
                    <div className="text-xs text-slate-500">{cfg.soldTo?.clientEmail || ''}</div>
                    <div className="text-xs text-slate-500">{cfg.soldTo?.websiteUrl || ''}</div>
                  </td>
                  <td className="p-3 space-y-2">
                    <button onClick={()=>toggleStatus(cfg._id)} className="px-3 py-1 rounded bg-slate-800 text-white">{cfg.status ? 'Deactivate' : 'Activate'}</button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input placeholder="Client Name" className="border rounded p-2" onChange={(e)=>cfg.__saleName=e.target.value} />
                      <input placeholder="Client Email" className="border rounded p-2" onChange={(e)=>cfg.__saleEmail=e.target.value} />
                      <input placeholder="Website URL" className="border rounded p-2" onChange={(e)=>cfg.__saleUrl=e.target.value} />
                      <button onClick={()=>recordSale(cfg._id, { clientName: cfg.__saleName||'', clientEmail: cfg.__saleEmail||'', websiteUrl: cfg.__saleUrl||'', status: cfg.status ? 'active' : 'inactive' })} className="sm:col-span-3 px-3 py-1 rounded bg-indigo-600 text-white">Record Sale</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!configs.length && (
                <tr>
                  <td className="p-3 text-slate-500" colSpan={5}>No configurations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Embeds
