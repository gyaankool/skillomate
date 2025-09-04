import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("KG (Kindergarten)");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const classes = [
    "KG (Kindergarten)",
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
  ];

  return (
    <div className="px-20 py-4 flex items-center justify-between">
      <h2 className='text-2xl text-orange-500 font-semibold'>skillomate</h2>
      
      {/* User Info */}
      {user && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600"> {user.username}</span>
          <span className="text-xs text-gray-400">({user.grade})</span>
        </div>
      )}
    </div>
  );
};

export default Navbar;
