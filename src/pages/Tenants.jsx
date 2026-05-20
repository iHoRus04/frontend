import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async function fetchTenants() {
      try {
        setLoading(true);
        const res = await axios.get('/tenants');
        if (!mounted) return;
        const data = res.data?.data || [];
        setTenants(data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Lỗi khi tải người thuê');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>⏳ Đang tải người thuê...</div>;
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>❌ {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2>Danh sách người thuê</h2>
      <div style={{ marginTop: 12 }}>
        {tenants.length === 0 ? (
          <div>Không có người thuê</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Họ Tên</th>
                <th style={{ padding: 8 }}>SĐT</th>
                <th style={{ padding: 8 }}>CMND</th>
                <th style={{ padding: 8 }}>Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: 8 }}>{t.id}</td>
                  <td style={{ padding: 8 }}>{t.full_name}</td>
                  <td style={{ padding: 8 }}>{t.phone}</td>
                  <td style={{ padding: 8 }}>{t.identity_card}</td>
                  <td style={{ padding: 8 }}>{t.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
