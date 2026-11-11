export default function Loading() {
  return (
    <div className="container-x py-8 md:py-12" aria-busy="true" aria-label="Loading stays">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-3 h-12 w-3/4 max-w-2xl" />
      <div className="skeleton mt-3 h-5 w-full max-w-xl" />
      <div className="skeleton mt-8 h-24 w-full rounded-2xl" />
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:ml-[312px]">
        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="card overflow-hidden">
            <div className="skeleton aspect-[4/3] w-full !rounded-none" />
            <div className="space-y-2 p-4"><div className="skeleton h-4 w-1/3" /><div className="skeleton h-6 w-3/4" /><div className="skeleton h-4 w-1/2" /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
