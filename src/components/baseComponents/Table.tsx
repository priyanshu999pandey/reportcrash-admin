import type { TableProps } from '../../types'

const Table = ({ columns, rows }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-left text-tiny">
        <thead className="bg-primary-faint text-text">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-border-faint last:border-b-0 hover:bg-primary-page"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-3 py-2 whitespace-nowrap text-text-muted"
                  >
                    {row.cells[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-10 text-center text-text-muted"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
