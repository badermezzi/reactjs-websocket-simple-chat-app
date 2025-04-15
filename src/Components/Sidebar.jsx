import React from 'react';

function Sidebar({ selectedFriend, setSelectedFriend }) {



	// Placeholder data - this should ideally come from props or state management
	const friends = [1, 2, 3, 4, 5];


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
				{friends.map((item) => (
					<li onClick={() => (setSelectedFriend(item))} key={item} className="mb-2 my-0 "  >
						{/* Friend Item Structure */}
						<div className={`flex items-center p-2 rounded-xl cursor-pointer ${item === selectedFriend ? 'bg-gray-700/80 shadow border border-gray-500/10' : 'hover:bg-gray-700/50'}`}>
							{/* Left Block: Avatar */}
							<img
								src={`https://i.pravatar.cc/150?img=${item + 10}`} // Placeholder avatar
								alt="Friend Avatar"
								className="h-10 w-10 rounded-full flex-shrink-0"
							/>

							{/* Middle Block: Name & Message */}
							<div className="flex-grow px-3 overflow-hidden"> {/* Allow grow, add padding, hide overflow */}
								<div className="font-semibold text-sm">Friend Name {item}</div>
								{/* "item === item" condition if message not seen. for later, logic with the backend */}
								{item === item ? <div className="text-xs text-gray-400 truncate">
									This is the last message placeholder...
								</div> : <div></div>}
								{/* Truncate long messages */}
							</div>

							{/* Right Block: Status Indicator */}
							<div className="flex-shrink-0">
								{/* Simple online dot - replace with logic later */}
								{item === 1 && <span className="block h-2.5 w-2.5 rounded-full bg-green-500"></span>}
							</div>
						</div>
					</li >
				))
				}
			</ul >
		</div >
	);
}

export default Sidebar;