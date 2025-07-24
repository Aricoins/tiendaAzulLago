/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useSession, useUser, useClerk } from "@clerk/nextjs";
import Cart from "@/components/Cart";
import { useDispatch } from "react-redux";
import { addToCart, addUserID, hideLoading } from "@/redux/slices/cartSlice";
import { checkUserRole, isUserAdmin } from "@/app/lib/utils";
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
    const { user } = useUser()
    const clerk = useClerk()
    const id = user?.id
    const dispatch = useDispatch()
    const email = user?.primaryEmailAddress?.emailAddress;
    const { session } = useSession()
    const userRole = checkUserRole(session)
    const isAdmin = isUserAdmin(session, user)
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
              user_id: item.user_id as string,
              product_id: item.product_id as string, 
              name: item.name as string,
              image: item.image as string,
              price: item.price as number,
              qty: item.qty as number,
            }),
          );
         })
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
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y Menu */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image src={logo} alt="azul lago logo" 
                  className="w-12 h-12"
                  width={100}
                  height={100}
                 />
              </Link>
              {menu.length ? (
                <ul className="hidden md:flex md:items-center md:space-x-6 text-sm">
                  {menu.map((item) => (
                    <li key={item}>
                      <Link
                        href={item === 'Todos' ? `/product` : `/product?category=${item}`}
                        className={`${params === item ? "text-black underline" : "text-gray-700 hover:text-black"} hover:underline underline-offset-4`}
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            
            {/* SearchBar - Centro */}
            <div className="hidden md:flex md:flex-1 md:justify-center md:px-8">
              <div className="max-w-md w-full">
                <SearchBar/>
              </div>
            </div>

            {/* Botones de la derecha */}
            <div className="flex items-center space-x-3">
              {/* Admin Dashboard Link */}
              {isAdmin && (
                <Link 
                  href='/admindashboard' 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
              
              {/* Authentication Section */}
              <SignedOut>
                <button 
                  onClick={() => clerk.openSignIn()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </button>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/"
                  showName={true}
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "shadow-lg border",
                      userButtonPopoverActionButton: "text-sm hover:bg-gray-50",
                    }
                  }}
                />
              </SignedIn>
              
              {/* Cart */}
              <Cart/>
            </div>
          </div>
        </nav>
      </header>
    );
  }
  