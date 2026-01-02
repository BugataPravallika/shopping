import { Row, Col, Form } from 'react-bootstrap';
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

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || '');

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
    category,
  });

  const { data: categories } = useGetCategoriesQuery();

  const categoryHandler = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    navigate(`/?category=${newCategory}`);
  };

  useEffect(() => {
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  return (
    <>
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Link to='/' className='btn btn-light mb-4'>
          Go Back
        </Link>
      )}
      <Row className='mb-3'>
        <Col md={4}>
          <Form.Select value={category} onChange={categoryHandler}>
            <option value=''>All Categories</option>
            {categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta />
          <h1>Latest Products</h1>
          <Row>
            {data.products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate
            pages={data.pages}
            page={data.page}
            keyword={keyword ? keyword : ''}
          />
        </>
      )}
    </>
  );
};

export default HomeScreen;
