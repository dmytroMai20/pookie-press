"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold text-white/80">
        Something went wrong
      </h2>
      <p className="text-sm text-white/50">
        {process.env.NODE_ENV === "development" ? error.message : "Please try again later."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-pink-500/20 px-4 py-2 text-sm text-pink-300 transition-colors hover:bg-pink-500/30"
      >
        Try again
      </button>
    </main>
  );
}
