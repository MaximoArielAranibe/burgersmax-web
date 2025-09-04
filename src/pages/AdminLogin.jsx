// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { login } = useAdmin();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = (e) => {
    e.preventDefault();
    const res = login(pin);
    if (res.ok) nav(from, { replace: true });
    else setError(res.message || "Error");
  };

  return (
    <section style={{ maxWidth: 420, margin: "32px auto", padding: 16 }}>
      <h2>Panel Admin</h2>
      <p style={{ color: "#6b7280" }}>
        Ingresá el PIN de administrador para continuar.
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="password"
          inputMode="numeric"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        {error && <div style={{ color: "#d92d20", fontWeight: 700 }}>{error}</div>}
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Entrar
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
        Consejo: definí <code>VITE_ADMIN_PIN</code> en tu <code>.env</code> (ej: <code>VITE_ADMIN_PIN=8451</code>).
      </p>
    </section>
  );
}
