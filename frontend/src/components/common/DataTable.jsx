// Lightweight table shell used across admin list pages
const DataTable = ({ columns, children }) => (
  <div className="card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-paper/60">
            {columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  </div>
);

export default DataTable;
