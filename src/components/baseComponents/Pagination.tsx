import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  currentItemCount: number
  itemLabel: string
  onPageChange: (page: number) => void
  secondaryText?: string
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  currentItemCount,
  itemLabel,
  onPageChange,
  secondaryText,
}: PaginationProps) => {
  const availablePages = Math.max(1, totalPages)
  const activePage = Math.min(Math.max(1, currentPage), availablePages)
  const firstItem = currentItemCount === 0 ? 0 : (activePage - 1) * pageSize + 1
  const lastItem = currentItemCount === 0 ? 0 : firstItem + currentItemCount - 1

  return (
    <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="m-0 text-tiny text-text-muted">
          Showing {firstItem}-{lastItem} of {totalItems} {itemLabel}
        </p>
        {secondaryText && <p className="mt-1 mb-0 text-tiny text-text-muted">{secondaryText}</p>}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" title="Previous page" disabled={activePage === 1} onClick={() => onPageChange(activePage - 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft size={15} />
        </button>
        {Array.from({ length: availablePages }, (_, index) => index + 1).map((page) => (
          <button key={page} type="button" onClick={() => onPageChange(page)} className={`flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-tiny font-semibold ${page === activePage ? 'border-primary bg-primary text-white' : 'border-border bg-white text-text-muted'}`}>
            {page}
          </button>
        ))}
        <button type="button" title="Next page" disabled={activePage === availablePages} onClick={() => onPageChange(activePage + 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

export default Pagination
