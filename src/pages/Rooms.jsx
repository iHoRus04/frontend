import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async function fetchRooms() {
      try {
        setLoading(true);
        const res = await axios.get('/rooms');
        if (!mounted) return;
        const data = res.data?.data || [];
        setRooms(data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Lỗi khi tải phòng');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải phòng...</div>;
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2>Danh sách phòng</h2>
      <div style={{ marginTop: 12 }}>
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
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{r.id}</td>
                  <td style={{ padding: 8 }}>{r.room_number}</td>
                  <td style={{ padding: 8 }}>{Number(r.price).toLocaleString('vi-VN')} ₫</td>
                  <td style={{ padding: 8 }}>{r.status}</td>
                  <td style={{ padding: 8 }}>{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
