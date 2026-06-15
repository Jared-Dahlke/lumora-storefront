export default function Loading({ message }: { message?: string }) {
  return (
    <div className="boot">
      <div className="boot-mark">
        <span className="boot-ring" />
        <span className="wordmark big">
          <span className="wordmark-dot" />
          Lumora
        </span>
      </div>
      <p className="boot-msg">{message ?? 'Waking up the store…'}</p>
      <p className="boot-sub">Our store runs on a free tier and may take a moment to wake.</p>
    </div>
  );
}
