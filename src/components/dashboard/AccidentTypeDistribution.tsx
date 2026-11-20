import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { AccidentTypeDistributionProps } from '../../types'

const AccidentTypeDistribution = ({
  total,
  multiVehicleCollision,
  bikeAccident,
  hitAndRun,
  pedestrianAccident,
  truckAccident,
  vehicleOverturn,
  others,
}: AccidentTypeDistributionProps) => {
  const accidentTypes = [
    {
      label: 'Multi-Vehicle Collision',
      percentage: multiVehicleCollision,
      count: Math.round((total * multiVehicleCollision) / 100),
      color: 'var(--color-chart-blue)',
      dot: 'bg-chart-blue',
    },
    {
      label: 'Bike Accident',
      percentage: bikeAccident,
      count: Math.round((total * bikeAccident) / 100),
      color: 'var(--color-chart-purple)',
      dot: 'bg-chart-purple',
    },
    {
      label: 'Hit & Run',
      percentage: hitAndRun,
      count: Math.round((total * hitAndRun) / 100),
      color: 'var(--color-chart-amber)',
      dot: 'bg-chart-amber',
    },
    {
      label: 'Pedestrian Accident',
      percentage: pedestrianAccident,
      count: Math.round((total * pedestrianAccident) / 100),
      color: 'var(--color-chart-green)',
      dot: 'bg-chart-green',
    },
    {
      label: 'Truck Accident',
      percentage: truckAccident,
      count: Math.round((total * truckAccident) / 100),
      color: 'var(--color-chart-navy)',
      dot: 'bg-chart-navy',
    },
    {
      label: 'Vehicle Overturn',
      percentage: vehicleOverturn,
      count: Math.round((total * vehicleOverturn) / 100),
      color: 'var(--color-chart-red)',
      dot: 'bg-chart-red',
    },
    {
      label: 'Others',
      percentage: others,
      count: Math.round((total * others) / 100),
      color: 'var(--color-chart-gray)',
      dot: 'bg-chart-gray',
    },
  ]

  return (
    <div className="flex h-full w-full flex-col rounded-xl border border-border-soft bg-white p-4 shadow-sm">
      <h2 className="m-0 text-body font-bold text-text">Accident Type Distribution</h2>

      <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row">
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={accidentTypes}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="56%"
                outerRadius="86%"
                activeShape={{ outerRadius: 100 }}
                stroke="none"
                isAnimationActive={true}
              >
                {accidentTypes.map(({ label, color }) => (
                  <Cell key={label} fill={color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-small)',
                }}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <strong className="text-xl text-text">
              {new Intl.NumberFormat('en-IN').format(total)}
            </strong>
            <span className="text-tiny text-text-muted">Reports</span>
          </div>
        </div>

        <ul className="m-0 w-full space-y-1.5 p-0">
          {accidentTypes.map(({ label, percentage, dot }) => (
            <li key={label} className="flex list-none items-center gap-2 text-tiny">
              <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
              <span className="flex-1 text-text-muted">{label}</span>
              <strong className="text-text">{percentage}%</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AccidentTypeDistribution
