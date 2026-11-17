import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext.jsx";
import { login, sanitizeInput } from "../api/mockApi.js";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: login,
    // Task 3: on success, fire a success toast (e.g. "Welcome back!")
    onSuccess: () => {
      showToast("Welcome back!", "success");
    },
    // Task 3: on error, read error.response?.data?.message and fire an error toast
    onError: (error) => {
      const message = error?.response?.data?.message || "Invalid username or password";
      showToast(message, "error");
    },
  });

  // JavaScript — Hoisting: Traditional function declaration hoisted within scope
  function handleSubmit(e) {
    e.preventDefault();

    // Form validation: client-side field validation before submission
    const sanitizedUser = sanitizeInput(username);
    if (!sanitizedUser || !password) {
      showToast("Username and password are required", "error");
      return;
    }

    mutation.mutate({ username: sanitizedUser, password });
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Log in</h2>
      <p className="hint">
        Correct login: <code>ada</code> / <code>password</code>. Anything else triggers an
        error toast.
      </p>
      <input
        className="input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className="btn" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
