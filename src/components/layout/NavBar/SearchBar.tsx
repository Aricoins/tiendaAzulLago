'use client'

import { useSearchParams, useRouter } from "next/navigation"
import style from './navBar.module.css'
import { useState, useEffect } from "react"


export default function SearchBar (){

    const [querypath, setQuerypath] = useState('')
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const search = searchParams.get('category')

    useEffect(() => {
        const inputElement = document.getElementById('input') as HTMLInputElement | null;
            if (inputElement) {
                inputElement.value = '';
            };
    }, [search]);

    function handleSearch (term: string){
        const params = new URLSearchParams(searchParams)
        
        if (term) {
            params.set('model',term)
        } else {
            params.delete('model')
        }
        setQuerypath(`/product?${params.toString()}`)
    }
    
    function handleKeyDown (event: React.KeyboardEvent<HTMLInputElement>){
        if (event.key === 'Enter'){
            event.preventDefault()
            replace(querypath)
        }
    }
    
    return(
        <div className={style.searchBar}>
            <input
            id='input'
            className={style.input}
                placeholder="Buscar productos..."
                onChange={(e)=>{
                    handleSearch(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                defaultValue={searchParams.get('query')?.toString()}>
            </input>
            <div className="absolute m-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth=".5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
</svg>
</div>
        </div>
    )
}


