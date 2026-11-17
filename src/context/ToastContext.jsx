import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import ToastContainer from "../components/ToastContainer.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  // Active toasts state list: { id, message, type, duration }
  const [toasts, setToasts] = useState([]);
  
  // Timer tracking to prevent memory leaks and handle unmounting
  const timerMapRef = useRef(new Map());

  // Task 1: implement dismissToast
  // Stable callback removing the toast matching id
  const dismissToast = useCallback((id) => {
    // Clear any active scheduled timeout from event loop
    if (timerMapRef.current.has(id)) {
      clearTimeout(timerMapRef.current.get(id));
      timerMapRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Task 1: implement showToast
  // Generates unique id, updates toasts list, and schedules auto-dismiss in the JS event loop
  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      // JavaScript — Event loop: Schedules callback on the Macrotask queue
      const timerId = setTimeout(() => {
        dismissToast(id);
      }, duration);

      timerMapRef.current.set(id, timerId);
    },
    [dismissToast]
  );

  // Side effects with useEffect: Lifecycle cleanup of any active timers when provider unmounts
  useEffect(() => {
    const activeTimers = timerMapRef.current;
    return () => {
      activeTimers.forEach((timerId) => clearTimeout(timerId));
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

// useToast lets any component grab showToast / dismissToast without prop drilling.
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}
