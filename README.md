# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
<!-- InVoices>
*dạng thẻ*
<!-- import React, { useEffect, useState } from 'react';
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

  // Format tiền
  const formatMoney = (amount) => {
    if (!amount) return '0₫';
    return Number(amount).toLocaleString('vi-VN') + '₫';
  };

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
      alert('Xóa thành công!');
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
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>📄 Danh sách hóa đơn</h2>
        <button 
          onClick={openCreateForm} 
          style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
        >
          + Thêm hóa đơn
        </button>
      </div>

      {/* Dạng THẺ - Card View */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: 20 
      }}>
        {invoices.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>Không có hóa đơn</div>
        ) : (
          invoices.map(i => (
            <div key={i.id} style={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 16, 
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}>
              {/* Header thẻ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>🧾</span>
                  <h3 style={{ margin: 0 }}>Hóa đơn #{i.id}</h3>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 'bold',
                  background: i.status === 'paid' ? '#d4edda' : '#f8d7da',
                  color: i.status === 'paid' ? '#155724' : '#721c24'
                }}>
                  {i.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>

              {/* Đường kẻ ngang */}
              <div style={{ borderTop: '1px solid #eee', marginBottom: 16 }} />

              {/* Nội dung thẻ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>📄 Hợp đồng:</span>
                  <strong>HĐ {i.contract?.id ?? i.contract_id}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>🏠 Giá phòng:</span>
                  <strong style={{ color: '#007bff' }}>{formatMoney(i.room_price)}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>⚡ Điện:</span>
                  <strong>{i.electric_total} kWh</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>💧 Nước:</span>
                  <strong>{i.water_total} m³</strong>
                </div>
                
                {/* Tổng tiền nổi bật */}
                <div style={{ 
                  marginTop: 8, 
                  paddingTop: 12, 
                  borderTop: '2px solid #f0f0f0',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>💰 Tổng tiền:</span>
                  <strong style={{ fontSize: 20, fontWeight: 'bold', color: '#28a745' }}>
                    {formatMoney(i.total_amount)}
                  </strong>
                </div>
              </div>

              {/* Nút thao tác */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button 
                  onClick={() => openEditForm(i)} 
                  style={{ 
                    flex: 1, 
                    padding: '8px 16px', 
                    background: '#ffc107', 
                    border: 'none', 
                    borderRadius: 8, 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                >
                  ✏️ Sửa
                </button>
                <button 
                  onClick={() => handleDelete(i.id)} 
                  style={{ 
                    flex: 1, 
                    padding: '8px 16px', 
                    background: '#dc3545', 
                    border: 'none', 
                    borderRadius: 8, 
                    color: 'white', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                >
                  🗑 Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form Thêm/Sửa (giữ nguyên) */}
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
} -->
<!-- dạng list>
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

  const formatMoney = (amount) => {
    if (!amount) return '0₫';
    return Number(amount).toLocaleString('vi-VN') + '₫';
  };

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
      alert('Xóa thành công!');
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
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>📄 Danh sách hóa đơn</h2>
        <button onClick={openCreateForm} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          + Thêm hóa đơn
        </button>
      </div>

      {/* Dạng DANH SÁCH - List View */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header danh sách */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '60px 100px 120px 100px 100px 150px 120px 120px',
          background: '#f8f9fa',
          padding: '12px 16px',
          fontWeight: 'bold',
          borderBottom: '2px solid #dee2e6',
          fontSize: 14
        }}>
          <div>ID</div>
          <div>Hợp đồng</div>
          <div>Giá phòng</div>
          <div>Điện</div>
          <div>Nước</div>
          <div>Tổng tiền</div>
          <div>Trạng thái</div>
          <div>Thao tác</div>
        </div>

        {/* Danh sách item */}
        {invoices.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Không có hóa đơn</div>
        ) : (
          invoices.map(i => (
            <div key={i.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '60px 100px 120px 100px 100px 150px 120px 120px',
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              alignItems: 'center',
              background: i.status === 'paid' ? '#f8fff8' : '#fff8f8',
              transition: 'background 0.2s'
            }}>
              <div style={{ fontWeight: 'bold' }}>{i.id}</div>
              <div>HĐ {i.contract?.id ?? i.contract_id}</div>
              <div>{formatMoney(i.room_price)}</div>
              <div>{i.electric_total} kWh</div>
              <div>{i.water_total} m³</div>
              <div style={{ fontWeight: 'bold', color: '#007bff' }}>{formatMoney(i.total_amount)}</div>
              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  background: i.status === 'paid' ? '#d4edda' : '#f8d7da',
                  color: i.status === 'paid' ? '#155724' : '#721c24'
                }}>
                  {i.status === 'paid' ? 'Đã trả' : 'Chưa trả'}
                </span>
              </div>
              <div>
                <button onClick={() => openEditForm(i)} style={{ marginRight: 8, padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Sửa</button>
                <button onClick={() => handleDelete(i.id)} style={{ padding: '4px 8px', background: '#dc3545', border: 'none', borderRadius: 4, color: 'white', cursor: 'pointer' }}>Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form (giữ nguyên) */}
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
                    <option key={ct.id} value={ct.id}>HĐ {ct.id} - Phòng {ct.room_id} - {Number(ct.room_price).toLocaleString()}đ</option>
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
<!--dạng ACCORDION>
<!--
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
  const [expandedId, setExpandedId] = useState(null); // State cho accordion
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

  const formatMoney = (amount) => {
    if (!amount) return '0₫';
    return Number(amount).toLocaleString('vi-VN') + '₫';
  };

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
      alert('Xóa thành công!');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>📄 Danh sách hóa đơn</h2>
        <button onClick={openCreateForm} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          + Thêm hóa đơn
        </button>
      </div>

      {/* Dạng ACCORDION */}
      <div>
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Không có hóa đơn</div>
        ) : (
          invoices.map(i => (
            <div key={i.id} style={{ marginBottom: 12, border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' }}>
              {/* Header Accordion */}
              <div 
                onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  background: expandedId === i.id ? '#f0f7ff' : '#f9f9f9',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ minWidth: 80 }}>HĐ #{i.id}</strong>
                  <span>🏠 Phòng {i.contract?.room_id ?? 'N/A'}</span>
                  <span>💰 {formatMoney(i.total_amount)}</span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    background: i.status === 'paid' ? '#d4edda' : '#f8d7da',
                    color: i.status === 'paid' ? '#155724' : '#721c24'
                  }}>
                    {i.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
                <span style={{ fontSize: 20, transition: 'transform 0.2s', transform: expandedId === i.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                  ▼
                </span>
              </div>

              {/* Body Accordion (hiện khi mở rộng) */}
              {expandedId === i.id && (
                <div style={{ padding: 20, borderTop: '1px solid #e0e0e0', background: 'white' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div><strong>📄 Hợp đồng:</strong> HĐ {i.contract?.id ?? i.contract_id}</div>
                    <div><strong>🏠 Giá phòng:</strong> {formatMoney(i.room_price)}</div>
                    <div><strong>⚡ Điện:</strong> {i.electric_total} kWh</div>
                    <div><strong>💧 Nước:</strong> {i.water_total} m³</div>
                    <div><strong>📅 Ngày tạo:</strong> {new Date(i.created_at).toLocaleDateString('vi-VN')}</div>
                    <div><strong>🔄 Cập nhật:</strong> {new Date(i.updated_at).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button onClick={() => openEditForm(i)} style={{ padding: '8px 16px', background: '#ffc107', border: 'none', borderRadius: 6, cursor: 'pointer' }}>✏️ Sửa</button>
                    <button onClick={() => handleDelete(i.id)} style={{ padding: '8px 16px', background: '#dc3545', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer' }}>🗑 Xóa</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Form (giữ nguyên) */}
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
                    <option key={ct.id} value={ct.id}>HĐ {ct.id} - Phòng {ct.room_id} - {Number(ct.room_price).toLocaleString()}đ</option>
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
}>