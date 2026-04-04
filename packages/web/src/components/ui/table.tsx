import { type CSSProperties, type ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  width?: string | number;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const headerCellStyle: CSSProperties = {
    padding: '10px 16px',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#64748B',
    textAlign: 'left',
    borderBottom: '1px solid #E2E8F0',
    background: '#F8FAFC',
  };

  const cellStyle: CSSProperties = {
    padding: '12px 16px',
    fontSize: 13,
    color: '#334155',
    borderBottom: '1px solid #F1F5F9',
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ ...headerCellStyle, width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  ...cellStyle,
                  textAlign: 'center',
                  padding: '40px 16px',
                  color: '#94A3B8',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.background = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={cellStyle}>
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? '')}
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
