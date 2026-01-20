import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '../slices/wishlistApiSlice';

const WishlistButton = ({ productId }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const { data: wishlist } = useGetWishlistQuery(undefined, {
    skip: !userInfo,
  });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  useEffect(() => {
    if (wishlist && userInfo) {
      setIsInWishlist(wishlist.some((item) => item._id === productId));
    }
  }, [wishlist, productId, userInfo]);

  const handleWishlistToggle = async () => {
    if (!userInfo) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(productId).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(productId).unwrap();
        toast.success('Added to wishlist');
      }
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleWishlistToggle();
      }}
      className="z-20 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 group/wish"
      style={{
        transition: 'all 0.3s ease'
      }}
    >
      {isInWishlist ? (
        <FaHeart className="text-red-500 text-lg transition-colors" />
      ) : (
        <FaRegHeart className="text-gray-400 group-hover/wish:text-red-400 text-lg transition-colors" />
      )}
    </motion.button>
  );
};

export default WishlistButton;