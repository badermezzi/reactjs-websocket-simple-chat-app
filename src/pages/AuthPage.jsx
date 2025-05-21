import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import toast from 'react-hot-toast'; // Removed Toaster import
import ParticleBackground from '../Components/ParticleBackground'; // Import the background component
import Logo from '../assets/0a411daf-7cc4-4531-8484-9a26a0ad8eeb-removebg-preview.png'; // Import the logo

function AuthPage() {
	const [isSignUp, setIsSignUp] = useState(false); // false = Login, true = Sign Up
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate(); // Initialize useNavigate

	const toggleMode = () => {
		setIsSignUp(!isSignUp);
	};

	const handleSubmit = async (event) => { // Make async for fetch
		event.preventDefault(); // Prevent default form submission behavior
		// Basic Input Validation
		if (!username.trim()) {
			toast.success('Username is required.');
			return;
		}
		// Username validation: 3-20 chars, alphanumeric + underscore
		const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
		if (!usernameRegex.test(username)) {
			toast.error('Username must be 3-20 characters long and contain only letters, numbers, or underscores.');
			return;
		}

		if (!password) {
			toast.error('Password is required.');
			return;
		}
		if (password.length < 8) {
			toast.error('Password must be at least 8 characters long.');
			return;
		}



		if (isSignUp) {
			// --- Sign Up Logic ---
			try {
				const response = await fetch('https://walleye-ruling-crawdad.ngrok-free.app/users', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ username, password }),
				});

				const data = await response.json();

				if (response.ok) { // Status code 200-299
					toast.success(`User "${data.username}" created successfully!`);
					// Optionally: Clear form, switch to login mode, or redirect
					setUsername('');
					setPassword('');
					setIsSignUp(false); // Switch to login mode after successful signup
				} else {
					// Handle specific errors if backend provides them, otherwise generic error
					toast.error(data.message || `Sign up failed: ${response.statusText}`);
				}
			} catch (error) {
				console.error('Sign up error:', error);
				toast.error('An error occurred during sign up. Please try again.');
			}
		} else {
			// --- Login Logic ---
			try {
				const response = await fetch('https://walleye-ruling-crawdad.ngrok-free.app/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ username, password }),
				});

				const data = await response.json();

				if (response.ok) { // Status code 200-299
					toast.success(data.message || 'Logged in successfully!');
					console.log('Login successful:', data);
					// Store the token (e.g., in localStorage)
					localStorage.setItem('authToken', data.token); // Example: Store token
					localStorage.setItem('userData', JSON.stringify(data.payload)); // Example: Store user data

					// Redirect to chat page
					navigate('/chat');

				} else {
					// Handle specific errors
					if (response.status === 401) {
						toast.error('Invalid username or password.');
					} else {
						toast.error(data.message || `Login failed: ${response.statusText}`);
					}
				}
			} catch (error) {
				console.error('Login error:', error);
				toast.error('An error occurred during login. Please try again.');
			}
		}
	};

	return (
		<div className="flex h-screen">
			{/* Toaster moved to a global component like App.jsx */}
			{/* Left Column */}
			<div className="w-1/2 h-full relative flex items-center justify-center overflow-hidden"> {/* Added relative and overflow-hidden */}
				{/* Background Component */}
				<ParticleBackground />
				{/* Dark Overlay */}
				<div className="absolute inset-0 bg-[#0a0b0e]/50 z-5"></div>
				{/* Logo Image - Positioned on top */}
				<img
					src={Logo}
					alt="Logo"
					className="absolute z-10 w-1/2 max-w-xs" // Positioned absolute, on top (z-10), centered (adjust w-1/2 and max-w-xs as needed)
				/>
			</div>
			{/* Right Column */}
			<div className="w-1/2 h-full bg-gradient-to-r from-[#0a0b0e] to-[#191e22] flex items-center justify-center z-10 ">
				<form className="w-full max-w-xs " onSubmit={handleSubmit}> {/* Link handleSubmit */}
					<h1 className="text-white text-3xl font-bold mb-6 text-left">{isSignUp ? 'Sign Up' : 'Login'}</h1>
					<div className="mb-4">
						{/* <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
					Username
				</label> */}
						<input
							className=" focus:bg-[#2a2e37]/30  border border-gray-600/10 rounded-xl w-full py-3 px-4 bg-gradient-to-r from-[#2a2e37]/10 to-[#2a2e37]/30 text-gray-300 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-500 drop-shadow-sm "
							id="username"
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}

						/>
					</div>
					<div className="mb-6">
						{/* <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
					Password
				</label> */}
						<input
							className=" focus:bg-[#2a2e37]/20 border  border-gray-600/10 rounded-xl w-full py-3 px-4 bg-gradient-to-r from-[#2a2e37]/10 to-[#2a2e37]/30 text-gray-300 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-500 drop-shadow-sm"
							id="password"
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}

						/>
						{/* Optional: Add error message display here */}
					</div>
					<div className="flex flex-col items-center justify-between">
						<button
							className="bg-[#2c57b3]/70 hover:bg-[#274d9e] text-white font-bold py-3 px-4 cursor-pointer rounded-xl focus:outline-none focus:shadow-outline w-full mb-4 drop-shadow-sm border border-gray-400/30"
							type="submit" // Changed to submit
						>
							{isSignUp ? 'Sign Up' : 'Login'}
						</button>
						<button
							className="inline-block align-baseline text-gray-400/90 hover:text-gray-300 cursor-pointer"
							onClick={toggleMode}
							type="button" // Prevent form submission
						>
							{isSignUp ? 'Already have an account? Login' : 'Create New Account'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default AuthPage;
