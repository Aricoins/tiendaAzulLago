import { sql } from '@vercel/postgres';
import { Products } from '../lib/definitions';
import Image from 'next/image';
import Link from 'next/link';
import OrderButtons from '@/components/orderButtons';
import { AddToCart } from '@/components/AddToCart';
import FilterbyPriceRange from '@/components/filterPriceRange';
import AverageRatingStars from '@/components/RatingReview/AverageRating';
import { Suspense } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

export const fetchCache = 'force-no-store';

interface SearchParams {
  model: string;
  category?: string;
  ordByPrice: string;
  minPrice: string;
  maxPrice: string;
}

async function fetchData(searchParams: SearchParams) {
  let data;
  let query = 'SELECT * FROM products WHERE disable = false';
  const values: any[] = [];

  if (searchParams.category) {
    // Agregar variación con y sin "s" en la categoría
    query += ' AND (category = $1 OR category = $2)';
    values.push(searchParams.category, searchParams.category.replace(/s$/, ''));
  }

  // Apply price range filter if provided
  if (searchParams.minPrice && searchParams.maxPrice) {
    query += ' AND price BETWEEN $3 AND $4';
    values.push(parseInt(searchParams.minPrice), parseInt(searchParams.maxPrice));
  }

  query += ' ORDER BY price';
  
  try {
    data = await sql.query(query, values);
    return data.rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Product({ searchParams }: { searchParams: SearchParams }) {
  const data = await fetchData(searchParams);

  return (
    <main className="flex flex-wrap flex-col content-center items-start mx-5 my-[10%]">
      <Suspense fallback={
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
          <ClipLoader color="blue" size={150} aria-label="Loading Spinner" data-testid="loader" />
        </div>
      }>
        <div className='w-full inline-flex justify-between'>
          {searchParams.category &&
            <div className='gap-2 flex flex-row h-12 items-center border-gray-400 border bg-transparent rounded-md'>
              <h2 className='text-gray-400'>Categoría: {searchParams.category}</h2>
              <Link href='/product'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="red" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          }
          <FilterbyPriceRange />
          <OrderButtons />
        </div>

        <div className="flex flex-wrap justify-center my-8">
          {data.length ? data.map((product: Products) => (
            <div key={product.id} 
              className="flex flex-col h-96 w-72 cursor-pointer items-center border-solid border-x border-y border-gray-300 rounded m-2 hover:border-blue-600 bg-white justify-center">
              <Link href={`/product/${product.id}`}>
                {/* <div className="flex justify-center mt-2 self-start">
                  <AverageRatingStars productId={product.id} />
                </div> */}
                <div>
                  <Image 
                    className="hover:w-52 my-5 mx-auto rounded-lg"
                    src={product.image}
                    width={200}
                    height={200}
                    alt={product.model}
                  />
                </div>
                <div className="flex bg-white text-center justify-center mb-4 border-solid border-2 border-gray rounded-2xl w-11/12 mx-5 my-2 p-2 text-xs font-bold items-center">
                  <p className='text-black'>{product.model}</p>
                  <p className="bg-blue-600 mx-2 p-1 rounded-2xl text-white">${product.price} AR$</p>
                </div>
              </Link>
              <AddToCart 
                buttonStyle="p-2 text-sm w-36"
                stock={0}
                productId={product.id}
                showQty={false}
                product={product}
                increasePerClick={true}
                redirect={false} 
              />
            </div>
          ))
          : <Link href='/product'><h1>No products found!</h1></Link>}
        </div>
      </Suspense>
    </main>
  );
}
