import { apiSlice } from './apiSlice';
import { CART_URL } from '../constants';

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: CART_URL,
        credentials: 'include', // Important for cookies
      }),
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (data) => ({
        url: CART_URL,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ productId, qty }) => ({
        url: `${CART_URL}/${productId}`,
        method: 'PUT',
        body: { qty },
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `${CART_URL}/${productId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),
    saveShippingAddress: builder.mutation({
      query: (data) => ({
        url: `${CART_URL}/shipping`,
        method: 'PUT',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),
    savePaymentMethod: builder.mutation({
      query: (data) => ({
        url: `${CART_URL}/payment`,
        method: 'PUT',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),
    syncCart: builder.mutation({
      query: (cartItems) => ({
        url: `${CART_URL}/sync`,
        method: 'POST',
        body: { cartItems },
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: CART_URL,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useSaveShippingAddressMutation,
  useSavePaymentMethodMutation,
  useSyncCartMutation,
  useClearCartMutation,
} = cartApiSlice;

