// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import doubt from '../assets/images/newDoubt.png';
// import { Menu, Settings, LogOut, Plus, Trash2, MessageSquare } from 'lucide-react';

// const Sidebar = ({
//   isCollapsed,
//   setIsCollapsed,
//   className,
//   chatSessions = [],
//   currentChatId,
//   onLoadChat,
//   onDeleteChat,
//   onCreateNewChat,
// }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isSidebarVisible, setIsSidebarVisible] = useState(false); // New state for mobile visibility

//   const toggleSidebar = () => {
//     setIsSidebarVisible(!isSidebarVisible);
//     if (!isSidebarVisible) setIsCollapsed(false); // Expand sidebar when showing
//   };

//   const toggleCollapse = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('chatSessions');
//     navigate('/login');
//   };

//   const handleNavigation = (path) => {
//     navigate(path);
//     setIsSidebarVisible(false); // Hide sidebar on navigation in mobile view
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInHours = (now - date) / (1000 * 60 * 60);

//     if (diffInHours < 24) {
//       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     } else if (diffInHours < 48) {
//       return 'Yesterday';
//     } else {
//       return date.toLocaleDateString();
//     }
//   };

//   const truncateTitle = (title, maxLength = 30) => {
//     if (title.length <= maxLength) return title;
//     return title.substring(0, maxLength) + '...';
//   };

//   return (
//     <>
//       {/* Toggle Button for Mobile */}
//       <button
//         onClick={toggleSidebar}
//         className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-400 transition-colors"
//       >
//         <Menu className="w-6 h-6" />
//       </button>

//       {/* Sidebar */}
//       <div
//         className={`bg-orange-500 text-white flex flex-col fixed h-screen transition-all duration-300 z-40 ${
//           isCollapsed ? 'w-20' : 'w-64'
//         } ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${className}`}
//       >
//         {/* Logo and Toggle */}
//         <div className="p-6">
//           <div className="flex items-center justify-between relative group">
//             <button
//               onClick={toggleCollapse}
//               className={`p-2 rounded-lg hover:bg-orange-400 transition-colors ${
//                 isCollapsed ? 'opacity-0 group-hover:opacity-100 absolute right-0' : ''
//               }`}
//               title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
//             >
//               <Menu className="w-6 h-6" />
//             </button>
//             <span className="font-bold text-lg">S</span>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div className="flex-1 py-6">
//           <nav className="space-y-2 px-4">
//             <button
//               onClick={() => handleNavigation('/dashboard')}
//               className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
//                 isCollapsed ? 'py-2 px-3' : 'px-3 py-2'
//               } ${isActive('/dashboard') ? 'bg-orange-400' : ''}`}
//             >
//               <img src={doubt} alt="New Doubt" className="w-6 h-6" />
//               {!isCollapsed && <span className="text-lg pl-2">New Doubt</span>}
//             </button>
//           </nav>

//           {/* Previously Asked Section */}
//           {!isCollapsed && (
//             <div className="mt-8 px-3">
//               {/* <h3 className="text-lg font-semibold text-gray-700 mb-4">Previously Asked</h3> */}
//               <h3 className="text-lg font-semibold text-gray-700 mb-4">Previously Asked</h3>
//               <div className="space-y-2">
//                 {chatSessions.map((chat) => (
//                   <div
//                     key={chat._id}
//                     className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
//                       currentChatId === chat._id ? 'bg-orange-100 border border-orange-300' : 'hover:bg-gray-100'
//                     }`}
//                     onClick={() => {
//                       onLoadChat(chat._id);
//                       setIsSidebarVisible(false); // Hide sidebar on chat selection in mobile
//                     }}
//                   >
//                     <div className="flex-1 min-w-0">
//                       <h4 className="text-sm font-medium text-gray-800 truncate">
//                         {chat.title || 'New Chat'}
//                       </h4>
//                       <p className="text-xs text-gray-500">
//                         {formatDate(chat.createdAt)}
//                       </p>
//                     </div>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onDeleteChat(chat._id);
//                       }}
//                       className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   onClick={() => handleNavigation('/dashboard')}
//                   // className="w-full flex items-center justify-center p-3 text-orange-600 hover:bg-orange-50 rounded-lg border border-orange-200 transition-colors"
//                   className="w-full font-medium flex items-center justify-center p-3 text-white  rounded-lg border border-orange-200 transition-colors"
//                 >
//                   <Plus size={16} className="mr-2" />
//                   New Chat
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Collapsed Previously Asked */}
//           {isCollapsed && (
//             <div className="mt-8 px-4">
//               <div className="space-y-2">
//                 {chatSessions.slice(0, 5).map((session) => (
//                   <button
//                     key={session._id}
//                     onClick={() => {
//                       onLoadChat(session._id);
//                       setIsSidebarVisible(false); // Hide sidebar on chat selection in mobile
//                     }}
//                     className={`w-full p-2 rounded-lg transition-colors ${
//                       currentChatId === session._id ? 'bg-orange-400' : 'hover:bg-orange-400/50'
//                     }`}
//                     title={session.title}
//                   >
//                     <MessageSquare className="w-4 h-4 mx-auto" />
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => handleNavigation('/dashboard')}
//                   className="w-full p-2 rounded-lg hover:bg-orange-400 transition-colors"
//                   title="New Chat"
//                 >
//                   <Plus className="w-4 h-4 mx-auto" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Bottom Navigation */}
//         <div className="border-t border-orange-400 p-4 space-y-2">
//           <button
//             onClick={() => handleNavigation('/profile')}
//             className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
//               isCollapsed ? 'py-2 px-3' : 'px-3 py-2'
//             } ${isActive('/profile') ? 'bg-orange-400' : ''}`}
//           >
//             <Settings className="w-6 h-6" />
//             {!isCollapsed && <span className="text-lg pl-2">Profile</span>}
//           </button>
//           <button
//             onClick={handleLogout}
//             className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
//               isCollapsed ? 'py-2' : 'px-3 py-2'
//             }`}
//           >
//             <LogOut className="w-6 h-6 mr-3" />
//             {!isCollapsed && <span className="text-sm">Logout</span>}
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;








// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import doubt from '../assets/images/newDoubt.png';
// import { Menu, Settings, LogOut, Plus, Trash2, MessageSquare } from 'lucide-react';
// import { useChat } from '../context/chatContext';
// // import { useChat } from '../context/chatContext';

// const Sidebar = ({
//   isCollapsed,
//   setIsCollapsed,
//   className,
//   // chatSessions = [],
//   // currentChatId,
//   // onLoadChat,
//   // onDeleteChat,
//   // onCreateNewChat,
// }) => {
//   const { chatSessions, currentChatId, loadChat, deleteChat, createNewChat } = useChat();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isSidebarVisible, setIsSidebarVisible] = useState(false); // New state for mobile visibility

//   const toggleSidebar = () => {
//     setIsSidebarVisible(!isSidebarVisible);
//     if (!isSidebarVisible) setIsCollapsed(false); // Expand sidebar when showing
//   };

//   const toggleCollapse = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('chatSessions');
//     navigate('/login');
//   };

//   const handleNavigation = (path) => {
//     navigate(path);
//     setIsSidebarVisible(false); // Hide sidebar on navigation in mobile view
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInHours = (now - date) / (1000 * 60 * 60);

//     if (diffInHours < 24) {
//       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     } else if (diffInHours < 48) {
//       return 'Yesterday';
//     } else {
//       return date.toLocaleDateString();
//     }
//   };

//   const truncateTitle = (title, maxLength = 30) => {
//     if (title.length <= maxLength) return title;
//     return title.substring(0, maxLength) + '...';
//   };

//   return (
//     <>
//       {/* Toggle Button for Mobile */}
//       <button
//         onClick={toggleSidebar}
//         className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-400 transition-colors"
//       >
//         <Menu className="w-6 h-6" />
//       </button>

//       {/* Sidebar */}
//       <div
//         className={`bg-orange-500 text-white flex flex-col fixed h-screen transition-all duration-300 z-40 ${
//           isCollapsed ? 'w-20' : 'w-64'
//         } ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${className}`}
//       >
//         {/* Logo and Toggle */}
//         <div className="p-6">
//           <div className="flex items-center justify-between relative group">
//             <button
//               onClick={toggleCollapse}
//               className={`p-2 rounded-lg hover:bg-orange-400 transition-colors ${
//                 isCollapsed ? 'opacity-0 group-hover:opacity-100 absolute right-0' : ''
//               }`}
//               title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
//             >
//               <Menu className="w-6 h-6" />
//             </button>
//             <span className="font-bold text-lg">S</span>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div className="flex-1 py-6">
//           <nav className="space-y-2 px-4">
//             <button
//               onClick={() => handleNavigation('/dashboard')}
//               className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
//                 isCollapsed ? 'py-2 px-3' : 'px-3 py-2'
//               } ${isActive('/dashboard') ? 'bg-orange-400' : ''}`}
//             >
//               <img src={doubt} alt="New Doubt" className="w-6 h-6" />
//               {!isCollapsed && <span className="text-lg pl-2">New Doubt</span>}
//             </button>
//           </nav>

//           {/* Previously Asked Section */}
//           {!isCollapsed && (
//             <div className="mt-8 px-3">
//               {/* <h3 className="text-lg font-semibold text-gray-700 mb-4">Previously Asked</h3> */}
//               <h3 className="text-lg font-semibold text-gray-700 mb-4">Previously Asked</h3>
//               <div className="space-y-2">
//                 {chatSessions.map((chat) => (
//                   <div
//                     key={chat._id}
//                     className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
//                       currentChatId === chat._id ? 'bg-orange-100 border border-orange-300' : 'hover:bg-gray-100'
//                     }`}
//                     onClick={() => {
//                       onLoadChat(chat._id);
//                       setIsSidebarVisible(false); // Hide sidebar on chat selection in mobile
//                     }}
//                   >
//                     <div className="flex-1 min-w-0">
//                       <h4 className="text-sm font-medium text-gray-800 truncate">
//                         {chat.title || 'New Chat'}
//                       </h4>
//                       <p className="text-xs text-gray-500">
//                         {formatDate(chat.createdAt)}
//                       </p>
//                     </div>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onDeleteChat(chat._id);
//                       }}
//                       className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   onClick={() => handleNavigation('/dashboard')}
//                   // className="w-full flex items-center justify-center p-3 text-orange-600 hover:bg-orange-50 rounded-lg border border-orange-200 transition-colors"
//                   className="w-full font-medium flex items-center justify-center p-3 text-white  rounded-lg border border-orange-200 transition-colors"
//                 >
//                   <Plus size={16} className="mr-2" />
//                   New Chat
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Collapsed Previously Asked */}
//           {isCollapsed && (
//             <div className="mt-8 px-4">
//               <div className="space-y-2">
//                 {chatSessions.slice(0, 5).map((session) => (
//                   <button
//                     key={session._id}
//                     onClick={() => {
//                       onLoadChat(session._id);
//                       setIsSidebarVisible(false); // Hide sidebar on chat selection in mobile
//                     }}
//                     className={`w-full p-2 rounded-lg transition-colors ${
//                       currentChatId === session._id ? 'bg-orange-400' : 'hover:bg-orange-400/50'
//                     }`}
//                     title={session.title}
//                   >
//                     <MessageSquare className="w-4 h-4 mx-auto" />
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => handleNavigation('/dashboard')}
//                   className="w-full p-2 rounded-lg hover:bg-orange-400 transition-colors"
//                   title="New Chat"
//                 >
//                   <Plus className="w-4 h-4 mx-auto" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Bottom Navigation */}
//         <div className="border-t border-orange-400 p-4 space-y-2">
//           <button
//             onClick={() => handleNavigation('/profile')}
//             className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
//               isCollapsed ? 'py-2 px-3' : 'px-3 py-2'
//             } ${isActive('/profile') ? 'bg-orange-400' : ''}`}
//           >
//             <Settings className="w-6 h-6" />
//             {!isCollapsed && <span className="text-lg pl-2">Profile</span>}
//           </button>
//           <button
//             onClick={handleLogout}
//             className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
//               isCollapsed ? 'py-2' : 'px-3 py-2'
//             }`}
//           >
//             <LogOut className="w-6 h-6 mr-3" />
//             {!isCollapsed && <span className="text-sm">Logout</span>}
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;









import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import doubt from '../assets/images/newDoubt.png';
import { Menu, Settings, LogOut, Plus, Trash2, MessageSquare, Crown } from 'lucide-react';
import { useChat } from '../context/chatContext';

const Sidebar = ({ isCollapsed, setIsCollapsed, className }) => {
  const { chatSessions, currentChatId, loadChat, deleteChat, createNewChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
    if (!isSidebarVisible) setIsCollapsed(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('chatSessions');
    localStorage.removeItem('currentChatId');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarVisible(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-400 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div
        className={`bg-orange-500 text-white flex flex-col fixed h-screen transition-all duration-300 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${className}`}
      >
        {/* Header - Fixed */}
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between relative group">
            <button
              onClick={toggleCollapse}
              className={`p-2 rounded-lg hover:bg-orange-400 transition-colors ${
                isCollapsed ? 'opacity-0 group-hover:opacity-100 absolute right-0' : ''
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">S</span>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 py-6 overflow-hidden flex flex-col">
          <nav className="space-y-2 px-4">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
                isCollapsed ? 'py-2 px-3' : 'px-3 py-2'
              } ${isActive('/dashboard') ? 'bg-orange-400' : ''}`}
            >
              <img src={doubt} alt="New Doubt" className="w-6 h-6" />
              {!isCollapsed && <span className="text-lg pl-2">New Doubt</span>}
            </button>
          </nav>

          {!isCollapsed && (
            <div className="mt-8 px-3 flex-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Previously Asked</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                {chatSessions.length === 0 ? (
                  <p className="text-sm text-gray-200">No chats available</p>
                ) : (
                  chatSessions.map((chat) => (
                    <div
                      key={chat._id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        // currentChatId === chat._id ? 'bg-orange-100' : 'hover:bg-orange-400'
                          currentChatId === chat._id ? 'bg-orange-100 border border-orange-300' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        loadChat(chat._id);
                        setIsSidebarVisible(false);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        {/* <h4 className="text-sm font-medium truncate"> */}
                           <h4 className="text-sm font-medium text-gray-800 truncate">
                          {truncateTitle(chat.title || 'New Chat')}
                        </h4>
                        {/* <p className="text-xs text-gray-200"> */}
                         <p className="text-xs text-gray-500">
                          
                          {formatDate(chat.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat._id);
                        }}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 flex-shrink-0">
                <button
                  onClick={() => {
                    createNewChat();
                    setIsSidebarVisible(false);
                  }}
                  className="w-full font-medium flex items-center justify-center p-3 text-white rounded-lg border border-orange-200 hover:bg-orange-400 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  New Chat
                </button>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mt-8 px-4">
              <div className="space-y-2">
                {chatSessions.slice(0, 5).map((session) => (
                  <button
                    key={session._id}
                    onClick={() => {
                      loadChat(session._id);
                      setIsSidebarVisible(false);
                    }}
                    // className={`w-full p-2 rounded-lg transition-colors ${
                    //   currentChatId === session._id ? 'bg-orange-600' : 'hover:bg-orange-400'
                    // }`}
                                        className={`w-full p-2 rounded-lg transition-colors ${
                      currentChatId === session._id ? 'bg-orange-400' : 'hover:bg-orange-400/50'
                    }`}
                    title={session.title || 'New Chat'}
                  >
                    <MessageSquare className="w-4 h-4 mx-auto" />
                  </button>
                ))}
                <button
                  onClick={() => {
                    createNewChat();
                    setIsSidebarVisible(false);
                  }}
                  className="w-full p-2 rounded-lg hover:bg-orange-400 transition-colors"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation - Fixed */}
        <div className="border-t border-orange-400 p-4 space-y-2 flex-shrink-0">
          <button
            onClick={() => handleNavigation('/subscription')}
            className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
              isCollapsed ? 'py-2 px-3' : 'px-3 py-2'
            } ${isActive('/subscription') ? 'bg-orange-400' : ''}`}
          >
            <Crown className="w-6 h-6" />
            {!isCollapsed && <span className="text-lg pl-2">Upgrade</span>}
          </button>
          <button
            onClick={() => handleNavigation('/profile')}
            className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
              isCollapsed ? 'py-2 px-3' : 'px-3 py-2'
            } ${isActive('/profile') ? 'bg-orange-400' : ''}`}
          >
            <Settings className="w-6 h-6" />
            {!isCollapsed && <span className="text-lg pl-2">Profile</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-lg hover:bg-orange-400 transition-colors w-full text-left ${
              isCollapsed ? 'py-2 px-3' : 'px-3 py-2'
            }`}
          >
            <LogOut className="w-6 h-6" />
            {!isCollapsed && <span className="text-lg pl-2">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;