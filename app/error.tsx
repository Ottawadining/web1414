"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap py-28 text-center">
      <h1 className="text-4xl md:text-5xl">The kitchen is in the weeds.</h1>
      <p className="mt-4 text-muted">Something went wrong on our side. Give it a moment.</p>
      <button onClick={reset} className="mt-10 btn">Try again</button>
    </div>
  );
}
