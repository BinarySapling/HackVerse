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
    <div className={`w-full overflow-x-auto rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-5 py-3.5 text-[11px] font-medium text-muted/80 uppercase tracking-[0.14em]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm text-secondary">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-10 text-center text-muted">
                <div className="flex justify-center items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-10 text-center text-muted">
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
