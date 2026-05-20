import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Utilities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async function fetchUtilities() {
      try {
        setLoading(true);
        const res = await axios.get('/utilities');
        if (!mounted) return;
        const data = res.data?.data || [];
        setItems(data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Lỗi khi tải tiện ích');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải tiện ích...</div>;
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2>Danh sách tiện ích</h2>
      <div style={{ marginTop: 12 }}>
        {items.length === 0 ? (
          <div>Không có dữ liệu tiện ích</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Phòng</th>
                <th style={{ padding: 8 }}>Tháng</th>
                <th style={{ padding: 8 }}>ĐT cũ</th>
                <th style={{ padding: 8 }}>ĐT mới</th>
                <th style={{ padding: 8 }}>NC cũ</th>
                <th style={{ padding: 8 }}>NC mới</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{u.id}</td>
                  <td style={{ padding: 8 }}>{u.room?.room_number ?? u.room_id}</td>
                  <td style={{ padding: 8 }}>{u.month}</td>
                  <td style={{ padding: 8 }}>{u.electric_old}</td>
                  <td style={{ padding: 8 }}>{u.electric_new}</td>
                  <td style={{ padding: 8 }}>{u.water_old}</td>
                  <td style={{ padding: 8 }}>{u.water_new}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
