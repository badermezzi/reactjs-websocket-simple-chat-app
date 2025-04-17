import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // For error notifications

function Sidebar({ selectedFriend, setSelectedFriend, setMessages, setMessagesPaginationPage }) {
	const [onlineUsers, setOnlineUsers] = useState([]); // State for online users
	const [offlineUsers, setOfflineUsers] = useState([]); // State for offline users
	const [displayedUsers, setDisplayedUsers] = useState([]); // Combined list for UI

	useEffect(() => {
		const fetchUsers = async () => {
			// Fetch Online Users
			try {
				const onlineResponse = await fetch('http://localhost:8080/users/online');
				if (onlineResponse.ok) {
					const onlineData = await onlineResponse.json();
					setOnlineUsers(onlineData.online_users || []);
					console.log('Fetched online users:', onlineData.online_users);
				} else {
					console.error('Failed to fetch online users:', onlineResponse.statusText);
					toast.error('Could not load online users list.');
				}
			} catch (error) {
				console.error('Error fetching online users:', error);
				toast.error('Network error fetching online users.');
			}

			// Fetch Offline Users
			try {
				const offlineResponse = await fetch('http://localhost:8080/users/offline');
				if (offlineResponse.ok) {
					const offlineData = await offlineResponse.json();
					setOfflineUsers(offlineData.offline_users || []);
					console.log('Fetched offline users:', offlineData.offline_users);
				} else {
					console.error('Failed to fetch offline users:', offlineResponse.statusText);
					toast.error('Could not load offline users list.');
				}
			} catch (error) {
				console.error('Error fetching offline users:', error);
				toast.error('Network error fetching offline users.');
			}
		};

		fetchUsers(); // Call the combined fetch function
	}, []); // Empty dependency array means this runs once on mount

	// Effect to combine and filter users when onlineUsers or offlineUsers change
	useEffect(() => {
		let currentUserId = null;
		try {
			const userDataString = localStorage.getItem('userData');
			if (userDataString) {
				const userData = JSON.parse(userDataString);
				currentUserId = userData?.user_id; // Get logged-in user's ID
			}
		} catch (e) {
			console.error("Failed to parse user data from localStorage", e);
		}

		const onlineWithStatus = onlineUsers.map(u => ({ ...u, isOnline: true }));
		const offlineWithStatus = offlineUsers.map(u => ({ ...u, isOnline: false }));

		// Combine users
		const combinedUsers = [...onlineWithStatus, ...offlineWithStatus];

		// Filter out the current user if their ID was found
		const filteredUsers = currentUserId
			? combinedUsers.filter(user => user.id !== currentUserId)
			: combinedUsers;

		setDisplayedUsers(filteredUsers);

	}, [onlineUsers, offlineUsers]); // Re-run when fetched data changes

	// const friends = [1, 2, 3, 4, 5]; // Removed placeholder

	function handleOnSelectFriend(user) {
		setMessages([]);
		setMessagesPaginationPage(1);
		setSelectedFriend(user);
	}

	return (
		<div className='w-75 bg-[#0D1216]/70 border border-gray-500/10 drop-shadow-black text-white p-5 flex flex-col flex-shrink-0 rounded-2xl m-4 mr-2 mt-2'> {/* Added flex flex-col */}
			{/* Title */}
			<h2 className="text-2xl font-semibold mb-4 ">Friends List</h2>

			{/* Search Input */}
			<div className="relative mb-4">
				<input
					type="text"
					placeholder="Search"
					className="w-full bg-gray-700/30 hover:bg-gray-800 focus:bg-gray-800 border border-gray-600/50 rounded-md py-2 px-3 pl-8 text-sm focus:outline-none placeholder-gray-400 shadow"
				/>
				{/* Placeholder for search icon */}
				<svg className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>

			{/* Friends List (Placeholder) */}
			<ul className="flex-grow overflow-y-auto"> {/* Allow list to scroll */}
				{displayedUsers.length > 0 ? (
					displayedUsers.map((user) => (
						<li onClick={() => handleOnSelectFriend(user)} key={user.id} className="mb-2 my-0">
							{/* Friend Item Structure */}
							<div className={`flex items-center p-2 rounded-xl cursor-pointer ${user.id === selectedFriend.id ? 'bg-gray-700/80 shadow border border-gray-500/10' : 'hover:bg-gray-700/50'}`}>
								{/* Left Block: Avatar */}
								<img
									src={`https://i.pravatar.cc/150?u=${user.id}`} // Use id for consistent avatar
									alt={`${user.username} Avatar`}
									className="h-10 w-10 rounded-full flex-shrink-0"
								/>

								{/* Middle Block: Name & Message */}
								<div className="flex-grow px-3 overflow-hidden"> {/* Allow grow, add padding, hide overflow */}
									<div className="font-semibold text-sm">{user.username}</div>
									{/* Placeholder for last message - needs real data */}
									<div className="text-xs text-gray-400 truncate">
										{user.isOnline ? 'Online' : 'Offline'} {/* Display status text */}
									</div>
								</div>

								{/* Right Block: Status Indicator */}
								<div className="flex-shrink-0 w-3"> {/* Added width to prevent layout shift */}
									{/* Show green dot only if user is online */}
									{user.isOnline && <span className="block h-2.5 w-2.5 rounded-full bg-green-500"></span>}
								</div>
							</div>
						</li>
					))
				) : (
					<li className="text-gray-400 text-sm text-center py-4">No users available.</li>
				)}
			</ul>
		</div >
	);
}

export default Sidebar;