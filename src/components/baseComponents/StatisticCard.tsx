import type { StatisticCardProps } from '../../types'

const StatisticCard = ({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  compact = false,
}: StatisticCardProps) => {
  const formattedValue =
    typeof value === 'number' ? new Intl.NumberFormat('en-IN').format(value) : value

  return (
    <div
     
      className={`flex min-w-0 items-center rounded-lg border border-border-soft bg-white shadow-sm ${compact ? 'gap-2 p-3' : 'gap-3 p-4'}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg ${compact ? 'h-9 w-9' : 'h-10 w-10'} ${
          tone === 'accent'
            ? 'bg-accent-soft text-accent'
            : tone === 'amber'
              ? 'bg-chart-amber-soft text-chart-amber'
              : tone === 'green'
                ? 'bg-chart-green-soft text-chart-green'
                : 'bg-primary-soft text-primary'
        }`}
      >
        <Icon size={19} strokeWidth={1.9} />
      </div>

      <div className="min-w-0">
        <p className={`m-0 font-bold leading-none tracking-tight text-text ${compact ? 'text-body' : 'text-lg'}`}>
          {formattedValue}
        </p>
        <p className={`${compact ? 'mt-1' : 'mt-1.5'} mb-0 truncate text-tiny text-text-muted`}>{label}</p>
      </div>
    </div>
  )
}

export default StatisticCard
