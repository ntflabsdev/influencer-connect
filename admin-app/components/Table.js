export default function Table({ columns, data, empty }) {
  if (!data?.length) return <p className="text-slate-600">{empty || 'No data.'}</p>;
  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={row._id || row.key}>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 text-sm">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}




