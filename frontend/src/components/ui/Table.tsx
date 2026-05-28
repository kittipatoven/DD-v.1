import React from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function Table<T>({ columns, data, onRowClick, emptyMessage = 'ไม่มีข้อมูล' }: TableProps<T>) {
  const safeData = data || [];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-slate-800 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 text-sm text-gray-300 ${column.className || ''}`}
                  >
                    {column.render ? column.render(row[column.key], row) : String(row[column.key] || '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
