import React from 'react';

export default function Table({ columns, data, onRowClick, actions }) {
  const columnWidth = `${100 / (columns.length + (actions ? 1 : 0))}%`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto overflow-y-auto max-h-96">
        <table className="w-full border-collapse min-w-max">
          <thead className="sticky top-0 z-10 text-white"
            style={{ background: 'linear-gradient(to right, #2E7D32, #388E3C)' }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap"
                  style={{ width: columnWidth, minWidth: '100px' }}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th
                  className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap sticky right-0 z-10"
                  style={{ background: '#2E7D32', minWidth: '140px' }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  Aucune donnée
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-primary hover:bg-opacity-5 transition-all duration-200"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2 text-xs"
                      style={{ color: '#1f2937' }}
                      title={col.render ? undefined : row[col.key]}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-3 py-2 text-xs space-x-1 sticky right-0 z-10"
                      style={{ background: '#FAFAFA' }}
                    >
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
