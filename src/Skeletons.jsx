import { useState } from "react";

const Block = ({ className = "" }) => (
  <span aria-hidden="true" className={`skeleton-shimmer block ${className}`} />
);

export function SkeletonImage({ src, alt, className = "", imageClassName = "object-contain" }) {
  const [status, setStatus] = useState("loading");

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {status === "loading" && <span aria-hidden="true" className="skeleton-shimmer absolute inset-0" />}
      {status === "error" ? (
        <span role="img" aria-label={alt || "Imagen no disponible"} className="flex h-full w-full items-center justify-center bg-gray-200 px-2 text-center text-sm text-gray-500">
          Imagen no disponible
        </span>
      ) : (
        <img
          src={src}
          alt={alt || ""}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`h-full w-full transition-opacity duration-300 ${imageClassName} ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <article aria-hidden="true" className="size-product rounded-4xl p-2.5 shadow-lg">
      <Block className="h-2/3 w-full rounded-t-3xl" />
      <div className="mt-1.5 flex h-1/3 flex-col gap-2 rounded-b-3xl p-2">
        <Block className="h-4 w-3/4 rounded" />
        <div className="flex flex-1 items-end justify-between gap-2">
          <div className="flex w-2/3 flex-col gap-2">
            <Block className="h-3 w-full rounded" />
            <Block className="h-3 w-4/5 rounded" />
          </div>
          <Block className="h-10 w-1/3 rounded-2xl" />
        </div>
      </div>
    </article>
  );
}

function ProductGrid({ count = 8 }) {
  return (
    <div aria-hidden="true" className="flex w-full flex-row flex-wrap items-center justify-center gap-2.5">
      {Array.from({ length: count }, (_, index) => <ProductCardSkeleton key={index} />)}
    </div>
  );
}

function CategoryGrid({ compact = false }) {
  const cards = Array.from({ length: compact ? 5 : 8 }, (_, index) => (
    <article key={index} aria-hidden="true" className={`flex min-h-32 flex-col justify-between rounded-1xl border border-gray-300 bg-white/70 p-4 ${compact ? "min-h-24 w-52" : ""}`}>
      <Block className="h-4 w-2/3 rounded" />
      <Block className="mt-2 h-3 w-full rounded" />
      <Block className="mt-3 h-3 w-1/3 rounded" />
    </article>
  ));

  return compact ? (
    <div aria-hidden="true" className="flex min-w-max gap-3 pb-2">{cards}</div>
  ) : (
    <div aria-hidden="true" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards}</div>
  );
}

function PageHeaderSkeleton({ titleWidth = "w-32" }) {
  return (
    <section aria-hidden="true" className="mb-5 flex h-20 w-full items-center gap-3 rounded-3xl border border-border-gray bg-surface-alt p-2.5 shadow-md">
      <Block className="size-14 shrink-0 rounded-1xl" />
      <Block className={`h-5 ${titleWidth} rounded`} />
    </section>
  );
}

function ToolbarSkeleton() {
  return (
    <div aria-hidden="true" className="mb-4 flex w-full flex-wrap items-center gap-2.5">
      <Block className="h-10 w-48 rounded-xl" />
      <Block className="h-10 w-32 rounded-xl" />
      <Block className="h-10 w-28 rounded-xl" />
      <Block className="ml-auto h-10 w-36 rounded-xl" />
    </div>
  );
}

function TabsSkeleton({ count = 4 }) {
  return (
    <div aria-hidden="true" className="mb-4 flex flex-wrap gap-2">
      {Array.from({ length: count }, (_, index) => (
        <Block key={index} className="h-9 w-24 rounded-xl" />
      ))}
    </div>
  );
}

function TableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-2xl border border-gray-300">
      <div className="grid gap-3 border-b border-gray-200 bg-slate-100 px-3 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, index) => <Block key={index} className="h-3 w-full rounded" />)}
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="grid gap-3 px-3 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, colIndex) => <Block key={colIndex} className="h-4 w-full rounded" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsRowSkeleton({ count = 4 }) {
  return (
    <div aria-hidden="true" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-gray-300 bg-white p-4">
          <Block className="h-3 w-24 rounded" />
          <Block className="mt-3 h-7 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex h-max w-full flex-col gap-5">
      <PageHeaderSkeleton titleWidth="w-24" />
      <div className="flex flex-col gap-5 rounded-3xl border border-border-gray p-5">
        <StatsRowSkeleton count={4} />
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex-1 space-y-3 rounded-2xl border border-gray-200 p-4">
            <Block className="h-5 w-40 rounded" />
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Block className="size-12 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Block className="h-4 w-3/4 rounded" />
                  <Block className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-3 rounded-2xl border border-gray-200 p-4">
            <Block className="h-5 w-44 rounded" />
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Block className="size-12 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Block className="h-4 w-2/3 rounded" />
                  <Block className="h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogSkeleton({ favorites = false }) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeaderSkeleton titleWidth="w-36" />
      <div aria-hidden="true" className="flex w-full flex-wrap items-center gap-2.5 p-2.5">
        <Block className="h-9 w-24 rounded-xl" />
        <Block className="h-9 w-32 rounded-xl" />
        <Block className="h-9 w-28 rounded-xl" />
        <Block className="ml-auto h-4 w-32 rounded" />
      </div>
      {favorites && <Block className="h-10 w-full rounded-lg" />}
      <ProductGrid />
    </div>
  );
}

function CartSkeleton() {
  return (
    <section aria-hidden="true" className="mx-auto w-full max-w-5xl">
      <PageHeaderSkeleton titleWidth="w-28" />
      <div className="mb-6 flex items-end justify-between border-b border-gray-300 pb-4">
        <div className="flex flex-col gap-2">
          <Block className="h-7 w-52 rounded" />
          <Block className="h-4 w-32 rounded" />
        </div>
        <Block className="h-4 w-28 rounded" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_19rem]">
        <div className="divide-y divide-gray-300 border-y border-gray-300">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="grid grid-cols-[5rem_1fr] gap-4 py-4 sm:grid-cols-[7rem_1fr_auto]">
              <Block className="aspect-square w-full" />
              <div className="flex flex-col justify-center gap-2">
                <Block className="h-4 w-3/4 rounded" />
                <Block className="h-3 w-full rounded" />
                <Block className="h-3 w-1/2 rounded" />
              </div>
              <Block className="col-span-2 h-8 w-full self-center rounded sm:col-span-1 sm:w-24" />
            </div>
          ))}
        </div>
        <div className="h-56 border-y border-gray-300 py-4">
          <Block className="h-5 w-28 rounded" />
          <Block className="mt-6 h-4 w-full rounded" />
          <Block className="mt-4 h-4 w-2/3 rounded" />
          <Block className="mt-8 h-11 w-full rounded" />
        </div>
      </div>
    </section>
  );
}

function ListSkeleton({ profile = false }) {
  return (
    <section aria-hidden="true" className={`mx-auto w-full ${profile ? "max-w-3xl py-6" : "max-w-5xl"}`}>
      <PageHeaderSkeleton titleWidth={profile ? "w-24" : "w-36"} />
      <Block className="mb-6 h-7 w-56 rounded" />
      {profile ? (
        <>
          <div className="flex flex-col gap-3 border-b border-gray-300 pb-5">
            <Block className="h-4 w-20 rounded" />
            <Block className="h-7 w-56 rounded" />
            <Block className="h-4 w-48 rounded" />
          </div>
          <div className="grid gap-4 border-b border-gray-300 py-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => <Block key={index} className="h-12 w-full rounded" />)}
          </div>
        </>
      ) : (
        <div className="divide-y divide-gray-300 border-y border-gray-300">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div className="flex flex-col gap-2">
                <Block className="h-4 w-36 rounded" />
                <Block className="h-3 w-48 rounded" />
              </div>
              <Block className="h-8 w-28 rounded" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SalesSkeleton() {
  return (
    <div className="w-full space-y-4">
      <PageHeaderSkeleton titleWidth="w-28" />
      <ToolbarSkeleton />
      <StatsRowSkeleton count={3} />
      <TableSkeleton columns={6} rows={7} />
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="w-full space-y-4">
      <PageHeaderSkeleton titleWidth="w-32" />
      <TabsSkeleton count={3} />
      <ToolbarSkeleton />
      <TableSkeleton columns={5} rows={6} />
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="w-full space-y-4">
      <PageHeaderSkeleton titleWidth="w-36" />
      <TabsSkeleton count={6} />
      <StatsRowSkeleton count={4} />
      <TableSkeleton columns={6} rows={8} />
    </div>
  );
}

function PosSkeleton() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4 rounded-2xl border border-gray-300 p-4">
        <div className="flex flex-wrap gap-2">
          <Block className="h-11 flex-1 rounded-xl" />
          <Block className="h-11 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-xl border border-gray-200 p-3">
              <Block className="mb-2 aspect-square w-full rounded-lg" />
              <Block className="h-4 w-full rounded" />
              <Block className="mt-2 h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-gray-300 p-4">
        <Block className="h-6 w-40 rounded" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <Block className="h-4 w-2/3 rounded" />
            <Block className="h-8 w-20 rounded" />
          </div>
        ))}
        <Block className="mt-6 h-12 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, index) => <Block key={index} className="h-12 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="w-full space-y-4">
      <PageHeaderSkeleton titleWidth="w-40" />
      <ToolbarSkeleton />
      <CategoryGrid />
    </div>
  );
}

export function PageSkeleton({ variant = "products" }) {
  let content;

  switch (variant) {
    case "home":
      content = <HomeSkeleton />;
      break;
    case "categories":
      content = <CategoriesSkeleton />;
      break;
    case "favorites":
      content = <CatalogSkeleton favorites />;
      break;
    case "cart":
      content = <CartSkeleton />;
      break;
    case "orders":
      content = <ListSkeleton />;
      break;
    case "profile":
      content = <ListSkeleton profile />;
      break;
    case "sales":
      content = <SalesSkeleton />;
      break;
    case "users":
      content = <UsersSkeleton />;
      break;
    case "inventory":
      content = <InventorySkeleton />;
      break;
    case "pos":
      content = <PosSkeleton />;
      break;
    default:
      content = <CatalogSkeleton />;
  }

  return <div role="status" aria-label="Cargando contenido" aria-busy="true">{content}</div>;
}
