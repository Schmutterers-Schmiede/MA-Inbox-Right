type Props = {
  title: string;
  instructions: string;
  onStart: () => void;
  /** Only set this for prototypes that involve a corner swipe gesture. */
  swipeSide?: "left" | "right";
};

export function InstructionsOverlay({ title, instructions, onStart, swipeSide }: Props) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center px-8 text-center">
      {swipeSide && (
        <div
          className={`absolute top-6 flex flex-col items-center gap-1 ${
            swipeSide === "right" ? "right-6" : "left-6"
          }`}
        >
          <div className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center animate-bounce">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="4" x2="12" y2="19" />
              <polyline points="6 13 12 19 18 13" />
            </svg>
          </div>
          <span className="text-red-500 text-[10px] font-bold tracking-wide">
            SWIPE
          </span>
        </div>
      )}

      <h2 className="text-white text-lg font-semibold mb-4">{title}</h2>
      <p className="text-white/80 text-sm leading-relaxed mb-8">{instructions}</p>
      <button
        onClick={onStart}
        className="bg-white text-black text-sm font-semibold px-6 py-2 rounded-full active:scale-95 transition-transform"
      >
        Start
      </button>
    </div>
  );
}