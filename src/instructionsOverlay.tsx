type Props = {
  variant: string;
  onStart: () => void;
  /** Only set this for prototypes that involve a corner swipe gesture. */
  swipeSide?: "left" | "right";
  /** Image showing the participant's assigned grip type, if available. */
  gripImage?: string;
};

// This label map is the only thing shared verbatim across every project's
// copy of this file — everything else below is specific to THIS prototype.
const VARIANT_LABELS: Record<string, string> = {
  baseline: "Right-Handed Version",
  lefthand: "Left-Handed Version",
  onehandmode: "One-Handed Mode",
};

const TITLE = "Message Inbox";

const INSTRUCTIONS: Record<string, string> = {
  baseline: "Delete all the messages by swiping LEFT on each of them. When you're done, tap the 'Rate now' button.",
  onehandmode: "Delete all the messages by swiping LEFT on each of them. When you're done, tap the 'Rate now' button.",
  lefthand: "Delete all the messages by swiping RIGHT on each of them. When you're done, tap the 'Rate now' button.",
};

export function InstructionsOverlay({ variant, onStart, swipeSide, gripImage }: Props) {
  const title = `${TITLE}: ${VARIANT_LABELS[variant] ?? ""}`;
  const instructions = INSTRUCTIONS[variant] ?? "";

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

      {/* Title — prototype name plus which specific variant is being tested */}
      <h2 className="text-white text-lg font-semibold mb-3">{title}</h2>

      {/* Fixed grip-holding instruction, identical across every prototype */}
      <p className="text-white/70 text-xs leading-relaxed mb-4 max-w-[280px]">
        Please hold your phone as depicted below during the test and change
        your grip only if it is physically impossible to complete the task
        with the depicted grip.
      </p>

      {gripImage ? (
        <img
          src={gripImage}
          alt="Hold your phone like this"
          className="w-40 h-auto mb-4 rounded-xl"
        />
      ) : (
        // Generic placeholder for local testing when no grip is provided
        // (e.g. skipping the welcome page). Self-contained, no external file needed.
        <div className="w-40 h-40 mb-4 rounded-xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center gap-1">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="7" y="2" width="10" height="20" rx="2" />
            <path d="M5 14c-1.5 1-2 2.5-1 4s3 1.5 4 0" />
            <path d="M19 14c1.5 1 2 2.5 1 4s-3 1.5-4 0" />
          </svg>
          <span className="text-white/40 text-[10px] font-medium tracking-wide">
            NO GRIP IMAGE
          </span>
        </div>
      )}

      {/* Label above the task description */}
      <p className="text-white text-xs font-bold tracking-wide mt-2">
        TASK:
      </p>
      {/* This variant's description: what the interface is + what to do */}
      <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-[280px]">
        {instructions}
      </p>

      <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-[280px]">
        You can return to this instruction screen any time by tapping the info button next to the 'Rate now' button
      </p>
      <button
        onClick={onStart}
        className="bg-white text-black text-sm font-semibold px-6 py-2 rounded-full active:scale-95 transition-transform"
      >
        Start
      </button>
    </div>
  );
}