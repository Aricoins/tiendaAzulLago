'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import { AddToCart } from "@/components/AddToCart";

interface Detail {
  id: string;
  model: string;
  category: string;
  specs: Record<string, any>;
  image: string;
  colors: string;
  price: string;
  carrusel: Record<string, string>;
  video: string;
  website: string;
  product: Record<string, unknown>;
}

export default function Detail({ params }: { params: { id: string } }) {
  const [productDetail, setProductDetail] = useState<Detail | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [video, setVideo] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/detail?id=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProductDetail(data.products[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };
    fetchDetail();
  }, [params.id]);

  const handleImageChange = (newImage: string) => {
    setVideo(false);
    setCurrentImage(newImage);
  };

  if (!productDetail) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ClipLoader color="blue" size={150} aria-label="Loading Spinner" />
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4">
      <section className="flex flex-col gap-6 rounded-lg border border-gray-800 bg-gray-900 p-6 md:flex-row">
        {/* Image and Video Section */}
        <div className="flex flex-col items-center md:w-1/2">
          <div className="h-[24rem] w-full">
            {productDetail.video && video ? (
              <video
                className="h-full w-full rounded-md object-cover"
                controls
                autoPlay
              >
                <source src={productDetail.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src={currentImage || productDetail.image}
                alt={productDetail.model}
                width={600}
                height={400}
                className="h-full w-full rounded-md object-cover"
              />
            )}
          </div>

          {/* Image Carousel */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {productDetail.carrusel &&
              Object.entries(productDetail.carrusel).map(([key, value]) => (
                <button
                  key={key}
                  className={`rounded-md p-1 border ${
                    value === currentImage ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => handleImageChange(value)}
                >
                  <Image
                    src={value}
                    alt={key}
                    width={60}
                    height={60}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                </button>
              ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col gap-4 text-white md:w-1/2">
          <h1 className="text-3xl font-bold md:text-4xl">{productDetail.model}</h1>
          <h2 className="text-lg font-medium text-gray-400">{productDetail.category}</h2>

          <div className="rounded-lg bg-blue-600 px-4 py-2 text-xl font-semibold text-center">
            AR$ {productDetail.price}
          </div>

          <AddToCart
            buttonStyle="px-6 py-2 mt-4 text-base"
            stock={40}
            productId={productDetail.id}
            showQty={false}
            product= {productDetail.product}
            increasePerClick={true}
            redirect={false}
          />

          {productDetail.website && (
            <a
              href={productDetail.website}
              className="mt-4 text-blue-400 hover:underline"
            >
              Visit Website
            </a>
          )}

          {/* Specifications */}
          <div>
            <h3 className="mt-6 text-2xl font-bold">Características:</h3>
            <ul className="mt-2 space-y-2">
              {productDetail.specs &&
                Object.entries(productDetail.specs).map(([key, value]) => (
                  <li key={key} className="flex gap-2">
                    <span className="font-semibold text-gray-300">{key}:</span>
                    <span>{String(value)}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}