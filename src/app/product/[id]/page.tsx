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
  specs: any;
  image: string;
  video: string;
  colors: string;
  price: string;
  carrusel: any;
  website: string;
}

export default function Detail({ params }: { params: { id: string } }) {
  const [productDetail, setProductDetail] = useState<Detail | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);

  const fetchDetail = async () => {
    try {
      const response = await fetch(`/api/detail?id=${params.id}`);
      if (response.ok) {
        const products = await response.json();
        setProductDetail(products.products[0]);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const handleImageChange = (newImage: string) => {
    setIsVideoPlaying(false);
    setCurrentImage(newImage);
  };

  if (!productDetail) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <ClipLoader
          color="blue"
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    <main className="mx-auto px-4">
      <section className="flex flex-col rounded-lg border p-2 border-neutral-800 bg-black md:p-12 lg:flex-row">
        <div className="w-full p-0 mx-0">
          <div className="h-3/4 w-3/4 basis-full lg:basis-2/4">
            <div className="h-96">
              {/* Mostrar video si está disponible y el estado isVideoPlaying es true */}
              {productDetail.video && isVideoPlaying ? (
                <video
                  width={600}
                  height={400}
                  controls
                  autoPlay
                  loop
                  preload="metadata"
                >
                  <source src={productDetail.video} type="video/mp4" />
                  Tu navegador no soporta el video.
                </video>
              ) : (
                // Mostrar imagen si no se está reproduciendo video
                <Image
                  src={currentImage ? currentImage : productDetail.image}
                  alt={productDetail.model}
                  width={400}
                  height={400}
                  className="rounded w-full my-auto"
                />
              )}
            </div>
            <div className="flex flex-row m-2 gap-2">
              {productDetail.carrusel
                ? Object.entries(productDetail.carrusel).map(([key, value]) => (
                    <div
                      className="z-10 m-2 cursor-pointer"
                      key={key}
                      onClick={() => handleImageChange(String(value))}
                    >
                      <Image
                        className={`rounded-md ${value === currentImage ? 'border-2 border-blue-500' : ''}`}
                        src={String(value)}
                        width={200}
                        height={200}
                        alt={String(key)}
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
        <div className="w-4/6 lg:basis-5/6 text-white">
          <div className="mb-2 flex flex-col text-white">
            <h1 className="mb-2 text-5xl font-medium">{productDetail.model}</h1>
            <h2>{productDetail.category}</h2>
            <div className="my-6 mr-auto w-auto rounded-full bg-blue-600 p-4 text-sm text-white">
              <p>AR$ {productDetail.price}</p>
            </div>
            <div className="flex flex-col justify-center text-xl p-2 rounded-2xl">
              <AddToCart
                buttonStyle="p-4 text-base"
                stock={40}
                productId={productDetail.id}
                showQty={false}
                product={productDetail}
                increasePerClick
                redirect={false}
              />
            </div>
          </div>
          <div>
            {productDetail.website ? (
              <a href={productDetail.website}>
                Website: {productDetail.website}
              </a>
            ) : null}
            <h1 className="text-2xl font-bold">Especificaciones:</h1>
            {productDetail.specs
              ? Object.entries(productDetail.specs).map(([key, value]) => (
                  <div key={key}>
                    <h1 className="font-bold">{key}:</h1>
                    <h1>{String(value)}</h1>
                  </div>
                ))
              : null}
          </div>
        </div>
      </section>
      <section>
        <div className="flex flex-col rounded-lg border p-8 border-neutral-800 bg-black md:p-12 text-white lg:gap-8">
          <p>Ratings</p>
          <ReviewsList productId={productDetail.id} />
        </div>
      </section>
    </main>
  );
}
