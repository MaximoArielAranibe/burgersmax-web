// src/context/AdminContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem("isAdmin")) || false; } catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem("isAdmin", JSON.stringify(isAdmin));
  }, [isAdmin]);

  const login = (pin) => {
    const OK = String(import.meta.env.VITE_ADMIN_PIN ?? "1234");
    if (String(pin) === OK) {
      setIsAdmin(true);
      return { ok: true };
    }
    return { ok: false, message: "PIN incorrecto" };
  };

  const logout = () => setIsAdmin(false);

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
