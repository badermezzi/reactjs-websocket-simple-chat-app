import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<> {/* Use a Fragment to wrap App and Toaster */}
			<App />
			<Toaster
				position="top-center"
				reverseOrder={false}
				toastOptions={{
					// Define default options
					className: ' ',
					duration: 5000,
					style: {
						background: '#2020209b', // Dark background
						color: '#fff', // Light text
						border: '1px solid #7a7a7a1d',
					},

					// Define options for specific types
					success: {
						duration: 3000,
						theme: {
							primary: 'green',
							secondary: 'black',
						},
					},
					error: {
						style: {
							background: '#e53e3e7b', // Red background for errors
							color: '#fff',
						},
					},
				}}
			/>
		</>
	</StrictMode>
);

