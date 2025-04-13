import React from 'react';
import ParticleBackground from '../Components/ParticleBackground'; // Import the background component
import Logo from '../assets/0a411daf-7cc4-4531-8484-9a26a0ad8eeb-removebg-preview.png'; // Import the logo

function AuthPage() {
	return (
		<div className="flex h-screen">
			{/* Left Column */}
			<div className="w-1/2 h-full relative flex items-center justify-center overflow-hidden"> {/* Added relative and overflow-hidden */}
				{/* Background Component */}
				<ParticleBackground />
				{/* Dark Overlay */}
				<div className="absolute inset-0 bg-[#0b0c0f]/50 z-5"></div>
				{/* Logo Image - Positioned on top */}
				<img
					src={Logo}
					alt="Logo"
					className="absolute z-10 w-1/2 max-w-xs" // Positioned absolute, on top (z-10), centered (adjust w-1/2 and max-w-xs as needed)
				/>
			</div>
			{/* Right Column */}
			<div className="w-1/2 h-full bg-gradient-to-r from-[#0a0b0e] to-[#191e22] flex items-center justify-center z-10 ">
				<form className="w-full max-w-xs "> {/* Moved width classes here */}
					<h1 className="text-white text-3xl font-bold mb-6 text-left">Sign In</h1>
					<div className="mb-4">
						{/* <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
					Email
				</label> */}
						<input
							className="  border border-gray-500/10 rounded-xl w-full py-3 px-4 bg-[#2a2e37]/20 text-gray-300 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-500"
							id="email"
							type="email"
							placeholder="Email"
						/>
					</div>
					<div className="mb-6">
						{/* <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
					Password
				</label> */}
						<input
							className="  border border-gray-500/10 rounded-xl w-full py-3 px-4 bg-[#2a2e37]/20 text-gray-300 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-500"
							id="password"
							type="password"
							placeholder="Password"
						/>
						{/* Optional: Add error message display here */}
					</div>
					<div className="flex flex-col items-center justify-between">
						<button
							className="bg-[#2c57b3] hover:bg-[#274d9e] text-white font-bold py-3 px-4 cursor-pointer rounded-xl focus:outline-none focus:shadow-outline w-full mb-4"
							type="button" // Change to type="submit" when adding logic
						>
							Sign In
						</button>
						<a
							className="inline-block align-baseline   text-gray-400/90 hover:text-gray-400"
							href="#"
						>
							Forgot password?
						</a>
					</div>
				</form>
			</div>
		</div>
	);
}

export default AuthPage;
