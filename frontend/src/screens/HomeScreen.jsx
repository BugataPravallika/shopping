import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetProductsQuery, useGetCategoriesQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import { useState, useEffect } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
    category: category || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sortBy: sortBy || undefined,
  });

  const { data: categories } = useGetCategoriesQuery();

  // Get price range from products for filter limits
  const maxProductPrice = data?.products?.reduce(
    (max, product) => Math.max(max, product.price),
    0
  ) || 1000;

  const categoryHandler = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    updateURL({ category: newCategory });
  };

  const priceHandler = (type, value) => {
    if (type === 'min') {
      setMinPrice(value);
      updateURL({ minPrice: value });
    } else {
      setMaxPrice(value);
      updateURL({ maxPrice: value });
    }
  };

  const sortHandler = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    updateURL({ sortBy: newSort });
  };

  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        newParams.set(key, params[key]);
      } else {
        newParams.delete(key);
      }
    });
    navigate(`?${newParams.toString()}`);
  };

  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSortBy(searchParams.get('sortBy') || 'newest');
  }, [searchParams]);

  const hasFilters = minPrice || maxPrice || category;

  return (
    <>
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Link to='/' className='btn-primary-modern inline-block mb-4'>
          Go Back
        </Link>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <button
            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg font-medium"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>

          <div className={`w-full lg:flex lg:items-end gap-4 grid grid-cols-1 md:grid-cols-2 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={categoryHandler}
                className="form-control"
              >
                <option value=''>All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Min Price ($)</label>
              <input
                type='number'
                placeholder='Min'
                value={minPrice}
                onChange={(e) => priceHandler('min', e.target.value)}
                min='0'
                className="form-control"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Max Price ($)</label>
              <input
                type='number'
                placeholder='Max'
                value={maxPrice}
                onChange={(e) => priceHandler('max', e.target.value)}
                min='0'
                max={maxProductPrice}
                className="form-control"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={sortHandler}
                className="form-control"
              >
                <option value='newest'>Newest First</option>
                <option value='price_asc'>Price: Low to High</option>
                <option value='price_desc'>Price: High to Low</option>
                <option value='rating'>Highest Rated</option>
                <option value='popularity'>Most Popular</option>
              </select>
            </div>

            {hasFilters && (
              <button
                onClick={() => {
                  setCategory('');
                  setMinPrice('');
                  setMaxPrice('');
                  setSortBy('newest');
                  navigate('/');
                }}
                className="h-10 px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg flex items-center gap-2 justify-center lg:justify-start"
              >
                <FaTimes /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta />
          <h1 className="text-3xl font-bold mb-6">Latest Products</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>

          <div className="mt-10">
            <Paginate
              pages={data.pages}
              page={data.page}
              keyword={keyword ? keyword : ''}
            />
          </div>
        </>
      )}
    </>
  );
};

export default HomeScreen;
