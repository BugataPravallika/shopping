import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { resetCart } from '../slices/cartSlice';
import { FaShoppingCart, FaUser, FaHeart, FaBars, FaTimes, FaChevronDown, FaCog } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBox from './SearchBox';
import logo from '../assets/logo.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null); // 'user', 'admin', or null

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      navigate('/login');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = (name) => {
    if (dropdownOpen === name) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(name);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to='/' className="flex items-center gap-2 group">
            <img src={logo} alt='ProShop' className="h-10 w-auto group-hover:scale-105 transition-transform" />
            <span className="text-2xl font-bold font-heading bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">ProShop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <SearchBox />

            <Link to='/cart' className="flex items-center gap-1 text-gray-700 hover:text-accent transition-colors relative">
              <FaShoppingCart className="text-xl" />
              <span>Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </Link>

            {userInfo && (
              <Link to='/wishlist' className='flex items-center gap-1 text-gray-700 hover:text-accent transition-colors'>
                <FaHeart className="text-lg" /> Wishlist
              </Link>
            )}

            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="flex items-center gap-1 text-gray-700 hover:text-accent font-medium focus:outline-none"
                >
                  {userInfo.name} <FaChevronDown className={`text-xs transition-transform ${dropdownOpen === 'user' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 py-1 overflow-hidden"
                      onMouseLeave={() => setDropdownOpen(null)}
                    >
                      <Link to='/profile' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent" onClick={() => setDropdownOpen(null)}>Profile</Link>
                      <Link to='/wishlist' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent" onClick={() => setDropdownOpen(null)}>My Wishlist</Link>
                      <button onClick={logoutHandler} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to='/login' className="flex items-center gap-1 text-gray-700 hover:text-accent font-medium transition-colors">
                <FaUser /> Sign In
              </Link>
            )}

            {/* Admin Menu */}
            {userInfo && userInfo.isAdmin && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('admin')}
                  className="flex items-center gap-1 text-gray-700 hover:text-accent font-medium focus:outline-none"
                >
                  Admin <FaCog className={`text-xs transition-transform ${dropdownOpen === 'admin' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen === 'admin' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 py-1 overflow-hidden"
                      onMouseLeave={() => setDropdownOpen(null)}
                    >
                      <Link to='/admin/dashboard' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(null)}>Dashboard</Link>
                      <Link to='/admin/productlist' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(null)}>Products</Link>
                      <Link to='/admin/orderlist' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(null)}>Orders</Link>
                      <Link to='/admin/userlist' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(null)}>Users</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-accent focus:outline-none"
            >
              {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <SearchBox />
              <Link to='/cart' className="flex items-center gap-2 text-gray-700 hover:text-accent py-2" onClick={() => setIsOpen(false)}>
                <FaShoppingCart /> Cart
                <Badge className="bg-accent text-white ml-auto">{cartItems.reduce((a, c) => a + c.qty, 0)}</Badge>
              </Link>

              {userInfo && (
                <Link to='/wishlist' className="flex items-center gap-2 text-gray-700 hover:text-accent py-2" onClick={() => setIsOpen(false)}>
                  <FaHeart /> Wishlist
                </Link>
              )}

              {userInfo ? (
                <>
                  <div className="border-t border-gray-100 pt-2">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Account</p>
                    <Link to='/profile' className="block py-2 text-gray-700 hover:text-accent" onClick={() => setIsOpen(false)}>Profile</Link>
                    <Link to='/wishlist' className="block py-2 text-gray-700 hover:text-accent" onClick={() => setIsOpen(false)}>My Wishlist</Link>
                    <button onClick={logoutHandler} className="block w-full text-left py-2 text-red-600">Logout</button>
                  </div>
                  {userInfo.isAdmin && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Admin</p>
                      <Link to='/admin/dashboard' className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>Dashboard</Link>
                      <Link to='/admin/productlist' className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>Products</Link>
                      <Link to='/admin/orderlist' className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>Orders</Link>
                      <Link to='/admin/userlist' className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>Users</Link>
                    </div>
                  )}
                </>
              ) : (
                <Link to='/login' className="flex items-center gap-2 text-gray-700 hover:text-accent py-2" onClick={() => setIsOpen(false)}>
                  <FaUser /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Simple Badge component for mobile since we removed Bootstrap
const Badge = ({ children, className }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-bold ${className}`}>
    {children}
  </span>
);

export default Header;
