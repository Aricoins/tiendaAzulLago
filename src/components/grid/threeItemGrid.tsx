import { fetchProduct } from "@/app/lib/data";
import { GridTileImage } from "./tile";
import Link from "next/link";
import { Products } from "@/app/lib/definitions";

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Products;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}>
      <Link
        className="relative block aspect-square h-full w-full group overflow-hidden"
        href={`/product/${item.id}`}
      >
        {item.video ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={item.video} type="video/mp4" />
          </video>
        ) : (
          <GridTileImage
            src={item.image}
            fill
            className="object-cover"
            sizes={
              size === 'full'
                ? '(min-width: 900px) 66vw, 100vw'
                : '(min-width: 900px) 33vw, 100vw'
            }
            priority={priority}
            alt={item.model}
          />
        )}

        <div
          className={`
            absolute inset-x-0 bottom-0 bg-black/60 p-2
            text-white transition-opacity duration-300 group-hover:opacity-90
            ${size === 'full' ? 'md:text-center' : ''}
          `}
        >
          <h3 className="text-lg font-medium">{item.model}</h3>
          <p className="text-sm">${item.price}</p>
        </div>
      </Link>
    </div>
  )
}

// Resto del código se mantiene igual...

function shuffleArray(array: any) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function ThreeItemGrid() {
    // Collections that start with `hidden-*` are hidden from the search page.
    const homepageItems = await fetchProduct();
  
    if (homepageItems?.length === 0) return null;
    const shuffledItems = shuffleArray(homepageItems);
    const [firstProduct, secondProduct, thirdProduct] = shuffledItems.slice(0, 4);
  
    // const [firstProduct, secondProduct, thirdProduct] = homepageItems;
    if(homepageItems){
    // const firstProduct = homepageItems[8]
    // const secondProduct = homepageItems[1]
    // const thirdProduct = homepageItems[16]
    return (
      <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 ">
        
        <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
        <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
        <ThreeItemGridItem size="half" item={thirdProduct} />
      </section>
    );}
  }