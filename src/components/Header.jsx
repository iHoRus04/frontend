import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
	const [open, setOpen] = useState(false);
	const [logged, setLogged] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		try { setLogged(!!localStorage.getItem('authToken')); } catch (e) { setLogged(false); }
	}, []);

	return (
		<header className="site-header">
			<div className="header-container">
				<div className="brand">
					<div className="logo">🏠</div>
					<div className="title">Quản Lý Nhà Trọ</div>
				</div>

				<button
					className="menu-toggle"
					aria-expanded={open}
					aria-label="Mở menu"
					onClick={() => setOpen((v) => !v)}
				>
					☰
				</button>

				<nav className={"main-nav " + (open ? 'open' : '')}>
					<NavLink to="/rooms"> Phòng </NavLink>
					<NavLink to="/tenants"> Người Thuê </NavLink>
					<NavLink to="/contracts"> Hợp Đồng </NavLink>
					<NavLink to="/invoices"> Hóa Đơn </NavLink>
					<NavLink to="/utilities"> Tiện Ích </NavLink>
					{logged && (
						<button  onClick={() => { localStorage.removeItem('authToken'); setLogged(false); navigate('/login'); }}>
							Logout
						</button>
					)}
				</nav>
			</div>
		</header>
	);
}

