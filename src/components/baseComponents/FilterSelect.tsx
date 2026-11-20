import type { FilterSelectProps } from '../../types'

const FilterSelect = ({ value, options, onChange }: FilterSelectProps) => {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-full rounded-md border border-border bg-white px-2 text-tiny text-text outline-none focus:border-primary"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default FilterSelect
