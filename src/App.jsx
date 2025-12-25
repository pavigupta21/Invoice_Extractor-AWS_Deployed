
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import Dashboard from "./pages/Dashboard";
import AuthModal from "./components/AuthModal";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import HistoryPage from "./pages/HistoryPage";

function App() {
  const [theme, setTheme] = useState("light");

  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const API_BASE = "https://yleli2plp0.execute-api.us-east-1.amazonaws.com/prod";

useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    setTheme(savedTheme);
  }
}, []);
useEffect(() => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  
  // Save theme
  localStorage.setItem("theme", theme);
}, [theme]);


  // ---------- LOAD USER FROM LOCAL STORAGE ----------
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  // ---------- TOAST ----------
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ---------- REGISTER ----------
  const handleRegister = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.status === 201) {
        showToast("Registration successful!", "success");
        const userObj = { name, email };
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
        setShowAuth(false);
        navigate("/dashboard");
      } else {
        showToast(data.message || "Registration failed", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error", "error");
    }
  };

  // ---------- LOGIN ----------
  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 200) {
        showToast("Login successful!", "success");
        const userObj = { name: data.name, email };
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
        setShowAuth(false);
        navigate("/dashboard");
      } else {
        showToast(data.message || "Invalid credentials", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error", "error");
    }
  };

  // ---------- LOGOUT ----------
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    showToast("Logged out successfully!", "success");
    navigate("/");
  };

  return (
    <>
      {/* Navbar always visible */}
      <Navbar
        user={user}
        onGetStarted={() => setShowAuth(true)}
        onLogout={handleLogout}
        theme={theme}
      toggleTheme={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
        
      />

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Routes */}
      <Routes>
        <Route
  path="/"
  element={
    <WelcomePage
      user={user}
      theme={theme}                      // ⬅ ADD THIS
      toggleTheme={() => setTheme(prev => prev === "dark" ? "light" : "dark")}   // ⬅ AND THIS
      onStart={() => setShowAuth(true)}
      goToDashboard={() => navigate("/dashboard")}
    />
  }
/>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />
<Route path="/history" element={<HistoryPage user={user} />} />

      </Routes>
    </>
  );
}

export default App;
