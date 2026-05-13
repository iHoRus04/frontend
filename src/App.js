import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

const initialUserForm = { name: "", phone: "" };
const initialAddrForm = { detail_address: "", city: "", district: "" };

export default function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [addrForm, setAddrForm] = useState(initialAddrForm);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("users"); // "users" | "addresses"
  const [msg, setMsg] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const notify = (text, type = "ok") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  };

  // ── USERS ──────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await axios.get(`${API}/users`);
    setUsers(data);
    setLoading(false);
  };

  const createUser = async () => {
    if (!userForm.name.trim()) return notify("Vui lòng nhập tên!", "err");
    await axios.post(`${API}/users`, userForm);
    setUserForm(initialUserForm);
    fetchUsers();
    notify("Thêm user thành công!");
  };

  const updateUser = async () => {
    if (!userForm.name.trim()) return notify("Vui lòng nhập tên!", "err");
    await axios.put(`${API}/users/${editingUser.id}`, userForm);
    setEditingUser(null);
    setUserForm(initialUserForm);
    fetchUsers();
    notify("Cập nhật thành công!");
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Xóa user này?")) return;
    await axios.delete(`${API}/users/${id}`);
    if (selectedUser?.id === id) setSelectedUser(null);
    fetchUsers();
    notify("Đã xóa user!");
  };

  const startEdit = (u) => {
    setEditingUser(u);
    setUserForm({ name: u.name, phone: u.phone || "" });
  };

  // ── ADDRESSES ──────────────────────────────────────
  const addAddress = async () => {
    if (!selectedUser) return notify("Chọn user trước!", "err");
    if (!addrForm.detail_address || !addrForm.city || !addrForm.district)
      return notify("Điền đầy đủ thông tin địa chỉ!", "err");
    await axios.post(`${API}/users/${selectedUser.id}/addresses`, addrForm);
    setAddrForm(initialAddrForm);
    // Refresh user list (includes addresses)
    const { data } = await axios.get(`${API}/users/${selectedUser.id}`);
    setSelectedUser(data);
    fetchUsers();
    notify("Thêm địa chỉ thành công!");
  };

  const deleteAddress = async (addrId) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    await axios.delete(`${API}/addresses/${addrId}`);
    const { data } = await axios.get(`${API}/users/${selectedUser.id}`);
    setSelectedUser(data);
    fetchUsers();
    notify("Đã xóa địa chỉ!");
  };

  const selectUser = (u) => {
    setSelectedUser(u);
    setTab("addresses");
  };

  // ── RENDER ─────────────────────────────────────────
  return (
    <div style={s.app}>
      {/* HEADER */}
      <header style={s.header}>
        <h1 style={s.logo}>👤 User Manager</h1>
        <span style={s.subtitle}>Lab — FE React + BE Laravel + DB MySQL</span>
      </header>

      {/* TOAST */}
      {msg && (
        <div style={{ ...s.toast, background: msg.type === "err" ? "#e74c3c" : "#27ae60" }}>
          {msg.text}
        </div>
      )}

      <div style={s.layout}>
        {/* ── LEFT: USER LIST ── */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>📋 Danh sách Users</h2>

          {/* Form thêm / sửa user */}
          <div style={s.form}>
            <input
              style={s.input}
              placeholder="Họ tên *"
              value={userForm.name}
              onChange={e => setUserForm({ ...userForm, name: e.target.value })}
            />
            <input
              style={s.input}
              placeholder="Số điện thoại"
              value={userForm.phone}
              onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
            />
            <div style={s.row}>
              <button style={s.btnPrimary} onClick={editingUser ? updateUser : createUser}>
                {editingUser ? "💾 Cập nhật" : "➕ Thêm User"}
              </button>
              {editingUser && (
                <button style={s.btnGray} onClick={() => { setEditingUser(null); setUserForm(initialUserForm); }}>
                  Hủy
                </button>
              )}
            </div>
          </div>

          {/* Table users */}
          {loading ? <p style={s.center}>Đang tải...</p> : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Tên</th>
                  <th style={s.th}>SĐT</th>
                  <th style={s.th}>Địa chỉ</th>
                  <th style={s.th}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    style={{
                      ...s.tr,
                      background: selectedUser?.id === u.id ? "#eaf4ff" : "white",
                    }}
                  >
                    <td style={s.td}>{u.id}</td>
                    <td style={s.td}>{u.name}</td>
                    <td style={s.td}>{u.phone || "—"}</td>
                    <td style={s.td}>
                      <span style={s.badge}>{u.addresses?.length ?? 0}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.btnSmBlue} onClick={() => selectUser(u)}>Địa chỉ</button>
                      <button style={s.btnSmYellow} onClick={() => startEdit(u)}>Sửa</button>
                      <button style={s.btnSmRed} onClick={() => deleteUser(u.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ ...s.td, ...s.center }}>Chưa có user nào</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── RIGHT: ADDRESS ── */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>
            📍 Địa chỉ {selectedUser ? `— ${selectedUser.name}` : ""}
          </h2>

          {!selectedUser ? (
            <p style={{ color: "#888", marginTop: 16 }}>← Chọn một user để xem / quản lý địa chỉ</p>
          ) : (
            <>
              {/* Form thêm địa chỉ */}
              <div style={s.form}>
                <input
                  style={s.input}
                  placeholder="Số nhà, tên đường *"
                  value={addrForm.detail_address}
                  onChange={e => setAddrForm({ ...addrForm, detail_address: e.target.value })}
                />
                <input
                  style={s.input}
                  placeholder="Tỉnh / Thành phố *"
                  value={addrForm.city}
                  onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                />
                <input
                  style={s.input}
                  placeholder="Quận / Huyện *"
                  value={addrForm.district}
                  onChange={e => setAddrForm({ ...addrForm, district: e.target.value })}
                />
                <button style={s.btnPrimary} onClick={addAddress}>➕ Thêm địa chỉ</button>
              </div>

              {/* List địa chỉ */}
              {selectedUser.addresses?.length === 0 ? (
                <p style={{ color: "#aaa", marginTop: 12 }}>Chưa có địa chỉ nào</p>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>ID</th>
                      <th style={s.th}>Chi tiết</th>
                      <th style={s.th}>Thành phố</th>
                      <th style={s.th}>Quận</th>
                      <th style={s.th}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.addresses.map(a => (
                      <tr key={a.id_address} style={s.tr}>
                        <td style={s.td}>{a.id_address}</td>
                        <td style={s.td}>{a.detail_address}</td>
                        <td style={s.td}>{a.city}</td>
                        <td style={s.td}>{a.district}</td>
                        <td style={s.td}>
                          <button style={s.btnSmRed} onClick={() => deleteAddress(a.id_address)}>Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
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
  layout: { display: "flex", gap: 20, padding: 24, flexWrap: "wrap" },
  card: { background: "white", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 24, flex: 1, minWidth: 320 },
  cardTitle: { margin: "0 0 16px", fontSize: 17, fontWeight: 600, color: "#1a73e8" },
  form: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, padding: 16, background: "#f8fbff", borderRadius: 8, border: "1px solid #dde8ff" },
  input: { padding: "8px 12px", borderRadius: 6, border: "1px solid #ccd", fontSize: 14, outline: "none" },
  row: { display: "flex", gap: 8 },
  btnPrimary: { padding: "9px 18px", background: "#1a73e8", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  btnGray: { padding: "9px 18px", background: "#999", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { background: "#f0f4f8", padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#555", borderBottom: "2px solid #e0e0e0" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
  tr: { transition: "background 0.15s" },
  badge: { background: "#1a73e8", color: "white", borderRadius: 12, padding: "2px 8px", fontSize: 12 },
  center: { textAlign: "center", color: "#888" },
  btnSmBlue: { marginRight: 4, padding: "4px 8px", background: "#1a73e8", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  btnSmYellow: { marginRight: 4, padding: "4px 8px", background: "#f39c12", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  btnSmRed: { padding: "4px 8px", background: "#e74c3c", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  toast: { position: "fixed", top: 20, right: 20, color: "white", padding: "12px 20px", borderRadius: 8, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
};