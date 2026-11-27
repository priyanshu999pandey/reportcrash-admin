import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import Button from './Button'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  title?: string
  message: string
  isDeleting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

const DeleteConfirmationModal = ({
  isOpen,
  title = 'Confirm deletion',
  message,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) => {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onCancel()
    }
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isDeleting, isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirmation-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel()
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border-soft bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <AlertTriangle size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="delete-confirmation-title" className="m-0 text-body font-bold text-text">
              {title}
            </h2>
            <p className="mt-2 mb-0 text-small leading-6 text-text-muted">
              {message}
            </p>
          </div>
          <button
            type="button"
            title="Close"
            aria-label="Close deletion confirmation"
            disabled={isDeleting}
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="small" disabled={isDeleting} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="red" size="small" disabled={isDeleting} onClick={onConfirm} className="gap-2">
            {isDeleting ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
