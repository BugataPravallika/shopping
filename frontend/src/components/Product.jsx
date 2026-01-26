import { Link } from 'react-router-dom';
import Rating from './Rating';
import WishlistButton from './WishlistButton';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';

const Product = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success('Added to cart');
  };
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden">

      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
            loading="lazy"
          />
        </Link>

        {/* Badges / Wishlist */}
        <div className="absolute top-3 right-3 z-10 transition-opacity duration-300">
          <WishlistButton productId={product._id} />
        </div>

        {/* Overlay Actions */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-md border-t border-gray-100 flex items-center justify-center gap-3">
          <Link
            to={`/product/${product._id}`}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-accent transition-colors"
          >
            <FaEye /> View
          </Link>
          <div className="h-4 w-px bg-gray-300"></div>
          <button
            onClick={addToCartHandler}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-accent transition-colors"
          >
            <FaShoppingCart /> Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <Rating value={product.rating} text={`${product.numReviews} rev`} />
        </div>

        <Link to={`/product/${product._id}`} className="block mb-2 group-hover:text-accent transition-colors">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Price</span>
            <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          </div>

          {/* Mobile Only Action */}
          <button
            onClick={addToCartHandler}
            className="lg:hidden h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-accent hover:text-white transition-colors"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
