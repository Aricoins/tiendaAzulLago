"use client";

import { Suspense, useEffect, useState } from "react";
import CartSideBar from "./CartSideBar";
import Navbar from "./layout/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading } from "@/redux/slices/cartSlice";
import { usePathname } from "next/navigation";
import { RootState } from "@/redux/store";
import ClipLoader from "react-spinners/ClipLoader";
import Aos from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import Foot from "@/components/Foot";
import { FaPlaneDeparture } from "react-icons/fa";
import { PiPlantBold } from "react-icons/pi";
export default function App({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    dispatch(hideLoading());
  }, [dispatch]);

  useEffect(() => {
    Aos.init();
  }, []);

  const { cartItems, loading } = useSelector((state: RootState) => state.cart);

  const handleHover = (text: string) => setHovered(text);
  const handleHoverEnd = () => setHovered(null);

  const isExcludedPath = [
    "/signup",
    "/signin",
    "/banned",
    "/verified",
  ].includes(pathname);
  const isCartVisiblePath =
    (cartItems.length > 0 &&
      ["/", "/payment", "/shipping"].includes(pathname)) ||
    pathname.includes("/product");

  return (
    <>
      <div
        className={`relative ${
          loading ? "" : isCartVisiblePath ? "lg:mx-0" : ""
        }`}
      >
        {!isExcludedPath && <Navbar />}

        <div className="relative w-full mt-20 h-screen overflow-hidden">
          <video
            src="/img/video.mp4"
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              maskImage:
                "linear-gradient(to bottom, #d6c2c2 90%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-0">
            <h1
              className="text-6xl lg:text-9xl text-white font-Inter text-center tracking-wide transition-transform duration-500 ease-in-out transform hover:scale-110 bg-opacity-60 p-2 rounded-md"
              style={{ textShadow: "3px 3px 6px rgba(0, 0, 0, 0.9)" }}
              onMouseEnter={() => handleHover("Azul Lago")}
              onMouseLeave={handleHoverEnd}
              data-aos="fade-left"
            >
              Azul Lago
            </h1>
            <p
              className="text-xl lg:text-3xl my-4 text-center rounded-3xl shadow-lg p-5 bg-black bg-opacity-60 transition-all duration-700 ease-out hover:text-yellow-400 cursor-pointer"
              onMouseEnter={() => handleHover("Cooperativa")}
              onMouseLeave={handleHoverEnd}
              data-aos="fade-in-up"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({
                  top: 700, // Desplaza 500 píxeles hacia abajo desde la parte superior de la página
                  behavior: "smooth", // Desplazamiento suave
                });
              }}
            >
              {hovered === "Cooperativa"
                ? "¡Bienvenidos a nuestra tienda online!"
                : "Cooperativa"}
            </p>

            <div className="flex flex-row justify-right items-center mt-20 gap-8 w-full text-black  transition-transform duration-700 ease-out">
              <div
                className=" text-center align-right p-2 bg-white bg-opacity-60 flex  flex-row w-full transition-colors duration-500 hover:text-blue-800"
                data-aos="fade-right"
              >
              <PiPlantBold  className="text-2xl text-green-600 mx-2" /> 
              <p className="ml-52">  Productos elaborados en Lago Puelo, Argentina
              </p>              </div>
              <br />

              <div
                className=" flex flex-row  text-center align-right p-2 bg-white bg-opacity-60 w-full transition-colors duration-500 "
                data-aos="fade-left"
              >
               <p className="mr-52"> Envios a todo el Pais  </p>
                <FaPlaneDeparture className="justify-items-end text-2xl text-blue-400"/>
              </div>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-screen mt-0">
              <ClipLoader
                color="blue"
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          }
        >
          <main className="p-12 pt-2 mt-20 transition-all duration-300">
            {children}
          </main>
        </Suspense>
      </div>

      <CartSideBar />
      <Foot />
    </>
  );
}
