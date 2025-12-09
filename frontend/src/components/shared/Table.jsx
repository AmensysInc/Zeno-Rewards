function Table({ columns, data, onEdit, onDelete, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={`py-3 px-4 font-semibold whitespace-nowrap ${
                  column.align === 'right' ? 'text-right' : 
                  column.align === 'center' ? 'text-center' : 
                  'text-left'
                }`}
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-right py-3 px-4 font-semibold whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex} 
                  className={`py-3 px-4 whitespace-nowrap ${
                    column.align === 'right' ? 'text-right' : 
                    column.align === 'center' ? 'text-center' : 
                    'text-left'
                  }`}
                >
                  {column.render 
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key] !== null && row[column.key] !== undefined 
                      ? String(row[column.key]) 
                      : '-'
                  }
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row, rowIndex)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row, rowIndex)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;