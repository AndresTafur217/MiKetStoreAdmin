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

function HomeSkeleton() {
  return (
    <div className="flex h-max w-full flex-col items-center gap-7.5">
      <section aria-hidden="true" className="h-90 w-full overflow-hidden p-5">
        <Block className="h-full w-full rounded-4xl" />
      </section>
      <section className="w-full p-2.5"><CategoryGrid compact /></section>
      <section className="w-full space-y-4">
        <Block className="h-6 w-48 rounded" />
        <ProductGrid count={4} />
      </section>
    </div>
  );
}

function CatalogSkeleton({ favorites = false }) {
  return (
    <div className="flex flex-col gap-4">
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

export function PageSkeleton({ variant = "products" }) {
  let content;

  switch (variant) {
    case "home":
      content = <HomeSkeleton />;
      break;
    case "categories":
      content = <div className="w-full"><Block className="mb-5 h-8 w-44 rounded" /><CategoryGrid /></div>;
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
    default:
      content = <CatalogSkeleton />;
  }

  return <div role="status" aria-label="Cargando contenido" aria-busy="true">{content}</div>;
}