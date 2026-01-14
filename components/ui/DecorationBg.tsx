/**
 * Decorative background blur circles used on auth pages (login, register)
 */
export function DecorationBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[var(--color-primary)] opacity-[0.03] blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[var(--color-accent)] opacity-[0.03] blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-primary)] opacity-[0.02] blur-3xl"></div>
    </div>
  );
}
