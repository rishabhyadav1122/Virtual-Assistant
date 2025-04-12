import { Link } from "react-router-dom";
import { useState } from "react";
import {MoreVertical ,UserCircle , LogOut   } from "lucide-react";
import { useAuth } from "../contexts/authContext"; // Adjust the import path as needed

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn } = useAuth(); // Get authentication status from context

  return (
    <nav className="bg-gray-800 text-xl text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl ml-10 font-bold text-purple-400">
          Virtual Assistant
        </Link>

        {/* Menu for Mobile */}
        <button
          className="lg:hidden text-gray-300 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MoreVertical size={28} />
        </button>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex space-x-6">
          <li>
            <Link to="/" className="hover:text-purple-400">
              Home
            </Link>
          </li>
          {isLoggedIn ? (
            <>
            <li>
             <Link to="/profile" className="hover:text-green-400 flex items-center gap-2">
  <UserCircle className="w-5 h-5" />
  <span className="hidden sm:inline">Profile</span>
</Link>
            </li>
            <li>
             <Link to="/logout" className="hover:text-green-400 flex items-center gap-2">
  <LogOut  className="w-5 h-5" />
  <span className="hidden sm:inline">logout</span>
</Link>
            </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-purple-400">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="lg:hidden bg-gray-900">
          <ul className="flex flex-col text-center py-4 space-y-4">
            <li>
              <Link to="/" className="block text-gray-300 hover:text-purple-400">
                Home
              </Link>
            </li>
            {isLoggedIn ? (
              <li>
               <Link to="/profile" className="hover:text-green-400 flex items-center gap-2">
  <UserCircle className="w-5 h-5" />
  <span className="hidden sm:inline">Profile</span>
</Link>

              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="block bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="block text-gray-300 hover:text-purple-400">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};
