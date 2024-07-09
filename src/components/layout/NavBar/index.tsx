/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SignedIn, SignInButton, SignedOut,  UserButton, useSession, useUser } from "@clerk/nextjs";
import Cart from "@/components/Cart";
import { useDispatch } from "react-redux";
import { addClientSecret, addPaymentIntent, addToCart, addUserID, hideLoading } from "@/redux/slices/cartSlice";
import { checkUserRole } from "@/app/lib/utils";
import CartPage from "@/app/cart/page";
import Purchases from "@/components/purchases/Purchases";
import logo from "../../../../public/img/about.png";
interface Item {
  cart_item_id: number;
  user_id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

interface CustomPage {
  url: string;
  label: string;
  mountIcon: (el: HTMLElement) => void;
}

export default function Navbar() {
    const menu = ["Todos", "Cosméticas", "Medicinales", "Aromáticas", "Ofertas"]
    const searchParams = useSearchParams()
    const params = searchParams.get('category')
    const id = useUser().user?.id
    const dispatch = useDispatch()
    const email = useUser().user?.primaryEmailAddress?.emailAddress;
    const { session } = useSession()
    const userRole = checkUserRole(session)
    const pathnames = usePathname();
    const router = useRouter()

    const checkUserStatus = (user: any) => {
      if (user.disable) {
        router.push('/banned');
      }
    };

    const updateUser = async (user: any)=>{
      if(user.id !== id ){
        try {
          let res = await fetch("/api/validateuser", {
            method: "PUT",
            body: JSON.stringify({ email, id }),
          });
          
          return console.log('User Updated')  
           
        } catch (error) {
          console.log('error', error)
        }       
      }
    }

    useEffect(()=>{
      dispatch(hideLoading())
    },[dispatch])
    
    

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          if (!email) {
            return; 
          }
          const response = await fetch(`/api/signup?id=${email}`);
          if (response.ok) {
            const user = await response.json();
            checkUserStatus(user.users[0]);
            updateUser(user.users[0])
          } else {
            throw new Error("Failed to fetch user status");
          }
        } catch (error) {
          console.error("Error user status:", error);
        }
      };
      fetchUserData()
      
    }, [pathnames, id]);   

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        if (!email) {
          return; // Don't fetch if email is not available
        }

        const response = await fetch(`/api/cart?email=${email}`);

        if (response.ok) {
          const cartData = await response.json();
          // cartData.cartItems.map((item)=> console.log(item))
         cartData.cartItems.map((item: Item)=>{
          dispatch(
            addToCart({
              cart_item_id: item.cart_item_id as number,
              userid: item.user_id as string,
              id: item.product_id as string, 
              name: item.name as string,
              image: item.image as string,
              price: item.price as number,
              qty: item.qty as number,
            }),
          );
         })
         dispatch(addClientSecret(cartData.users[0].clientsecret))
         dispatch(addPaymentIntent(cartData.users[0].paymentid)) 
        } else {
          throw new Error("Failed to fetch cart data");
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };
    dispatch(addUserID(id as string))
    fetchCartData();
  }, [email]);


    return (
      <header>
      <nav className="relative flex items-center justify-between p-4 lg:px-6 text-white">
        <div className="w-full flex justify-around text-white">
          <div className="flex ">
            <Link href="/" className="mr-2 flex items-center justify-center text-white">
            <Image src={logo} alt="azul lago logo" 
            className="w-24"
            width={100}
            height={100}
             />
            </Link>
            {menu.length ? (
              <ul className="hidden gap-6 text-sm md:flex md:items-center text-white">
                {menu.map((item) => (
                  <li key={item}
                  className={params === item ? "text-white underline" : "null"}>
                    <Link
                      href={item === 'Todos' ? `/product` : `/product?category=${item}`}
                      className="underline-offset-4  hover:underline text-white hover:text-neutral-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="hidden justify-center md:flex md:w-1/3 text-white">
            <SearchBar/>
          </div>

          {userRole === 'org:admin' ? 
          (<> <div style={{backgroundColor: "yellow", color: "white", padding: "1%",  margin: "auto"} } >
        <Link href='/admindashboard' className=" underline-offset-4  hover:underline text-neutral-400 hover:text-neutral-300">
              Administrar Tienda
            </Link> </div> </>) : null}
          
            <div style={{ color: "white", margin: "auto"}}>
              <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          </div>
          <div style={{ color: "white", margin: "auto"}}>
          <Cart/>
          </div>
        </div>
      </nav>
      </header>
    );
  }
  