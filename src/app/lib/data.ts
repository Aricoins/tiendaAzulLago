import { sql } from '@vercel/postgres';
import {Products} from './definitions'

export async function fetchProduct() {
    
    try {
        const data = await sql<Products>`SELECT * FROM products`;
        return data.rows
    } catch (error) {
        console.log("Database Error:", error)
    }
}