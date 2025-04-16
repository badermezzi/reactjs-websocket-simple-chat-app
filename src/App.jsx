import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';

// Helper component for protected routes
const ProtectedRoute = ({ children }) => {
	const token = localStorage.getItem('authToken');
	return token ? children : <Navigate to="/" replace />;
};

// Helper component for public routes (redirect if logged in)
const PublicRoute = ({ children }) => {
	const token = localStorage.getItem('authToken');
	return token ? <Navigate to="/chat" replace /> : children;
};

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<PublicRoute>
							<AuthPage />
						</PublicRoute>
					}
				/>
				<Route
					path="/chat"
					element={
						<ProtectedRoute>
							<ChatPage />
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
