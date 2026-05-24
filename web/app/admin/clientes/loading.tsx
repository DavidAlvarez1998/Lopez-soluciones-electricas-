export default function Loading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-9 w-36 bg-white/10 rounded-lg animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="mb-4">
        <div className="h-10 w-80 bg-white/10 rounded-lg animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full">
          <thead className="bg-navy text-brand-gray text-xs uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3 text-left">
                <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
              </th>
              <th className="px-4 py-3 text-left hidden md:table-cell">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
              </th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </th>
              <th className="px-4 py-3 text-right">
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="bg-navy-2">
                <td className="px-4 py-3">
                  <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="h-4 w-36 bg-white/10 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="h-4 w-12 bg-white/10 rounded animate-pulse ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
