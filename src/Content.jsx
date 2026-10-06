import { Info } from "./info";
import { Products } from "./Products";
import { ProductsBestSellers } from "./ProductsBestSellers";
import { ProductsExpire } from "./ProductsExpire";

export function Content() {
  document.addEventListener('DOMContentLoaded', function () {
    const marquee = document.querySelector('.marquee');
    if (marquee) {
      const containerWidth = marquee.parentElement.offsetWidth;
      const contentWidth = marquee.scrollWidth;
      const totalDistance = containerWidth + contentWidth;

      // Velocidad en píxeles por segundo
      const speed = 100;
      const duration = totalDistance / speed;

      marquee.style.animationDuration = duration + 's';
    }
  });
  return (
    <div className="w-full h-full flex flex-col gap-5 overflow-y-auto custom-scroll lg:overflow-none">
      <section className="w-full h-20 p-2.5 overflow-hidden border shadow-md bg-surface-alt border-border-gray rounded-3xl flex flex-row items-center">
        <article className="rounded-1xl size-[56px] flex justify-center items-center shadow-md bg-accent">
          <svg className="size-7">
            <use xlinkHref="/sprite.svg#house" />
          </svg>
        </article>
        <span className="flex-1 px-2 font-bold transition-all duration-300">Inicio</span>
      </section>
      <div className="lg:h-full p-5 border border-border-gray rounded-3xl flex flex-col gap-5">
        <Info compact />
        <div className="lg:flex-1 flex flex-col lg:flex-row gap-5">
          <ProductsBestSellers />
          <ProductsExpire />
        </div>
      </div>
    </div>
  )
}