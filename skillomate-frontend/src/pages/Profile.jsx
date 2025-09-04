// import { useState, useEffect } from "react";
// import { Menu, X, Edit, Trash2, Lock, LogOut, User, Clock, Save } from "lucide-react";
// import profile from '../assets/images/profile.png';
// import arrow from '../assets/images/arrow.png';
// import edit from '../assets/images/edit.png';
// import clear from '../assets/images/clear.png';
// import Password from '../assets/images/Password.png';
// import logout from '../assets/images/logout.png';
// import Sidebar from "../components/Sidebar";

// export default function Profile() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [userData, setUserData] = useState({
//     username: "Tanya",
//     board: "",
//     grade: ""
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState({ board: "", grade: "" });
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Fetch user data when component mounts
//     fetchUserProfile();
//   }, []);

//   const fetchUserProfile = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/profile', {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       const data = await response.json();
//       if (data.success) {
//         setUserData(data.user);
//         setEditForm({ board: data.user.board, grade: data.user.grade });
//       }
//     } catch (err) {
//       setError("Failed to fetch profile data");
//     }
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/profile', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify(editForm)
//       });
//       const data = await response.json();
//       if (data.success) {
//         setUserData({ ...userData, ...editForm });
//         setIsEditing(false);
//         setError("");
//       } else {
//         setError(data.message);
//       }
//     } catch (err) {
//       setError("Failed to update profile");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} className="hidden md:flex" />

//       {/* Main Content */}
//       <div className={`flex-1 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-64 ml-0'} transition-all flex-col duration-300`}>
//         {/* Header */}
//         <div className="px-8 py-4 flex items-center justify-between ">
//           <h2 className='text-2xl text-orange-500 font-bold'>skillomate</h2>
//           <div className="flex items-center">
//             <img src={arrow} alt="" className="w-10 h-10" />
//           </div>
//         </div>

//         {/* Profile Section */}
//         <div className="flex flex-col items-center mb-6">
//           <img
//             src={profile}
//             alt="Profile"
//             className="w-40 h-40 lg:w-60 lg:h-60 rounded-full object-cover"
//           />
//           <h2 className="text-orange-500 font-semibold mt-2">Hi, {userData.username}</h2>
//         </div>

//         {/* Activity */}
//         <div className="w-full px-10 md:px-20 lg:px-40 font-bold">
//           <h3 className="font-bold md:text-2xl text-xl mb-4">My Activity</h3>
//           <div className="space-y-1">
//             <div className="flex justify-between md:text-xl text-lg py-1">
//               <span className="text-gray-500">Board</span>
//               <span className="font-medium">{userData.board}</span>
//             </div>
//             <div className="flex justify-between md:text-xl text-lg py-1">
//               <span className="text-gray-500">Grade</span>
//               <span className="font-medium">{userData.grade}</span>
//             </div>
//             <div className="flex justify-between md:text-xl text-lg py-1">
//               <span className="text-gray-500">Questions Asked</span>
//               <span className="font-medium">134</span>
//             </div>
//             <div className="flex justify-between md:text-xl text-lg py-1">
//               <span className="text-gray-500">Saved Answers</span>
//               <span className="font-medium">17</span>
//             </div>
//             <div className="flex justify-between md:text-xl text-lg py-1">
//               <span className="text-gray-500">Last Active</span>
//               <span className="font-medium">Aug 6, 2025</span>
//             </div>
//             <button
//               onClick={() => setIsEditing(true)}
//               className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
//             >
//               <Edit size={20} />
//               Edit Class & Grade
//             </button>
//           </div>
//         </div>

//         {/* Edit Form Modal */}
//         {isEditing && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//             <div className="bg-white p-6 rounded-lg w-full max-w-md">
//               <h3 className="text-xl font-bold mb-4">Edit Class & Grade</h3>
//               {error && <p className="text-red-500 mb-4">{error}</p>}
//               <form onSubmit={handleEditSubmit}>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2">Board</label>
//                   <select
//                     value={editForm.board}
//                     onChange={(e) => setEditForm({ ...editForm, board: e.target.value })}
//                     className="w-full p-2 border rounded"
//                   >
//                     <option value="CBSE">CBSE</option>
//                     <option value="ICSE">ICSE</option>
//                     <option value="State Board">State Board</option>
//                   </select>
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2">Grade</label>
//                   <select
//                     value={editForm.grade}
//                     onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
//                     className="w-full p-2 border rounded"
//                   >
//                     {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(grade => (
//                       <option key={grade} value={grade}>{grade}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setIsEditing(false)}
//                     className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Account Settings */}
//         <div className="w-full mt-8 px-10 md:px-20 lg:px-40 font-bold">
//           <h3 className="font-bold text-2xl mb-4">Account Settings</h3>
//           <div className="space-y-4">
//             <button className="flex items-center gap-2 w-full text-left">
//               <img src={edit} alt="" className="w-8 h-8"/>
//               Edit Profile
//             </button>
//             <button className="flex items-center gap-2 w-full text-left">
//               <img src={clear} alt="" className="w-8 h-8" />
//               Clear History
//             </button>
//             <button className="flex items-center gap-2 w-full text-left">
//               <img src={Password} alt="" className="w-8 h-8"/>
//               Change Password
//             </button>
//             <button className="sm:hidden flex items-center gap-2 w-full text-left">
//               <img src={logout} alt="" className="w-8 h-8"/>
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Edit,
  Trash2,
  Lock,
  LogOut,
  User,
  Clock,
  Save,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import edit from "../assets/images/edit.png";
import clear from "../assets/images/clear.png";
import Password from "../assets/images/Password.png";
import download from "../assets/images/download.jpeg";
import download1 from "../assets/images/download1.jpeg";
import download2 from "../assets/images/download2.png";
import download3 from "../assets/images/download3.jpeg";
import download4 from "../assets/images/download4.jpeg";
import download5 from "../assets/images/download5.jpeg";
// import profile from "../assets/images/profile.png";
import profile from "../assets/images/person.webp";
import arrow from "../assets/images/arrow.png";
import config from '../../env-config.js';

const API_BASE_URL = config.API_BASE_URL;
console.log('api base url', API_BASE_URL)

// Default avatars (assumed to be in public/assets/avatars)
const defaultAvatars = [
  download,
  download1,
  download2,
  download3,
  download4,
  download5,
];

export default function Profile() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState({
    username: "Tanya",
    board: "",
    grade: "",
    profilePicture: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    board: "",
    grade: "",
    profilePicture: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserData(data.user);
        setEditForm({
          board: data.user.board,
          grade: data.user.grade,
          profilePicture: data.user.profilePicture,
        });
      }
    } catch (err) {
      setError("Failed to fetch profile data");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (data.success) {
        setUserData({ ...userData, ...editForm });
        setIsEditing(false);
        setError("");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  // const handlePasswordChange = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setSuccess("");
    
  //   if (passwordForm.newPassword !== passwordForm.confirmPassword) {
  //     setError("New passwords do not match");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("http://localhost:5000/api/auth/change-password", {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //       body: JSON.stringify({
  //         currentPassword: passwordForm.currentPassword,
  //         newPassword: passwordForm.newPassword,
  //       }),
  //     });
  //     const data = await response.json();
  //     if (data.success) {
  //       setSuccess("Password changed successfully");
  //       setPasswordForm({
  //         currentPassword: "",
  //         newPassword: "",
  //         confirmPassword: "",
  //       });
  //       setTimeout(() => {
  //         setIsChangingPassword(false);
  //         setSuccess("");
  //       }, 2000);
  //     } else {
  //       setError(data.message);
  //     }
  //   } catch (err) {
  //     setError("Failed to change password");
  //   }
  // };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    return password.length >= 6 && passwordRegex.test(password);
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!passwordForm.currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!validatePassword(passwordForm.newPassword)) {
      setError(
        "New password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setIsChangingPassword(false);
          setSuccess("");
        }, 2000);
      } else {
        console.log('error')
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to change password");
    }
  };

  const selectAvatar = (avatar) => {
    setEditForm({ ...editForm, profilePicture: avatar });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        className=""
      />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isCollapsed ? "md:ml-20 ml-0" : "md:ml-64 ml-0"
        } transition-all flex-col duration-300`}
      >
        {/* Header */}
        <div className="px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl text-orange-500 font-bold">skillomate</h2>
          <div className="flex items-center">
            <img src={arrow} alt="" className="w-10 h-10" />
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={userData.profilePicture || profile || defaultAvatars[0]}
            // src={download}
            alt="Profile"
            className="w-40 h-40 lg:w-60 lg:h-60 rounded-full object-cover"
          />
          <h2 className="text-orange-500 font-semibold mt-2">
            Hi, {userData.username}
          </h2>
        </div>

        {/* Activity */}
        <div className="w-full px-10 md:px-20 lg:px-40 font-bold">
          <h3 className="font-bold md:text-2xl text-xl mb-4">My Activity</h3>
          <div className="space-y-1">
            <div className="flex justify-between md:text-xl text-lg py-1">
              <span className="text-gray-500">Questions Asked</span>
              <span className="font-medium">134</span>
            </div>
            <div className="flex justify-between md:text-xl text-lg py-1">
              <span className="text-gray-500">Saved Answers</span>
              <span className="font-medium">17</span>
            </div>
            <div className="flex justify-between md:text-xl text-lg py-1">
              <span className="text-gray-500">Last Active</span>
              <span className="font-medium">Aug 6, 2025</span>
            </div>
            <div className="flex justify-between md:text-xl text-lg py-1">
              <span className="text-gray-500">Board</span>
              <span className="font-medium">{userData.board}</span>
            </div>
            <div className="flex justify-between md:text-xl text-lg py-1">
              <span className="text-gray-500">Grade</span>
              <span className="font-medium">{userData.grade}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
            >
              <Edit size={20} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Edit Form Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {defaultAvatars.map((avatar, index) => (
                      <img
                        key={index}
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className={`w-16 h-16 rounded-full object-cover cursor-pointer border-2 ${
                          editForm.profilePicture === avatar
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                        onClick={() => selectAvatar(avatar)}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Board</label>
                  <select
                    value={editForm.board}
                    onChange={(e) =>
                      setEditForm({ ...editForm, board: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Grade</label>
                  <select
                    value={editForm.grade}
                    onChange={(e) =>
                      setEditForm({ ...editForm, grade: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    {[
                      "Class 1",
                      "Class 2",
                      "Class 3",
                      "Class 4",
                      "Class 5",
                      "Class 6",
                      "Class 7",
                      "Class 8",
                      "Class 9",
                      "Class 10",
                      "Class 11",
                      "Class 12",
                    ].map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
               {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Change Password</h3>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {success && <p className="text-green-500 mb-4">{success}</p>}
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div className="w-full mt-8 px-10 md:px-20 lg:px-40 font-bold">
          <h3 className="font-bold text-2xl mb-4">Account Settings</h3>
          <div className="space-y-4">
            <button className="flex items-center gap-2 w-full text-left">
              <img src={edit} alt="" className="w-8 h-8" />
              Edit Profile
            </button>
            <button className="flex items-center gap-2 w-full text-left">
              <img src={clear} alt="" className="w-8 h-8" />
              Clear History
            </button>
            <button className="flex items-center gap-2 w-full text-left"
            onClick={() => setIsChangingPassword(true)}
            >
              <img src={Password} alt="" className="w-8 h-8" />
              Change Password
            </button>
            <button className="sm:hidden flex items-center gap-2 w-full text-left">
              <img src="/assets/images/logout.png" alt="" className="w-8 h-8" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
