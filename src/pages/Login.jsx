import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/login', { username, password });
      if (res.data && res.data.success) {
        const token = res.data.data?.token ?? null;
        if (token) localStorage.setItem('authToken', token);
        alert(res.data.message || 'Đăng nhập thành công');
        navigate('/');
      } else {
        alert(res.data?.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Lỗi mạng';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 360, margin: '80px auto' }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label>Tên đăng nhập</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 6, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 6, marginTop: 4 }}
          />
        </div>

        <div>
          <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
            {loading ? 'Đang...' : 'Đăng nhập'}
          </button>
        </div>
      </form>
    </div>
  );
}
