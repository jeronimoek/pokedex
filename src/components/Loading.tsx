export function Loading() {
  return (
    <div className="flex h-96 w-full flex-col items-center justify-center text-center">
      <div className="text-3xl">Loading...</div>
      <img
        className="max-h-64 max-w-64"
        src="https://64.media.tumblr.com/858e1bd6e24b570a8ea94c873dec9dd9/2e244896bd7dd42b-93/s1280x1920/fd23ac0b09807df7fa6f7ac62fb71f64cb4c8aa2.gif"
        alt="loading"
      />
    </div>
  );
}
