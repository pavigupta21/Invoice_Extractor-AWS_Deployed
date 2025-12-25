// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ onGetStarted, user, onLogout,theme, toggleTheme }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-40 dark:bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              SI
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Smart Invoice Extractor</h1>
              <p className="text-xs text-gray-500">Extract data in seconds</p>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            {/* Dark Mode Toggle */}
        
        <button
        onClick={toggleTheme}
        className="w-10 h-10 flex items-center justify-center rounded-full 
                    bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-yellow-300 
                    hover:ring-2 hover:ring-indigo-300 transition"
        >
        {theme === "dark" ? "🌙" : "☀️"}
        </button>



            {/* If user IS LOGGED IN */}
            {user && (
              <>
                

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold hover:ring-2 hover:ring-indigo-300 transition"
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border py-2 animate-fade-in">

                      {/* User Name */}
                      <p className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user.name}
                      </p>

                      {/* History Page */}
                      <Link
                        to="/history"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        History
                      </Link>

                      {/* Logout */}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>

                    </div>
                  )}

                </div>
              </>
            )}

            {/* If NOT logged in */}
            {!user && (
              <button
                onClick={onGetStarted}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition"
              >
                Get Started
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
