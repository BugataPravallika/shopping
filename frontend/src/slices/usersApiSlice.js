import { apiSlice } from './apiSlice';
import { USERS_URL, WISHLIST_URL } from '../constants';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
        credentials: 'include', // Important for cookies
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
        credentials: 'include',
      }),
    }),
    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
        credentials: 'include',
      }),
    }),
    getSavedAddresses: builder.query({
      query: () => ({
        url: `${USERS_URL}/addresses`,
      }),
      providesTags: ['Addresses'],
    }),
    addSavedAddress: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/addresses`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Addresses'],
    }),
    updateSavedAddress: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/addresses/${data.addressId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Addresses'],
    }),
    deleteSavedAddress: builder.mutation({
      query: (addressId) => ({
        url: `${USERS_URL}/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Addresses'],
    }),
    getWishlist: builder.query({
      query: () => ({
        url: `${WISHLIST_URL}`,
      }),
    }),
    addToWishlist: builder.mutation({
      query: (productId) => ({
        url: `${WISHLIST_URL}/${productId}`,
        method: 'POST',
      }),
    }),
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `${WISHLIST_URL}/${productId}`,
        method: 'DELETE',
      }),
    }),
    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
    }),
    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetUserDetailsQuery,
  useGetSavedAddressesQuery,
  useAddSavedAddressMutation,
  useUpdateSavedAddressMutation,
  useDeleteSavedAddressMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = userApiSlice;
