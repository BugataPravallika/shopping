import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
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

  if (!userInfo) return null;

  return (
    <button
      onClick={handleWishlistToggle}
      className="btn btn-sm position-absolute top-0 end-0 m-2"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isInWishlist ? (
        <FaHeart size={18} color="#dc3545" />
      ) : (
        <FaRegHeart size={18} color="#6c757d" />
      )}
    </button>
  );
};

export default WishlistButton;