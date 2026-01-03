import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '../slices/wishlistApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';

const WishlistScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const { data: wishlist, isLoading, error, refetch } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const removeFromWishlistHandler = async (productId) => {
    try {
      await removeFromWishlist(productId).unwrap();
      toast.success('Removed from wishlist');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (!userInfo) {
    return (
      <Message>
        Please <Link to="/login">sign in</Link> to view your wishlist
      </Message>
    );
  }

  return (
    <>
      <Meta title="My Wishlist - ProShop" />
      <Row className="py-3">
        <Col>
          <h1>My Wishlist</h1>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : wishlist && wishlist.length > 0 ? (
        <Row>
          {wishlist.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <Card className="my-3 p-3 rounded">
                <Link to={`/product/${product._id}`}>
                  <Card.Img src={product.image} variant="top" />
                </Link>

                <Card.Body>
                  <Link to={`/product/${product._id}`}>
                    <Card.Title as="div" className="product-title">
                      <strong>{product.name}</strong>
                    </Card.Title>
                  </Link>

                  <Card.Text as="div">
                    <div className="my-3">
                      {product.rating} from {product.numReviews} reviews
                    </div>
                  </Card.Text>

                  <Card.Text as="h3">${product.price}</Card.Text>

                  <div className="d-flex justify-content-between align-items-center">
                    <Button
                      as={Link}
                      to={`/product/${product._id}`}
                      variant="primary"
                      className="flex-grow-1 me-2"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => removeFromWishlistHandler(product._id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Message>
          Your wishlist is empty. <Link to="/">Go Shopping</Link>
        </Message>
      )}
    </>
  );
};

export default WishlistScreen;