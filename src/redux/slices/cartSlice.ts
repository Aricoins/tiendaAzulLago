import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/app/lib/definitions";

interface CartState {
    loading: boolean;
    cartItems: CartItem[];
    user_id: string
    itemsPrice: string; 
    shippingPrice: string;
    taxPrice: string;
    totalPrice: string;
    preference_id: string; // MercadoPago preference ID
    showSideBar: boolean;
    shippingAddress: object;
}

const getStoredCart = () => {
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('cart');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error parsing stored cart:', error);
            return null;
        }
    }
    return null;
};

const storedCart = getStoredCart();

const initialState: CartState = storedCart
    ? {...storedCart, 
    loading: false,
    showSideBar: false }
    : {
    loading: false,
    cartItems: [],
    user_id: '',
    itemsPrice: '0.00',
    shippingPrice: '0.00',
    taxPrice: '0.00',
    totalPrice: '0.00',
    preference_id: '',
    shippingAddress: {},
};

const addDecimals = (num: number): string => {
    return (Math.round(num * 100) / 100).toFixed(2);
};

const saveToLocalStorage = (state: CartState) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('cart', JSON.stringify(state));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addPreferenceId: (state, action: PayloadAction<string>)=>{
            state.preference_id = action.payload
        },
        addUserID: (state, action: PayloadAction<string>)=>{
            state.user_id = action.payload
        },
        saveShippingAddress: (state, action: PayloadAction<object>)=>{
            state.shippingAddress = action.payload
        },
        hideLoading: (state) => {
            state.loading = false;
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.itemsPrice = '0.00';
            state.shippingPrice = '0.00';
            state.taxPrice = '0.00';
            state.totalPrice = '0.00';
            state.preference_id = '';
            saveToLocalStorage(state);
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.product_id === item.product_id);
            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x.product_id === existItem.product_id ? item : x
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            state.itemsPrice = addDecimals(
                state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
            );
            state.shippingPrice = addDecimals(Number(state.itemsPrice) > 100 ? 0 : 100);
            state.taxPrice = addDecimals(
                Number((0.15 * parseFloat(state.itemsPrice)))
            );
            state.totalPrice = (
                Number(state.itemsPrice) +
                Number(state.shippingPrice) +
                Number(state.taxPrice)
            ).toString();
            saveToLocalStorage(state);
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartItems = state.cartItems.filter((x) => x.product_id !== action.payload);
            state.itemsPrice = addDecimals(
                state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
            );
            state.shippingPrice = addDecimals(Number(state.itemsPrice) > 100 ? 0 : 100);
            state.taxPrice = addDecimals(
                Number((0.15 * parseFloat(state.itemsPrice)))
            );
            state.totalPrice = (
                Number(state.itemsPrice) +
                Number(state.shippingPrice) +
                Number(state.taxPrice)
            ).toString();
            saveToLocalStorage(state);
        },
        
    },
});

export const { addToCart, removeFromCart, saveShippingAddress, hideLoading, addUserID, addPreferenceId, clearCart } = cartSlice.actions;

export const cartReducer = cartSlice.reducer;