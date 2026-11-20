import { CalendarDays, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, type SubmitEventHandler } from 'react'
import type { DateRange, DateRangePickerProps } from '../../types'
import Button from './Button'

const toInputDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getYesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return toInputDate(yesterday)
}

const createDefaultRange = (): DateRange => {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() - 1)

  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 30)

  return {
    startDate: toInputDate(startDate),
    endDate: toInputDate(endDate),
  }
}

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const DateRangePicker = ({ onChange }: DateRangePickerProps) => {
  const [selectedRange, setSelectedRange] =
    useState<DateRange>(createDefaultRange)
  const [draftRange, setDraftRange] = useState<DateRange>(createDefaultRange)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const maximumDate = getYesterday()

  useEffect(() => {
    const closePicker = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', closePicker)
    return () => document.removeEventListener('mousedown', closePicker)
  }, [])

  const handleApply: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    if (!draftRange.startDate || !draftRange.endDate) return

    setSelectedRange(draftRange)
    onChange?.(draftRange)
    setIsOpen(false)
  }

  const handleToggle = () => {
    if (!isOpen) {
      setDraftRange(selectedRange)
    }
    setIsOpen((open) => !open)
  }

  return (
    <div ref={pickerRef} className="relative w-54 max-w-full">
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-8 w-full items-center justify-between gap-1.5 rounded-md border border-border bg-white px-2.5 text-tiny font-medium whitespace-nowrap text-text transition-colors hover:border-primary"
      >
        <CalendarDays size={10} className="shrink-0 text-primary" />
        <span>
          {formatDate(selectedRange.startDate)} - {formatDate(selectedRange.endDate)}
        </span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <form
          onSubmit={handleApply}
          className="absolute top-full left-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-72 rounded-xl border border-border bg-white p-3 shadow-lg sm:right-0 sm:left-auto sm:w-72"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-tiny font-medium text-text-muted">
              From
              <input
                type="date"
                value={draftRange.startDate}
                max={draftRange.endDate || maximumDate}
                onChange={(event) =>
                  setDraftRange((range) => ({
                    ...range,
                    startDate: event.target.value,
                  }))
                }
                className="mt-1 h-8 w-full rounded-md border border-border bg-white px-2 text-tiny text-text outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="text-tiny font-medium text-text-muted">
              To
              <input
                type="date"
                value={draftRange.endDate}
                min={draftRange.startDate}
                max={maximumDate}
                onChange={(event) =>
                  setDraftRange((range) => ({
                    ...range,
                    endDate: event.target.value,
                  }))
                }
                className="mt-1 h-8 w-full rounded-md border border-border bg-white px-2 text-tiny text-text outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-3  flex justify-end gap-2">
            <Button
              type="button"
              size="tiny"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="tiny" variant="blue">
              Apply
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default DateRangePicker
