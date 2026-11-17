import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext.jsx";
import { createThread, sanitizeInput } from "../api/mockApi.js";

export default function CreateThreadForm() {
  const [title, setTitle] = useState("");
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: createThread,
    // Task 3: on success, fire a green toast: showToast("Thread posted!", "success")
    onSuccess: () => {
      showToast("Thread posted!", "success");
    },
    // Task 3: on error, read error.response?.data?.message (fall back to a generic string)
    onError: (error) => {
      const message = error?.response?.data?.message || "Failed to post thread";
      showToast(message, "error");
    },
  });

  // JavaScript — Hoisting: Regular function declaration is hoisted within component scope
  function handleSubmit(e) {
    e.preventDefault();

    // Form validation: client-side sanitization and check
    const sanitizedTitle = sanitizeInput(title);
    if (!sanitizedTitle) {
      showToast("Title is required", "error");
      return;
    }

    mutation.mutate({ title: sanitizedTitle });
    setTitle("");
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Create a thread</h2>
      <p className="hint">
        Tip: the title <code>Welcome to Threadbase</code> already exists, so posting it
        triggers a duplicate-title error.
      </p>
      <input
        className="input"
        placeholder="Thread title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <button className="btn" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Posting..." : "Post thread"}
      </button>
    </form>
  );
}
