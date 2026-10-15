export default function ToastContainer({ toasts = [], onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="status"
          onClick={() => onDismiss?.(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
