import { useId, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  AccidentReportsTrendProps,
  TrendPeriod,
} from '../../types'

const AccidentReportsTrend = ({
  thirtyDaysData,
  fortyFiveDaysData,
  sixtyDaysData,
}: AccidentReportsTrendProps) => {
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>(30)
  const gradientId = `trend-area-${useId().replace(/:/g, '')}`

  const trendData = [
    ...{
      30: thirtyDaysData,
      45: fortyFiveDaysData,
      60: sixtyDaysData,
    }[trendPeriod],
  ]
  const highestReportCount = Math.max(
    1,
    ...trendData.map((point) => point.reports),
  )
  const yAxisMaximum = Math.max(5, Math.ceil(highestReportCount / 5) * 5)

  return (
    <div className="min-w-0 rounded-xl border border-border-soft bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-body font-bold text-text">Accident Reports Trend</h2>
        <select
          value={trendPeriod}
          onChange={(event) =>
            setTrendPeriod(Number(event.target.value) as TrendPeriod)
          }
          className="h-8 rounded-md border border-border bg-white px-2 text-tiny font-medium text-text outline-none focus:border-primary"
        >
          <option value={30}>Last 30 Days</option>
          <option value={45}>Last 45 Days</option>
          <option value={60}>Last 60 Days</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto overscroll-x-contain pb-2 md:overflow-x-visible md:pb-0">
        <div className="h-60 w-[42rem] md:w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.65} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 'var(--text-tiny)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, yAxisMaximum]}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 'var(--text-tiny)' }}
            />
            <Tooltip
              contentStyle={{
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
                fontSize: 'var(--text-small)',
              }}
              cursor={{ stroke: 'var(--color-accent)', strokeOpacity: 0.25 }}
            />
            <Area
              type="monotone"
              dataKey="reports"
              name="Reports"
              stroke="var(--color-accent)"
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={{ r: 2.5, fill: 'var(--color-accent)', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'var(--color-accent)', stroke: 'var(--color-white)' }}
              isAnimationActive={true}
            />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AccidentReportsTrend
