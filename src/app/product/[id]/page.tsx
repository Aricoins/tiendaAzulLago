'use client'
import { useEffect, useState } from "react";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import { AddToCart } from "@/components/AddToCart";
import MediaGallery from "@/components/siteEmails/MediaGallery";
import { Products } from "@/app/lib/definitions";

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
}

export default function Detail({ params }: { params: { id: string } }) {
  const [productDetail, setProductDetail] = useState<Detail | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [video, setVideo] = useState<boolean>(true);
  function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  function formatKey(key: string) {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
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
  const media: MediaItem[] = [];

  if (productDetail.video) {
    media.push({
      type: 'video',
      url: productDetail.video,
      thumbnail: productDetail.image, // Usar la imagen principal como miniatura para el video
    });
  }
  
  media.push({
    type: 'image',
    url: productDetail.image,
  });
  
  if (productDetail.carrusel) {
    Object.values(productDetail.carrusel).forEach((url) => {
      media.push({
        type: 'image',
        url: typeof url === 'string' ? url : String(url),
      });
    });
  }

  return (
    <main className="container mx-auto p-4">
      <section className="flex flex-col gap-2 rounded-lg border border-white border-4 bg-gray-rgb(144,144, 144) p-6 md:flex-row">
        {/* Image and Video Section */}
        <div className="flex flex-col items-center md:w-1/2">
        <MediaGallery media={media} />


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
                    className=" m-10 h-16 w-16 rounded-md object-cover"
                  />
                </button>
              ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col gap-4 text-white md:w-1/2">
          <h1 className="text-3xl font-bold md:text-4xl">{productDetail.model}</h1>
          <h2 className="text-lg font-medium ">{productDetail.category}</h2>

          <div className="rounded-lg bg-blue-600 px-4 py-2 text-xl font-semibold text-center">
            AR$ {productDetail.price}
          </div>
      
            

          {/* Specifications */}
          <div>
            <h3 className="mt-6 text-2xl font-bold">Características:</h3>
            <ul className="mt-2 space-y-2 break-words">
  {productDetail.specs &&
    Object.entries(productDetail.specs).map(([key, value]) => (
      <li
        key={key}
        className="flex flex-col md:flex-row md:items-start md:gap-2"
      >
        <span className="font-bold  bg-blue-600 text-gray-100">{formatKey(key)}:</span>
        <span className="md:whitespace-normal break-words">
          {String(value).toLowerCase()}
        </span>
      </li>
    ))}
</ul>

<AddToCart
  buttonStyle="px-6 py-2 mt-4 text-base border border-white rounded-full"
  stock={40}
  productId={productDetail.id}
  showQty={false}
  product={{
    id: productDetail.id,
    model: productDetail.model,
    category: productDetail.category,
    specs: productDetail.specs,
    image: productDetail.image,
    colors: productDetail.colors ? [productDetail.colors] : [],
    price: parseFloat(productDetail.price),
    carrusel: productDetail.carrusel,
    video: productDetail.video,
    website: productDetail.website,
  } as Products}
  increasePerClick={true}
  redirect={false}
/>


          </div>
        </div>
      </section>
    </main>
  );
}