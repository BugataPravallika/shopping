import { apiSlice } from './apiSlice';
import { USERS_URL } from '../constants';

export const addressesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSavedAddresses: builder.query({
      query: () => ({
        url: `${USERS_URL}/addresses`,
        credentials: 'include',
      }),
      providesTags: ['Addresses'],
    }),
    addSavedAddress: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/addresses`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Addresses'],
    }),
    updateSavedAddress: builder.mutation({
      query: ({ addressId, ...data }) => ({
        url: `${USERS_URL}/addresses/${addressId}`,
        method: 'PUT',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Addresses'],
    }),
    deleteSavedAddress: builder.mutation({
      query: (addressId) => ({
        url: `${USERS_URL}/addresses/${addressId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Addresses'],
    }),
  }),
});

export const {
  useGetSavedAddressesQuery,
  useAddSavedAddressMutation,
  useUpdateSavedAddressMutation,
  useDeleteSavedAddressMutation,
} = addressesApiSlice;

