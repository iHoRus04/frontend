import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ELECTRIC_PRICE = 3500;
const WATER_PRICE = 15000;

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    contract_id: '',
    electric_old: '',
    electric_new: '',
    water_old: '',
    water_new: '',
    status: 'unpaid'
  });
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [invoicesRes, contractsRes] = await Promise.all([
          axios.get('/invoices'),
          axios.get('/contracts')
        ]);
        if (!mounted) return;
        setInvoices(invoicesRes.data?.data || []);
        setContracts(contractsRes.data?.data || []);
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

  useEffect(() => {
    if (!formData.contract_id) {
      setCalculatedTotal(0);
      return;
    }
    const contract = contracts.find(c => c.id === Number(formData.contract_id));
    if (!contract) {
      setCalculatedTotal(0);
      return;
    }
    const roomPrice = Number(contract.room_price) || 0;
    const electricOld = Number(formData.electric_old) || 0;
    const electricNew = Number(formData.electric_new) || 0;
    const waterOld = Number(formData.water_old) || 0;
    const waterNew = Number(formData.water_new) || 0;
    const electricUsed = Math.max(0, electricNew - electricOld);
    const waterUsed = Math.max(0, waterNew - waterOld);
    const total = roomPrice + (electricUsed * ELECTRIC_PRICE) + (waterUsed * WATER_PRICE);
    setCalculatedTotal(total);
  }, [formData, contracts]);

  const openCreateForm = () => {
    setEditingInvoice(null);
    setFormData({
      contract_id: '',
      electric_old: '',
      electric_new: '',
      water_old: '',
      water_new: '',
      status: 'unpaid'
    });
    setShowForm(true);
  };

  const openEditForm = (invoice) => {
    const utility = invoice.utility || {};
    setEditingInvoice(invoice);
    setFormData({
      contract_id: String(invoice.contract_id),
      electric_old: utility.electric_old ?? '',
      electric_new: utility.electric_new ?? '',
      water_old: utility.water_old ?? '',
      water_new: utility.water_new ?? '',
      status: invoice.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    try {
      await axios.delete(`/invoices/${id}`);
      const res = await axios.get('/invoices');
      setInvoices(res.data?.data || []);
    } catch (err) {
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const contract = contracts.find(c => c.id === Number(formData.contract_id));
      if (!contract) throw new Error('Không tìm thấy hợp đồng');
      const roomPrice = Number(contract.room_price);
      const electricOld = Number(formData.electric_old);
      const electricNew = Number(formData.electric_new);
      const waterOld = Number(formData.water_old);
      const waterNew = Number(formData.water_new);
      const electricTotal = Math.max(0, electricNew - electricOld);
      const waterTotal = Math.max(0, waterNew - waterOld);
      const payload = {
        contract_id: formData.contract_id,
        electric_old: electricOld,
        electric_new: electricNew,
        water_old: waterOld,
        water_new: waterNew,
        status: formData.status,
        room_price: roomPrice,
        electric_total: electricTotal,
        water_total: waterTotal,
        total_amount: calculatedTotal,
      };
      if (editingInvoice) {
        await axios.put(`/invoices/${editingInvoice.id}`, payload);
      } else {
        await axios.post('/invoices', payload);
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
                  <td style={{ padding: 8 }}>{i.room_price} VND</td>
                  <td style={{ padding: 8 }}>{i.electric_total} kWh</td>
                  <td style={{ padding: 8 }}>{i.water_total} m³</td>
                  <td style={{ padding: 8 }}>{i.total_amount} VND</td>
                  <td style={{ padding: 8 }}>{i.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
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
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, width: 500, maxWidth: '90%' }}>
            <h3>{editingInvoice ? 'Sửa hóa đơn' : 'Thêm hóa đơn mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label>Chọn hợp đồng *</label>
                <select name="contract_id" value={formData.contract_id} onChange={handleInputChange} required style={{ width: '100%', padding: 8 }}>
                  <option value="">-- Chọn --</option>
                  {contracts.map(ct => (
                    <option key={ct.id} value={ct.id}>
                      HĐ {ct.id} - Phòng {ct.room_id} - {Number(ct.room_price).toLocaleString()}đ
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><label>Điện cũ (kWh)</label><input type="number" name="electric_old" value={formData.electric_old} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} /></div>
                <div style={{ flex: 1 }}><label>Điện mới (kWh)</label><input type="number" name="electric_new" value={formData.electric_new} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} /></div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><label>Nước cũ (m³)</label><input type="number" name="water_old" value={formData.water_old} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} /></div>
                <div style={{ flex: 1 }}><label>Nước mới (m³)</label><input type="number" name="water_new" value={formData.water_new} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} /></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleInputChange} style={{ width: '100%', padding: 8 }}>
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                </select>
              </div>
              <div style={{ marginBottom: 20, padding: 10, background: '#f0f0f0', borderRadius: 4 }}>
                <strong>Tổng tiền tự động: {calculatedTotal.toLocaleString()} VND</strong>
                <div style={{ fontSize: 12, color: '#666' }}>(Điện: {(formData.electric_new - formData.electric_old) || 0} kWh × {ELECTRIC_PRICE}đ + Nước: {(formData.water_new - formData.water_old) || 0} m³ × {WATER_PRICE}đ)</div>
              </div>
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
