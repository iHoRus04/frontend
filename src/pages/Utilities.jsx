import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Utilities() {
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    room_id: '',
    month: new Date().getMonth() + 1,
    electric_old: '',
    electric_new: '',
    water_old: '',
    water_new: ''
  });

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [utilsRes, roomsRes] = await Promise.all([
          axios.get('/utilities'),
          axios.get('/rooms')
        ]);
        if (!mounted) return;
        setItems(utilsRes.data?.data || []);
        setRooms(roomsRes.data?.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Format tiền (chỉ dùng để hiển thị giá phòng trong dropdown)
  const formatMoney = (amount) => {
    if (!amount) return '0đ';
    return Number(amount).toLocaleString('vi-VN') + 'đ';
  };

  // Mở form thêm mới
  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      room_id: '',
      month: new Date().getMonth() + 1,
      electric_old: '',
      electric_new: '',
      water_old: '',
      water_new: ''
    });
    setShowForm(true);
  };

  // Mở form sửa
  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      room_id: item.room_id,
      month: item.month,
      electric_old: item.electric_old,
      electric_new: item.electric_new,
      water_old: item.water_old,
      water_new: item.water_new
    });
    setShowForm(true);
  };

  // Xóa chỉ số
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa chỉ số này?')) return;
    try {
      await axios.delete(`/utilities/${id}`);
      const res = await axios.get('/utilities');
      setItems(res.data?.data || []);
      alert('Xóa thành công!');
    } catch (err) {
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // Lưu (Thêm hoặc Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!formData.room_id) {
        alert('Vui lòng chọn phòng!');
        return;
      }
      if (Number(formData.electric_new) < Number(formData.electric_old)) {
        alert('Chỉ số điện mới không được nhỏ hơn chỉ số cũ!');
        return;
      }
      if (Number(formData.water_new) < Number(formData.water_old)) {
        alert('Chỉ số nước mới không được nhỏ hơn chỉ số cũ!');
        return;
      }

      const payload = {
        room_id: Number(formData.room_id),
        month: Number(formData.month),
        electric_old: Number(formData.electric_old),
        electric_new: Number(formData.electric_new),
        water_old: Number(formData.water_old),
        water_new: Number(formData.water_new)
      };

      if (editingItem) {
        await axios.put(`/utilities/${editingItem.id}`, payload);
        alert('Cập nhật thành công!');
      } else {
        await axios.post('/utilities', payload);
        alert('Thêm mới thành công!');
      }
      setShowForm(false);
      const res = await axios.get('/utilities');
      setItems(res.data?.data || []);
    } catch (err) {
      alert('Lưu thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải chỉ số điện/nước...</div>;
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>📊 Quản lý chỉ số điện / nước</h2>
        <button 
          onClick={openCreateForm} 
          style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          + Thêm chỉ số
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {items.length === 0 ? (
          <div>Không có dữ liệu chỉ số</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Phòng</th>
                <th style={{ padding: 8 }}>Tháng</th>
                <th style={{ padding: 8 }}>Điện cũ</th>
                <th style={{ padding: 8 }}>Điện mới</th>
                <th style={{ padding: 8 }}>Điện dùng</th>
                <th style={{ padding: 8 }}>Nước cũ</th>
                <th style={{ padding: 8 }}>Nước mới</th>
                <th style={{ padding: 8 }}>Nước dùng</th>
                <th style={{ padding: 8 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => {
                const electricUsed = Math.max(0, u.electric_new - u.electric_old);
                const waterUsed = Math.max(0, u.water_new - u.water_old);
                
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                    <td style={{ padding: 8 }}>{u.id}</td>
                    <td style={{ padding: 8 }}>Phòng {u.room?.room_number ?? u.room_id}</td>
                    <td style={{ padding: 8 }}>Tháng {u.month}</td>
                    <td style={{ padding: 8 }}>{u.electric_old} kWh</td>
                    <td style={{ padding: 8 }}>{u.electric_new} kWh</td>
                    <td style={{ padding: 8, fontWeight: 'bold', color: '#007bff' }}>{electricUsed} kWh</td>
                    <td style={{ padding: 8 }}>{u.water_old} m³</td>
                    <td style={{ padding: 8 }}>{u.water_new} m³</td>
                    <td style={{ padding: 8, fontWeight: 'bold', color: '#007bff' }}>{waterUsed} m³</td>
                    <td style={{ padding: 8 }}>
                      <button 
                        onClick={() => openEditForm(u)} 
                        style={{ marginRight: 8, background: '#ffc107', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)} 
                        style={{ background: '#dc3545', border: 'none', padding: '4px 8px', borderRadius: 4, color: 'white', cursor: 'pointer' }}
                      >
                        🗑 Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Thêm/Sửa */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, width: 500, maxWidth: '90%' }}>
            <h3>{editingItem ? '✏️ Sửa chỉ số' : '➕ Thêm chỉ số mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label>Chọn phòng *</label>
                <select
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      Phòng {room.room_number} - {formatMoney(room.price)}/tháng
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Tháng *</label>
                <input
                  type="number"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>Điện cũ (kWh)</label>
                  <input
                    type="number"
                    name="electric_old"
                    value={formData.electric_old}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 4 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Điện mới (kWh)</label>
                  <input
                    type="number"
                    name="electric_new"
                    value={formData.electric_new}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label>Nước cũ (m³)</label>
                  <input
                    type="number"
                    name="water_old"
                    value={formData.water_old}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 4 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Nước mới (m³)</label>
                  <input
                    type="number"
                    name="water_new"
                    value={formData.water_new}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}