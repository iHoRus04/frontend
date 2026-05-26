import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ room_number: '', price: '', status: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({ room_number: '', price: '', status: 'available' });
  const [createLoading, setCreateLoading] = useState(false);

  async function fetchRooms() {
    setError(null);
    try {
      setLoading(true);
      const res = await axios.get('/rooms');
      const data = res.data?.data || [];
      setRooms(data);
    } catch (err) {
      console.error('fetchRooms error', err.response || err);
      setError(formatApiError(err) || 'Lỗi khi tải phòng');
    } finally {
      setLoading(false);
    }
  }

  function formatApiError(err) {
    if (!err) return null;
    const res = err.response?.data;
    if (!res) return err.message;

    if (res.errors && typeof res.errors === 'object') {
      const msgs = Object.values(res.errors).flat();
      return msgs.join('; ');
    }
    return res.message || JSON.stringify(res);
  } 

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchRooms();
    return () => { mounted = false; };
  }, []);

  // show alert when error occurs, then clear it
  useEffect(() => {
    if (error) {
      window.alert(error);
      setError(null);
    }
  }, [error]);

  const startEdit = (r) => {
    setEditId(r.id);
    setEditData({ room_number: r.room_number || '', price: r.price || '', status: r.status || '' });
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateData(prev => ({ ...prev, [name]: value }));
  };

  const createRoom = async (e) => {
    e.preventDefault();
    // clear any previous general error
    setError(null);
    try {
      setCreateLoading(true);
      await axios.post('/rooms', {
        room_number: createData.room_number,
        price: Math.round(Number(createData.price)),
        status: createData.status || 'available',
      });
      setCreateData({ room_number: '', price: '', status: '' });
      setShowCreate(false);
      await fetchRooms();
    } catch (err) {
      setError(formatApiError(err) || 'Lỗi khi tạo phòng');
    } finally {
      setCreateLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({ room_number: '', price: '', status: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    setError(null);
    try {
      setLoading(true);
      await axios.put(`/rooms/${editId}`, {
        room_number: editData.room_number,
        price: Math.round(Number(editData.price)),
        status: editData.status,
      });
      await fetchRooms();
      cancelEdit();
    } catch (err) {
      setError(formatApiError(err) || 'Lỗi khi cập nhật phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Bạn có chắc muốn xóa phòng này không?');
    if (!ok) return;
    try {
      setLoading(true);
      await axios.delete(`/rooms/${id}`);
      await fetchRooms();
    } catch (err) {
      console.error('handleDelete error', err.response || err);
      setError(formatApiError(err) || 'Lỗi khi xóa phòng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải phòng...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2>Danh sách phòng</h2>
      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setShowCreate(s => !s)} style={{ marginRight: 8 }}>
            {showCreate ? 'Đóng' : 'Thêm phòng mới'}
          </button>
          {showCreate && (
            <form onSubmit={createRoom} style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <input name="room_number" placeholder="Số phòng" value={createData.room_number} onChange={handleCreateChange} />
                
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <input name="price" type="number" step="1" placeholder="Giá" value={createData.price} onChange={handleCreateChange} />
                
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <select name="status" value={createData.status} onChange={handleCreateChange}>
                  <option value="available">available</option>
                  <option value="rented">rented</option>
                </select>
                
              </div>
              <button type="submit" disabled={createLoading} style={{ marginLeft: 8 }}>{createLoading ? 'Đang tạo...' : 'Tạo'}</button>
              <button type="button" onClick={() => { setShowCreate(false); setCreateData({ room_number: '', price: '', status: 'available' }); }}>
                Hủy
              </button>
            </form>
          )}
        </div>
        {rooms.length === 0 ? (
          <div>Không có phòng</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Phòng</th>
                <th style={{ padding: 8 }}>Giá</th>
                <th style={{ padding: 8 }}>Trạng thái</th>
                <th style={{ padding: 8 }}>Cập nhật</th>
                <th style={{ padding: 8 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{r.id}</td>
                  <td style={{ padding: 8 }}>
                    {editId === r.id ? (
                      <input name="room_number" value={editData.room_number} onChange={handleChange} />
                    ) : (
                      r.room_number
                    )}
                  </td>
                  <td style={{ padding: 8 }}>
                    {editId === r.id ? (
                      <input name="price" type="number" step="1" value={editData.price} onChange={handleChange} />
                    ) : (
                      `${Number(r.price).toLocaleString('vi-VN')} ₫`
                    )}
                  </td>
                  <td style={{ padding: 8 }}>
                    {editId === r.id ? (
                      <select name="status" value={editData.status} onChange={handleChange}>
                        <option value="available">available</option>
                        <option value="rented">rented</option>
                      </select>
                    ) : (
                      r.status
                    )}
                  </td>
                  <td style={{ padding: 8 }}>{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</td>
                  <td style={{ padding: 8 }}>
                    {editId === r.id ? (
                      <>
                        <button onClick={saveEdit} style={{ marginRight: 8 }}>Lưu</button>
                        <button onClick={cancelEdit}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(r)} style={{ marginRight: 8 }}>Sửa</button>
                        <button onClick={() => handleDelete(r.id)} style={{ color: 'crimson' }}>Xóa</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
