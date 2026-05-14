import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API || ""; // Production: set REACT_APP_API on Vercel; Dev: empty uses CRA proxy

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  // ── USERS ──────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = API ? `${API}/users` : "/users";
      const res = await axios.get(url);
      console.log("Response URL:", url, "status:", res.status, "headers:", res.headers);
      const data = res.data;
      console.log("Dữ liệu từ API:", data);

      // Nếu server trả về HTML (ví dụ index.html) thì báo lỗi dễ hiểu
      if (typeof data === 'string' && data.trim().startsWith('<')) {
        console.error('Received HTML from API; likely wrong API URL or proxy.');
        throw new Error('Unexpected HTML response from API (check REACT_APP_API or backend).');
      }

      // Handle cả trường hợp data là array hoặc object
      const usersList = Array.isArray(data) ? data : (data?.data || []);
      console.log("Users list sau xử lý:", usersList);
      
      setUsers(usersList);
    } catch (err) {
      setError(err.message);
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ─────────────────────────────────────────
  return (
    <div style={s.app}>
      {/* HEADER */}
      <header style={s.header}>
        <h1 style={s.logo}>👤 User Manager (Read Only)</h1>
        <span style={s.subtitle}>Testing API Connection</span>
      </header>

      <div style={s.container}>
        {/* ERROR MESSAGE */}
        {error && (
          <div style={{ ...s.errorBox }}>
            ❌ Lỗi: {error}
          </div>
        )}

        {/* USER LIST */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>📋 Danh sách Users</h2>

          {loading ? (
            <p style={s.center}>⏳ Đang tải dữ liệu...</p>
          ) : users.length === 0 ? (
            <p style={s.center}>📭 Chưa có dữ liệu</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Tên</th>
                  <th style={s.th}>SĐT</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={s.tr}>
                    <td style={s.td}>{u.id}</td>
                    <td style={s.td}>{u.name}</td>
                    <td style={s.td}>{u.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  app: { fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#f0f4f8", padding: 0, margin: 0 },
  header: { background: "#1a73e8", color: "white", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 },
  logo: { margin: 0, fontSize: 22, fontWeight: 700 },
  subtitle: { fontSize: 13, opacity: 0.8 },
  container: { padding: 24, maxWidth: 800, margin: "0 auto" },
  card: { background: "white", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 24 },
  cardTitle: { margin: "0 0 16px", fontSize: 17, fontWeight: 600, color: "#1a73e8" },
  errorBox: { background: "#ffe0e0", border: "1px solid #ff6b6b", borderRadius: 8, padding: 16, marginBottom: 16, color: "#c92a2a" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { background: "#f0f4f8", padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#555", borderBottom: "2px solid #e0e0e0" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
  tr: { transition: "background 0.15s" },
  center: { textAlign: "center", color: "#888", padding: "20px 0" },
};