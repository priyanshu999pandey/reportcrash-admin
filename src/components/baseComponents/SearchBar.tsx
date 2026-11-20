import { Search } from 'lucide-react'
import type { SearchBarProps } from '../../types'

const SearchBar = ({
  value,
  placeholder = 'Search...',
  onChange,
}: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search
        size={15}
        className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-md border border-border bg-white pr-3 pl-9 text-tiny text-text outline-none placeholder:text-text-muted focus:border-primary"
      />
    </div>
  )
}

export default SearchBar
