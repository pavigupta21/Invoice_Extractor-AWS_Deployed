// src/components/AuthModal.jsx
import React, { useState } from "react";

export default function AuthModal({ onClose, onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (isLogin) {
      onLogin(form.email, form.password);
    } else {
      onRegister(form.name, form.email, form.password);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md mx-4 rounded-lg shadow-lg p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isLogin ? "Login" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Name field (only for register) */}
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-sm text-gray-600 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter your name"
            />
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter your email"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter your password"
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700"
        >
          {isLogin ? "Login" : "Register"}
        </button>

        {/* Switch between Login / Register */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-indigo-600 hover:underline font-medium"
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-indigo-600 hover:underline font-medium"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
