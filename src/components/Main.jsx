import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Main() {
	return (
		<main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
			<Outlet />
		</main>
	);
}
