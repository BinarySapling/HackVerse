import React from 'react';

const Table = ({
  headers = [],
  data = [],
  renderRow,
  isLoading = false,
  emptyState,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto border border-border rounded-lg bg-white shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-hoverSurface border-b border-border text-xs font-medium text-secondary uppercase tracking-wider">
            {headers.map((header, idx) => (
              <th key={idx} className="px-5 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-border">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-8 text-center text-slate-400">
                <div className="flex justify-center items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-8 text-center text-slate-400">
                {emptyState || 'No records found.'}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => renderRow(row, idx))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
