import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [formData, setFormData] = useState({
    room_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    deposit_amount: '',
    status: 'active'
  });
  const [rooms, setRooms] = useState([]);      // Danh sách phòng để chọn
  const [tenants, setTenants] = useState([]);  // Danh sách người thuê để chọn

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [contractsRes, roomsRes, tenantsRes] = await Promise.all([
          axios.get('/contracts'),
          axios.get('/rooms'),
          axios.get('/tenants')
        ]);
        if (!mounted) return;
        setContracts(contractsRes.data?.data || []);
        setRooms(roomsRes.data?.data || []);
        setTenants(tenantsRes.data?.data || []);
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

  // Format ngày tháng
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  // Format tiền
  const formatMoney = (amount) => {
    if (!amount) return '0₫';
    return Number(amount).toLocaleString('vi-VN') + '₫';
  };

  // Mở form thêm mới
  const openCreateForm = () => {
    setEditingContract(null);
    setFormData({
      room_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      deposit_amount: '',
      status: 'active'
    });
    setShowForm(true);
  };

  // Mở form sửa
  const openEditForm = (contract) => {
    setEditingContract(contract);
    setFormData({
      room_id: contract.room_id,
      tenant_id: contract.tenant_id,
      start_date: contract.start_date ? contract.start_date.split('T')[0] : '',
      end_date: contract.end_date ? contract.end_date.split('T')[0] : '',
      deposit_amount: contract.deposit_amount,
      status: contract.status
    });
    setShowForm(true);
  };

  // Xóa hợp đồng
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) return;
    try {
      await axios.delete(`/contracts/${id}`);
      const res = await axios.get('/contracts');
      setContracts(res.data?.data || []);
      alert('Xóa hợp đồng thành công!');
    } catch (err) {
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // Lưu hợp đồng (Thêm hoặc Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!formData.room_id) {
        alert('Vui lòng chọn phòng!');
        return;
      }
      if (!formData.tenant_id) {
        alert('Vui lòng chọn người thuê!');
        return;
      }
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        alert('Ngày kết thúc phải sau ngày bắt đầu!');
        return;
      }

      const payload = {
        room_id: Number(formData.room_id),
        tenant_id: Number(formData.tenant_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        deposit_amount: formData.deposit_amount,
        status: formData.status
      };

      if (editingContract) {
        await axios.put(`/contracts/${editingContract.id}`, payload);
        alert('Cập nhật hợp đồng thành công!');
      } else {
        await axios.post('/contracts', payload);
        alert('Thêm hợp đồng thành công!');
      }
      setShowForm(false);
      const res = await axios.get('/contracts');
      setContracts(res.data?.data || []);
    } catch (err) {
      alert('Lưu thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải hợp đồng...</div>;
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: 20 }}>
        <h2>📋 Danh sách hợp đồng</h2>
        <button 
          onClick={openCreateForm} 
          style={{ padding: '8px 16px', background: '#007bff', color: '#fff', 
            border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          + Thêm hợp đồng
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {contracts.length === 0 ? (
          <div>Không có hợp đồng</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Phòng</th>
                <th style={{ padding: 8 }}>Người thuê</th>
                <th style={{ padding: 8 }}>SĐT</th>
                <th style={{ padding: 8 }}>Bắt đầu</th>
                <th style={{ padding: 8 }}>Kết thúc</th>
                <th style={{ padding: 8 }}>Tiền cọc</th>
                <th style={{ padding: 8 }}>Giá phòng</th>
                <th style={{ padding: 8 }}>Trạng thái</th>
                <th style={{ padding: 8 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{c.id}</td>
                  <td style={{ padding: 8 }}>Phòng {c.room?.room_number ?? c.room_id}</td>
                  <td style={{ padding: 8 }}>{c.tenant?.full_name ?? 'N/A'}</td>
                  <td style={{ padding: 8 }}>{c.tenant?.phone ?? 'N/A'}</td>
                  <td style={{ padding: 8 }}>{formatDate(c.start_date)}</td>
                  <td style={{ padding: 8 }}>{formatDate(c.end_date)}</td>
                  <td style={{ padding: 8 }}>{formatMoney(c.deposit_amount)}</td>
                  <td style={{ padding: 8 }}>{formatMoney(c.room?.price ?? 0)}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 20,
                      background: c.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: c.status === 'active' ? '#155724' : '#721c24'
                    }}>
                      {c.status === 'active' ? 'Đang thuê' : 'Đã kết thúc'}
                    </span>
                  </td>
                  <td style={{ padding: 8 }}>
                    <button 
                      onClick={() => openEditForm(c)} 
                      style={{ marginRight: 8, background: '#ffc107', border: 'none', 
                        padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
                    >
                      ✏️ Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)} 
                      style={{ background: '#dc3545', border: 'none', padding: '4px 8px', 
                        borderRadius: 4, color: 'white', cursor: 'pointer' }}
                    >
                      🗑 Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form Thêm/Sửa Hợp Đồng */}
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
          <div style={{ background: 'white', padding: 24, borderRadius: 8, 
            width: 500, maxWidth: '90%' }}>
            <h3>{editingContract ? '✏️ Sửa hợp đồng' : '➕ Thêm hợp đồng mới'}</h3>
            <form onSubmit={handleSubmit}>
              {/* Chọn phòng */}
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

              {/* Chọn người thuê */}
              <div style={{ marginBottom: 12 }}>
                <label>Chọn người thuê *</label>
                <select
                  name="tenant_id"
                  value={formData.tenant_id}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                >
                  <option value="">-- Chọn người thuê --</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.full_name} - {tenant.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày bắt đầu */}
              <div style={{ marginBottom: 12 }}>
                <label>Ngày bắt đầu *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </div>

              {/* Ngày kết thúc */}
              <div style={{ marginBottom: 12 }}>
                <label>Ngày kết thúc *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </div>

              {/* Tiền cọc */}
              <div style={{ marginBottom: 12 }}>
                <label>Tiền cọc (VNĐ) *</label>
                <input
                  type="number"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleInputChange}
                  required
                  placeholder="Ví dụ: 5000000"
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </div>

              {/* Trạng thái */}
              <div style={{ marginBottom: 20 }}>
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                >
                  <option value="active">Đang thuê</option>
                  <option value="terminated">Đã kết thúc</option>
                </select>
              </div>

              {/* Nút hành động */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ padding: '8px 16px', background: '#6c757d', color: 'white', 
                    border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#28a745', color: 'white', 
                    border: 'none', borderRadius: 4, cursor: 'pointer' }}
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