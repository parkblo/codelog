export function BackgroundCanvas() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,rgba(186,230,253,0.12)_0%,transparent_75%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[48vh] bg-[linear-gradient(180deg,rgba(2,6,23,0)_0%,rgba(2,6,23,0.62)_62%,rgba(2,6,23,0.9)_100%)]" />
    </div>
  );
}
