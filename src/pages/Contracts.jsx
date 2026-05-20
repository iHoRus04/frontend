import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async function fetchContracts() {
      try {
        setLoading(true);
        const res = await axios.get('/contracts');
        if (!mounted) return;
        const data = res.data?.data || [];
        setContracts(data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Lỗi khi tải hợp đồng');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải hợp đồng...</div>;
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2>Danh sách hợp đồng</h2>
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
                <th style={{ padding: 8 }}>Bắt đầu</th>
                <th style={{ padding: 8 }}>Kết thúc</th>
                <th style={{ padding: 8 }}>Tiền cọc</th>
                <th style={{ padding: 8 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{c.id}</td>
                  <td style={{ padding: 8 }}>{c.room?.room_number ?? c.room_id}</td>
                  <td style={{ padding: 8 }}>{c.tenant?.full_name ?? c.tenant_id}</td>
                  <td style={{ padding: 8 }}>{c.start_date}</td>
                  <td style={{ padding: 8 }}>{c.end_date}</td>
                  <td style={{ padding: 8 }}>{c.deposit_amount}</td>
                  <td style={{ padding: 8 }}>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
