import { useState, useRef, useCallback } from 'react'

// ─── Configuration ────────────────────────────────────────────────────────────
// "left"  → drag item left to reveal Delete on the right  (right-handed default)
// "right" → drag item right to reveal Delete on the left  (left-handed variant)
const SWIPE_DIRECTION: 'left' | 'right' = 'left'

const DELETE_THRESHOLD = 0.35 // fraction of item width that commits delete
const EDGE_INSET = 20        // px inset from screen edge before gesture starts

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  sender: string
  preview: string
  timestamp: string
  unread: boolean
  avatarColor: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Sarah Chen',
    preview: "Hey! Are you still coming to the team lunch tomorrow? I reserved a table for 6 at noon.",
    timestamp: '9:41 AM',
    unread: true,
    avatarColor: '#6C63FF',
  },
  {
    id: '2',
    sender: 'Marcus Webb',
    preview: "The Q3 report is ready for your review. A few numbers changed from last week's draft.",
    timestamp: '8:15 AM',
    unread: true,
    avatarColor: '#0EA5E9',
  },
  {
    id: '3',
    sender: 'Priya Nair',
    preview: 'Just pushed the design updates to Figma. Let me know what you think about the new nav.',
    timestamp: 'Yesterday',
    unread: false,
    avatarColor: '#F59E0B',
  },
  {
    id: '4',
    sender: 'Dev Alerts',
    preview: 'Build #4821 passed all checks. Deployment to staging completed successfully.',
    timestamp: 'Yesterday',
    unread: false,
    avatarColor: '#10B981',
  },
  {
    id: '5',
    sender: 'Jordan Blake',
    preview: "Can we reschedule the 3pm? Something came up on my end. Would 4:30 or Friday work?",
    timestamp: 'Mon',
    unread: false,
    avatarColor: '#EC4899',
  },
  {
    id: '6',
    sender: 'Newsletter',
    preview: 'Your weekly digest: 12 articles hand-picked for product designers and engineers.',
    timestamp: 'Mon',
    unread: false,
    avatarColor: '#94A3B8',
  },
]

// ─── Swipe Item ───────────────────────────────────────────────────────────────
interface SwipeItemProps {
  message: Message
  onDelete: (id: string) => void
  highlight?: boolean
}

function SwipeItem({ message, onDelete, highlight }: SwipeItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const startXRef = useRef(0)
  const startClientXRef = useRef(0)
  const activeRef = useRef(false)

  const commitDelete = useCallback(() => {
    setIsDeleting(true)
    setTimeout(() => onDelete(message.id), 280)
  }, [message.id, onDelete])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDeleting) return

    const el = itemRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    // Respect edge inset: don't start gesture too close to the screen edges
    const relativeX = e.clientX - rect.left
    if (relativeX < EDGE_INSET || relativeX > rect.width - EDGE_INSET) return

    activeRef.current = true
    startXRef.current = offset
    startClientXRef.current = e.clientX
    setIsDragging(true)
    el.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeRef.current || isDeleting) return

    const el = itemRef.current
    if (!el) return

    const dx = e.clientX - startClientXRef.current
    let newOffset = startXRef.current + dx

    // Constrain to the allowed swipe direction
    if (SWIPE_DIRECTION === 'left') {
      newOffset = Math.min(0, newOffset)   // only left
    } else {
      newOffset = Math.max(0, newOffset)   // only right
    }

    // Rubber-band resistance past ~60% of item width
    const maxSwipe = el.offsetWidth * 0.6
    const absOffset = Math.abs(newOffset)
    if (absOffset > maxSwipe) {
      const excess = absOffset - maxSwipe
      const dampened = maxSwipe + excess * 0.2
      newOffset = SWIPE_DIRECTION === 'left' ? -dampened : dampened
    }

    setOffset(newOffset)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeRef.current || isDeleting) return
    activeRef.current = false
    setIsDragging(false)

    const el = itemRef.current
    if (!el) return

    const threshold = el.offsetWidth * DELETE_THRESHOLD
    if (Math.abs(offset) >= threshold) {
      commitDelete()
    } else {
      setOffset(0)
    }
  }

  // How much of the delete action is revealed (0–1)
  const revealRatio = itemRef.current
    ? Math.min(1, Math.abs(offset) / (itemRef.current.offsetWidth * DELETE_THRESHOLD))
    : 0

  const initials = message.sender
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: isDeleting ? 0 : undefined,
        opacity: isDeleting ? 0 : 1,
        transition: isDeleting
          ? 'height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease'
          : undefined,
      }}
    >
      {/* Delete action backdrop */}
      <div
        className="absolute inset-y-0 flex items-center justify-center"
        style={{
          [SWIPE_DIRECTION === 'left' ? 'right' : 'left']: 0,
          width: Math.abs(offset) + 'px',
          background: `rgba(239,68,68,${0.85 + revealRatio * 0.15})`,
          transition: isDragging ? undefined : 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div
          className="flex flex-col items-center gap-0.5"
          style={{ opacity: Math.min(1, revealRatio * 2) }}
        >
          {/* Trash icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
          <span className="text-white text-xs font-semibold tracking-wide">Delete</span>
        </div>
      </div>

      {/* Item content */}
      <div
        ref={itemRef}
        className="relative flex items-center gap-3 px-4 py-3.5 select-none"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? undefined : 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
          touchAction: 'pan-y',
          cursor: isDragging ? 'grabbing' : 'default',
          background: highlight ? '#FAFAF7' : 'white',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          style={{ backgroundColor: message.avatarColor }}
        >
          {initials}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span
              className="text-sm leading-snug truncate"
              style={{
                fontWeight: message.unread ? 600 : 500,
                color: message.unread ? '#111827' : '#374151',
              }}
            >
              {message.sender}
            </span>
            <span
              className="flex-shrink-0 text-xs"
              style={{ color: message.unread ? '#6C63FF' : '#9CA3AF' }}
            >
              {message.timestamp}
            </span>
          </div>
          <p
            className="text-sm leading-snug truncate"
            style={{ color: message.unread ? '#374151' : '#9CA3AF' }}
          >
            {message.preview}
          </p>
        </div>

        {/* Unread indicator */}
        {message.unread && (
          <div
            className="flex-shrink-0 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#6C63FF' }}
          />
        )}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [deletedIds, setDeletedIds] = useState<string[]>([])

  const handleDelete = useCallback((id: string) => {
    setDeletedIds((prev) => [...prev, id])
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const unreadCount = messages.filter((m) => m.unread).length

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: '100dvh',
        backgroundColor: '#F3F4F6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Status bar spacer */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      {/* Header */}
      <header
        className="flex items-end justify-between px-5 pb-3 pt-3"
        style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}
      >
        <div>
          <h1
            className="text-2xl leading-none"
            style={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}
          >
            Inbox
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              {unreadCount} unread
            </p>
          )}
        </div>

        {/* Edit button */}
        <button
          className="text-sm font-semibold"
          style={{ color: '#6C63FF' }}
        >
          Edit
        </button>
      </header>

      {/* Hint */}
      <div
        className="flex items-center justify-center gap-1.5 py-2"
        style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span className="text-xs" style={{ color: '#9CA3AF' }}>
          Swipe {SWIPE_DIRECTION} to delete
        </span>
      </div>

      {/* Message list */}
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'white' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              All caught up!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id}>
              <SwipeItem
                message={msg}
                onDelete={handleDelete}
                highlight={msg.sender === 'Sarah Chen'}
              />
              {i < messages.length - 1 && (
                <div className="mx-4" style={{ height: '1px', backgroundColor: '#F3F4F6' }} />
              )}
            </div>
          ))
        )}
      </main>

      {/* Bottom safe area */}
      <div
        style={{
          height: 'env(safe-area-inset-bottom, 0px)',
          backgroundColor: 'white',
          borderTop: messages.length > 0 ? '1px solid #E5E7EB' : undefined,
        }}
      />
    </div>
  )
}
