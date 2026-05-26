import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ELECTRIC_PRICE = 3500;
const WATER_PRICE = 15000;

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [utilities, setUtilities] = useState([]);  // Thêm state utilities
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    contract_id: '',
    utility_id: '',        // Thay vì nhập chỉ số, chọn utility_id
    status: 'unpaid'
  });
  const [selectedUtility, setSelectedUtility] = useState(null); // Lưu utility được chọn
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  
  // Lấy dữ liệu ban đầu
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [invoicesRes, contractsRes, utilitiesRes] = await Promise.all([
          axios.get('/invoices'),
          axios.get('/contracts'),
          axios.get('/utilities')  // Thêm API lấy utilities
        ]);
        if (!mounted) return;
        setInvoices(invoicesRes.data?.data || []);
        setContracts(contractsRes.data?.data || []);
        setUtilities(utilitiesRes.data?.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Lỗi tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Tự động tính tổng tiền khi chọn utility
  useEffect(() => {
    if (!formData.utility_id) {
      setCalculatedTotal(0);
      setSelectedUtility(null);
      return;
    }
    const utility = utilities.find(u => u.id === Number(formData.utility_id));
    if (!utility) {
      setCalculatedTotal(0);
      setSelectedUtility(null);
      return;
    }
    setSelectedUtility(utility);
    
    // Tìm contract để lấy room_price
    const contract = contracts.find(c => c.id === Number(formData.contract_id));
    const roomPrice = Number(contract?.room_price) || 0;
    
    // Tính điện, nước tiêu thụ từ utility
    const electricUsed = Math.max(0, utility.electric_new - utility.electric_old);
    const waterUsed = Math.max(0, utility.water_new - utility.water_old);
    const electricCost = electricUsed * ELECTRIC_PRICE;
    const waterCost = waterUsed * WATER_PRICE;
    const total = roomPrice + electricCost + waterCost;
    setCalculatedTotal(total);
  }, [formData.utility_id, formData.contract_id, utilities, contracts]);

  const formatMoney = (amount) => {
    if (!amount) return '0₫';
    return Number(amount).toLocaleString('vi-VN') + '₫';
  };

  const openCreateForm = () => {
    setEditingInvoice(null);
    setFormData({
      contract_id: '',
      utility_id: '',
      status: 'unpaid'
    });
    setSelectedUtility(null);
    setCalculatedTotal(0);
    setShowForm(true);
  };

  const openEditForm = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      contract_id: invoice.contract_id,
      utility_id: invoice.utility_id || '',
      status: invoice.status,
    });
    // Tìm utility tương ứng để hiển thị
    const utility = utilities.find(u => u.id === invoice.utility_id);
    setSelectedUtility(utility || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    try {
      await axios.delete(`/invoices/${id}`);
      const res = await axios.get('/invoices');
      setInvoices(res.data?.data || []);
      alert('Xóa thành công!');
    } catch (err) {
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Tìm utility và contract để lấy dữ liệu
      const utility = utilities.find(u => u.id === Number(formData.utility_id));
      if (!utility) throw new Error('Không tìm thấy tiện ích');
      
      const contract = contracts.find(c => c.id === Number(formData.contract_id));
      if (!contract) throw new Error('Không tìm thấy hợp đồng');
      
      const roomPrice = Number(contract.deposit_amount) || 0; // Lấy giá phòng từ hợp đồng
      const electricTotal = Math.max(0, utility.electric_new - utility.electric_old);
      const waterTotal = Math.max(0, utility.water_new - utility.water_old);
      
      const payload = {
        contract_id: Number(formData.contract_id),
        utility_id: Number(formData.utility_id),
        room_price: roomPrice,
        electric_total: electricTotal,
        water_total: waterTotal,
        total_amount: calculatedTotal,
        status: formData.status
      };
      
      if (editingInvoice) {
        await axios.put(`/invoices/${editingInvoice.id}`, payload);
        alert('Cập nhật thành công!');
      } else {
        await axios.post('/invoices', payload);
        alert('Thêm mới thành công!');
      }
      setShowForm(false);
      const res = await axios.get('/invoices');
      setInvoices(res.data?.data || []);
    } catch (err) {
      alert('Lỗi lưu hóa đơn: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải hóa đơn...</div>;
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Danh sách hóa đơn</h2>
        <button onClick={openCreateForm} style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>
          + Thêm hóa đơn
        </button>
      </div>
      
      <div style={{ marginTop: 12 }}>
        {invoices.length === 0 ? (
          <div>Không có hóa đơn</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Hợp đồng</th>
                <th style={{ padding: 8 }}>Giá phòng</th>
                <th style={{ padding: 8 }}>Điện</th>
                <th style={{ padding: 8 }}>Nước</th>
                <th style={{ padding: 8 }}>Tổng</th>
                <th style={{ padding: 8 }}>Trạng thái</th>
                <th style={{ padding: 8 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(i => (
                <tr key={i.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{i.id}</td>
                  <td style={{ padding: 8 }}>{i.contract?.id ?? i.contract_id}</td>
                  <td style={{ padding: 8 }}>{formatMoney(i.room_price)}</td>
                  <td style={{ padding: 8 }}>{i.electric_total} kWh</td>
                  <td style={{ padding: 8 }}>{i.water_total} m³</td>
                  <td style={{ padding: 8 }}>{formatMoney(i.total_amount)}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 20,
                      background: i.status === 'paid' ? '#d4edda' : '#f8d7da',
                      color: i.status === 'paid' ? '#155724' : '#721c24'
                    }}>
                      {i.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => openEditForm(i)} style={{ marginRight: 8, background: '#ffc107', border: 'none', padding: '4px 8px', borderRadius: 4 }}>Sửa</button>
                    <button onClick={() => handleDelete(i.id)} style={{ background: '#dc3545', border: 'none', padding: '4px 8px', borderRadius: 4, color: 'white' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Modal Form Thêm/Sửa Hóa Đơn */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, width: 500, maxWidth: '90%' }}>
            <h3>{editingInvoice ? 'Sửa hóa đơn' : 'Thêm hóa đơn mới'}</h3>
            <form onSubmit={handleSubmit}>
              {/* Chọn hợp đồng */}
              <div style={{ marginBottom: 12 }}>
                <label>Chọn hợp đồng *</label>
                <select name="contract_id" value={formData.contract_id} onChange={handleInputChange} required style={{ width: '100%', padding: 8 }}>
                  <option value="">-- Chọn hợp đồng --</option>
                  {contracts.map(ct => (
                    <option key={ct.id} value={ct.id}>
                      HĐ {ct.id} - Phòng {ct.room_id} - {formatMoney(ct.deposit_amount)}/tháng
                    </option>
                  ))}
                </select>
              </div>
              {/* Hiển thị tiền phòng */}
<div style={{ marginBottom: 12 }}>
  <label>Tiền phòng (VNĐ)</label>
  <input 
    type="text" 
    name="room_price" 
    // Tìm trực tiếp từ danh sách hợp đồng dựa vào ID đang chọn
    value={formatMoney(Number(contracts.find(c => Number(c.id) === Number(formData.contract_id))?.deposit_amount || 0))} 
    readOnly 
    style={{ 
      width: '100%', 
      padding: 8, 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #ced4da',
      borderRadius: 4 
    }} 
  />
</div>
              {/* Chọn tiện ích (chỉ số điện/nước) */}
              <div style={{ marginBottom: 12 }}>
                <label>Chọn chỉ số điện/nước *</label>
                <select name="utility_id" value={formData.utility_id} onChange={handleInputChange} required style={{ width: '100%', padding: 8 }}>
                  <option value="">-- Chọn chỉ số --</option>
                  {utilities.map(u => (
                    <option key={u.id} value={u.id}>
                      Tháng {u.month} - Điện: {u.electric_old} → {u.electric_new} kWh (dùng {Math.max(0, u.electric_new - u.electric_old)} kWh) | 
                      Nước: {u.water_old} → {u.water_new} m³ (dùng {Math.max(0, u.water_new - u.water_old)} m³)
                    </option>
                  ))}
                </select>
              </div>

              {/* Hiển thị tổng hợp chỉ số đã chọn */}
              {selectedUtility && (
                <div style={{ marginBottom: 12, padding: 12, background: '#e9ecef', borderRadius: 4 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>📊 Thông tin chỉ số đã chọn:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>⚡ Điện:</span>
                    <span>{selectedUtility.electric_old} kWh → {selectedUtility.electric_new} kWh (dùng {Math.max(0, selectedUtility.electric_new - selectedUtility.electric_old)} kWh)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>💧 Nước:</span>
                    <span>{selectedUtility.water_old} m³ → {selectedUtility.water_new} m³ (dùng {Math.max(0, selectedUtility.water_new - selectedUtility.water_old)} m³)</span>
                  </div>
                </div>
              )}

              {/* Trạng thái */}
              <div style={{ marginBottom: 12 }}>
                <label>Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleInputChange} style={{ width: '100%', padding: 8 }}>
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                </select>
              </div>

              {/* Hiển thị tổng tiền tự động */}
              <div style={{ marginBottom: 20, padding: 15, background: '#28a745', color: 'white', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, opacity: 0.9 }}>💰 TỔNG TIỀN HÓA ĐƠN</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{formatMoney(calculatedTotal)}</div>
                {selectedUtility && (
                  <div style={{ fontSize: 11, marginTop: 8, opacity: 0.8 }}>
                    = {formatMoney(Number(contracts.find(c => c.id === Number(formData.contract_id))?.deposit_amount || 0))} 
                    + (⚡ {Math.max(0, selectedUtility.electric_new - selectedUtility.electric_old)} kWh × {ELECTRIC_PRICE}đ) 
                    + (💧 {Math.max(0, selectedUtility.water_new - selectedUtility.water_old)} m³ × {WATER_PRICE}đ)
                  </div>
                )}
              </div>

              {/* Nút hành động */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}>Hủy</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4 }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}