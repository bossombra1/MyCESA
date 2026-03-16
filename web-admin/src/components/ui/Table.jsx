import React from 'react';

export default function Table({ columns, data, onRowClick, actions }) {
  const columnWidth = `${100 / (columns.length + (actions ? 1 : 0))}%`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      <div className="overflow-y-auto max-h-96">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 text-white"
style={{ background: 'linear-gradient(to right, #2E7D32, #388E3C)' }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ width: columnWidth }}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                  style={{ width: columnWidth }}
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
                  className="border-b border-gray-200 hover:bg-primary hover:bg-opacity-5 transition-all duration-200 cursor-pointer"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                     className="px-4 py-3 text-sm"
style={{ color: '#1f2937' }}
                     
                      title={col.render ? undefined : row[col.key]}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-4 py-3 text-sm space-x-2"
                      style={{ width: columnWidth }}
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
