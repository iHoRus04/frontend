import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createData, setCreateData] = useState({ full_name: '', phone: '', identity_card: '', address: '' })
  const [createLoading, setCreateLoading] = useState(false)

  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({ full_name: '', phone: '', identity_card: '', address: '' })

  const fetchTenants = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await axios.get('/tenants')
      setTenants(res.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải người thuê')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTenants() }, [])

  useEffect(() => {
    if (error) {
      window.alert(error)
      setError(null)
    }
  }, [error])

  const handleCreateChange = (e) => setCreateData(d => ({ ...d, [e.target.name]: e.target.value }))
  const handleChange = (e) => setEditData(d => ({ ...d, [e.target.name]: e.target.value }))

  const validPhone = (v) => /^\d{9,11}$/.test(String(v).trim())
  const validIdentity = (v) => /^(?:\d{9}|\d{12})$/.test(String(v).trim())

  const createTenant = async (e) => {
    e.preventDefault(); setError(null); setCreateLoading(true)
    if (createData.phone && !validPhone(createData.phone)) { setError('SĐT không hợp lệ (chỉ chữ số, 9–11 ký tự)'); setCreateLoading(false); return }
    if (createData.identity_card && !validIdentity(createData.identity_card)) { setError('Căn cước không hợp lệ (9 hoặc 12 chữ số)'); setCreateLoading(false); return }
    try {
      await axios.post('/tenants', createData)
      setCreateData({ full_name: '', phone: '', identity_card: '', address: '' })
      setShowCreate(false)
      await fetchTenants()
    } catch (err) { setError(err.response?.data?.message || err.message || 'Lỗi khi tạo người thuê') } finally { setCreateLoading(false) }
  }

  const startEdit = (t) => { setEditId(t.id); setEditData({ full_name: t.full_name || '', phone: t.phone || '', identity_card: t.identity_card || '', address: t.address || '' }) }

  const saveEdit = async () => {
    setError(null)
    if (( editData.phone && !validPhone(editData.phone) ) && ( editData.identity_card && !validIdentity(editData.identity_card))) { setError('SĐT không hợp lệ (chỉ chữ số, 9–11 ký tự) và Căn cước không hợp lệ (9 hoặc 12 chữ số)' ); return }
    if (editData.phone && !validPhone(editData.phone)) { setError('SĐT không hợp lệ (chỉ chữ số, 9–11 ký tự)'); return }
    if (editData.identity_card && !validIdentity(editData.identity_card)) { setError('Căn cước không hợp lệ (9 hoặc 12 chữ số)'); return }
    try {
      await axios.put(`/tenants/${editId}`, editData)
      setEditId(null)
      await fetchTenants()
    } catch (err) { setError(err.response?.data?.message || err.message || 'Lỗi khi cập nhật') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người thuê này không?')) return
    setError(null)
    try {
      await axios.delete(`/tenants/${id}`)
      await fetchTenants()
    } catch (err) { setError(err.response?.data?.message || err.message || 'Lỗi khi xóa') }
  }

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải người thuê...</div>
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2>Danh sách người thuê</h2>
      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setShowCreate(s => !s)} style={{ marginRight: 8 }}>{showCreate ? 'Đóng' : 'Thêm người thuê'}</button>
          {showCreate && (
            <form onSubmit={createTenant} style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input name="full_name" placeholder="Họ tên" value={createData.full_name} onChange={handleCreateChange} />
              <input name="phone" placeholder="SĐT" value={createData.phone} onChange={handleCreateChange} />
              <input name="identity_card" placeholder="CMND" value={createData.identity_card} onChange={handleCreateChange} />
              <input name="address" placeholder="Địa chỉ" value={createData.address} onChange={handleCreateChange} />
              <button type="submit" disabled={createLoading} style={{ marginLeft: 8 }}>{createLoading ? 'Đang tạo...' : 'Tạo'}</button>
              <button type="button" onClick={() => { setShowCreate(false); setCreateData({ full_name: '', phone: '', identity_card: '', address: '' }) }}>Hủy</button>
            </form>
          )}
        </div>

        {tenants.length === 0 ? (
          <div>Không có người thuê</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Họ Tên</th>
                <th style={{ padding: 8 }}>SĐT</th>
                <th style={{ padding: 8 }}>CMND</th>
                <th style={{ padding: 8 }}>Địa chỉ</th>
                <th style={{ padding: 8 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{t.id}</td>
                  <td style={{ padding: 8 }}>{editId === t.id ? <input name="full_name" value={editData.full_name} onChange={handleChange} /> : t.full_name}</td>
                  <td style={{ padding: 8 }}>{editId === t.id ? <input name="phone" value={editData.phone} onChange={handleChange} /> : t.phone}</td>
                  <td style={{ padding: 8 }}>{editId === t.id ? <input name="identity_card" value={editData.identity_card} onChange={handleChange} /> : t.identity_card}</td>
                  <td style={{ padding: 8 }}>{editId === t.id ? <input name="address" value={editData.address} onChange={handleChange} /> : t.address}</td>
                  <td style={{ padding: 8 }}>{editId === t.id ? (<><button onClick={saveEdit} style={{ marginRight: 8 }}>Lưu</button><button onClick={() => setEditId(null)}>Hủy</button></>) : (<><button onClick={() => startEdit(t)} style={{ marginRight: 8 }}>Sửa</button><button onClick={() => handleDelete(t.id)} style={{ color: 'crimson' }}>Xóa</button></>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
