import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Logo from '../assets/0a411daf-7cc4-4531-8484-9a26a0ad8eeb-removebg-preview.png'; // Assuming the path is correct relative to this new file

function ChatHeader({ currentUser }) {

	const navigate = useNavigate(); // Initialize navigate

	function handleSignOut() {
		localStorage.removeItem('authToken');
		localStorage.removeItem('userData');
		navigate('/'); // Redirect to home page

	}

	return (
		<div className='h-18 text-white flex items-center justify-between px-5'>
			{/* Logo */}
			<img src={Logo} alt="Logo" className="h-30" /> {/* Adjust height as needed */}

			{/* Right side content (Button + Avatar) */}
			<div className="flex items-center"> {/* Wrapper for right side items */}
				{/* Button and Indicator Container */}
				<div className="relative mr-4"> {/* Added relative positioning and margin */}
					<button onClick={() => handleSignOut()} className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-md cursor-pointer">
						Sign Out
					</button>

				</div>

				{/* Avatar container */}
				<div className="relative"> {/* Keep relative for potential future use */}
					<img
						src={`https://i.pravatar.cc/150?img=${currentUser.user_id}`} // Using placehold.co
						alt="User Avatar"
						className="h-13 w-13 rounded-full drop-shadow-black border border-gray-400/50 cursor-pointer opacity-85 hover:opacity-100" // Adjust size (h-10 w-10) as needed
					/>
					{/* Online Indicator - Positioned relative to the container */}
					<span className="absolute bottom-[-3px] right-1 flex h-3 w-3 -translate-y-1/2 translate-x-1/2"> {/* Position top-right with offset */}
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
						<span className=" relative inline-flex h-3 w-3 rounded-full bg-green-600"></span>
					</span>
				</div>
				{/* Other header content can go here */}
			</div>
		</div >
	);
}

export default ChatHeader;