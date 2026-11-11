export default function Loading() {
  return (
    <div className="container-x py-6 md:py-10" aria-busy="true" aria-label="Loading stay">
      <div className="skeleton h-4 w-48" />
      <div className="skeleton mt-4 h-10 w-2/3 max-w-xl" />
      <div className="skeleton mt-5 aspect-[16/9] w-full rounded-3xl md:aspect-[21/9]" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3"><div className="skeleton h-6 w-1/2" /><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-5/6" /><div className="skeleton h-4 w-2/3" /></div>
        <div className="skeleton h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}
