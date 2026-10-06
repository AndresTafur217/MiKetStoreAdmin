import { Link } from "react-router-dom";

export function ProductsExpire() {
  return (
    <div className="flex-1 border border-border-gray p-2.5 rounded-[10px] flex flex-col gap-2.5 min-h-0">
      <div className="w-full border bg-surface-alt border-border-gray rounded-xl p-1 flex flex-row justify-between items-center">
        Productos por expirar
        <Link to="/products" aria-label="Ver ventas" title="Ver ventas">
          <svg className="size-5 md:size-6 ">
            <use xlinkHref="/sprite.svg#right" />
          </svg>
        </Link>
      </div> 
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 p-4 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-emerald-50 text-emerald-700" aria-hidden="true">✓</span>
        <p className="font-semibold">Sin productos por expirar</p>
      </div>
    </div>
  )
}