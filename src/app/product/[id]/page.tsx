'use client';
import { useEffect, useState } from "react";
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import { AddToCart } from "@/components/AddToCart";
import ReviewsList from "@/components/RatingReview/Rating";

interface Detail {
  [key: string]: unknown;  
  id: string;
  model: string;
  category: string;
  specs: Record<string, string>;
  image: string;
  video: string;
  colors: string;
  price: string;
  carrusel: any;
  website: string;
  cartItemId: string;
}

export default function Detail({ params }: { params: { id: string } }) {
  const [productDetail, setProductDetail] = useState<Detail | null>(null);
  const [currentMedia, setCurrentMedia] = useState<string>('');
  const [isVideo, setIsVideo] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/detail?id=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const product = data.products[0];
          setProductDetail(product);
          setCurrentMedia(product.video || product.image);
          setIsVideo(!!product.video);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchDetail();
  }, [params.id]);

  const handleMediaChange = (newMedia: string, isVideo: boolean) => {
    setCurrentMedia(newMedia);
    setIsVideo(isVideo);
  };

  if (!productDetail) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color="blue" size={150} aria-label="Loading Spinner" data-testid="loader" />
      </div>
    );
  }

  return (
    <main className="mx-auto px-4">
      <section className="flex flex-col rounded-lg border p-2 border-neutral-800 bg-black md:p-12 lg:flex-row">
        <div className="w-full p-0 mx-0 lg:w-1/2">
          <div className="h-96">
            {/* Render Video or Image based on the `isVideo` state */}
            {isVideo ? (
              <video width={600} height={600} autoPlay controls className="w-full h-full">
                <source src={currentMedia} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image src={currentMedia} alt={productDetail.model} width={400} height={400} className="rounded w-full h-full object-cover p-10" />
            )}
          </div>
          <div className="flex flex-wrap justify-center m-2 gap-2">
            {/* Render carousel of images/videos */}
            {productDetail.carrusel &&
              Object.entries(productDetail.carrusel).map(([key, value]) => (
                <div key={key} className="cursor-pointer" onClick={() => handleMediaChange(value as string, (value as string).includes('.mp4'))}>
                  {(value as string).includes('.mp4') ? (
                    <video width={100} height={100} className="rounded border border-gray-600">
                      <source src={value as string} type="video/mp4" />
                    </video>
                  ) : (
                    <Image src={value as string} alt={`Thumbnail ${key}`} width={100} height={100} className="rounded border border-gray-600" />
                  )}
                </div>
              ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 text-white">
          <div className="mb-2">
            <h1 className="text-5xl font-medium">{productDetail.model}</h1>
            <h2 className="text-xl mb-4">{productDetail.category}</h2>
            <div className="w-auto rounded-full bg-blue-600 p-4 text-lg mb-4 text-center">
              <p>AR$ {productDetail.price}</p>
            </div>
            <AddToCart
              buttonStyle="p-4 text-base"
              stock={40}
              productId={productDetail.id}
              showQty={false}
              product={productDetail}
              increasePerClick={true}
              redirect={false}
            />
          </div>
          {productDetail.website && (
            <a href={productDetail.website} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">
              Website: {productDetail.website}
            </a>
          )}
          <h1 className="text-2xl font-bold mt-4">Especificaciones:</h1>
          <div className="mt-2 space-y-2">
            {productDetail.specs &&
              Object.entries(productDetail.specs).map(([key, value]) => (
                <div key={key}>
                  <h1 className="font-bold">{key}:</h1>
                  <p>{value}</p>
                </div>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
