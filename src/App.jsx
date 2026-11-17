import { useState, useEffect } from "react";
import CreateThreadForm from "./components/CreateThreadForm.jsx";
import LoginForm from "./components/LoginForm.jsx";

// Environment variables & secrets management
const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Threadbase";

export default function App() {
  // Client-side routing: Tracks the current active route/view ('all', 'threads', 'login')
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.replace("#/", "");
    return ["threads", "login"].includes(hash) ? hash : "all";
  });

  // Side effects with useEffect: Sync route with window hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      setCurrentRoute(["threads", "login"].includes(hash) ? hash : "all");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navigateTo = (route) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
  };

  return (
    <div className="page">
      <h1>{APP_TITLE}</h1>
      <p className="lead">
        Try the forms below. Once you finish the toast system, each action should show a
        toast in the top-right corner.
      </p>

      {/* Client-side routing navigation controls */}
      <nav style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          className="btn"
          style={{ background: currentRoute === "all" ? "#4f46e5" : "#e2e8f0", color: currentRoute === "all" ? "#fff" : "#334155" }}
          onClick={() => navigateTo("all")}
        >
          All Views
        </button>
        <button
          className="btn"
          style={{ background: currentRoute === "threads" ? "#4f46e5" : "#e2e8f0", color: currentRoute === "threads" ? "#fff" : "#334155" }}
          onClick={() => navigateTo("threads")}
        >
          Create Thread
        </button>
        <button
          className="btn"
          style={{ background: currentRoute === "login" ? "#4f46e5" : "#e2e8f0", color: currentRoute === "login" ? "#fff" : "#334155" }}
          onClick={() => navigateTo("login")}
        >
          Log In
        </button>
      </nav>

      <div className="grid">
        {(currentRoute === "all" || currentRoute === "threads") && <CreateThreadForm />}
        {(currentRoute === "all" || currentRoute === "login") && <LoginForm />}
      </div>
    </div>
  );
}
