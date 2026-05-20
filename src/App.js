import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';

function Rooms() { return <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}><h2>Phòng</h2><p>Quản lý phòng ở đây.</p></div>; }
function Tenants() { return <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}><h2>Người Thuê</h2></div>; }
function Payments() { return <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}><h2>Thanh Toán</h2></div>; }
function Reports() { return <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}><h2>Báo Cáo</h2></div>; }
function Settings() { return <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}><h2>Cài Đặt</h2></div>; }

export default function App() {
  return (
    <div style={s.app}>
      <BrowserRouter>
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>
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