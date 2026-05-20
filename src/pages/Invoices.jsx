import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await axios.get('/invoices');
        if (!mounted) return;
        const data = res.data?.data || [];
        setInvoices(data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Lỗi khi tải hóa đơn');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải hóa đơn...</div>;
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2>Danh sách hóa đơn</h2>
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
              </tr>
            </thead>
            <tbody>
              {invoices.map(i => (
                <tr key={i.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{i.id}</td>
                  <td style={{ padding: 8 }}>{i.contract?.id ?? i.contract_id}</td>
                  <td style={{ padding: 8 }}>{i.room_price}</td>
                  <td style={{ padding: 8 }}>{i.electric_total}</td>
                  <td style={{ padding: 8 }}>{i.water_total}</td>
                  <td style={{ padding: 8 }}>{i.total_amount}</td>
                  <td style={{ padding: 8 }}>{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
