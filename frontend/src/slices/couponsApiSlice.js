import { COUPONS_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const couponsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCouponByCode: builder.query({
            query: (code) => ({
                url: `${COUPONS_URL}/${code}`,
            }),
            keepUnusedDataFor: 5,
        }),
        getCoupons: builder.query({
            query: () => ({
                url: COUPONS_URL,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Coupons'],
        }),
        createCoupon: builder.mutation({
            query: (data) => ({
                url: COUPONS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Coupons'],
        }),
        deleteCoupon: builder.mutation({
            query: (couponId) => ({
                url: `${COUPONS_URL}/id/${couponId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Coupons'],
        }),
    }),
});

export const {
    useGetCouponByCodeQuery,
    useLazyGetCouponByCodeQuery,
    useGetCouponsQuery,
    useCreateCouponMutation,
    useDeleteCouponMutation,
} = couponsApiSlice;
