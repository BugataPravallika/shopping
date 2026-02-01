import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Row, Col, ListGroup, Image, Card, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { useLazyGetCouponByCodeQuery } from '../slices/couponsApiSlice';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const [getCoupon] = useLazyGetCouponByCodeQuery();

  const applyCouponHandler = async () => {
    if (!coupon) return;
    try {
      const res = await getCoupon(coupon).unwrap();
      if (res.isPercentage) {
        const discountAmount = (cart.totalPrice * res.discount) / 100;
        setDiscount(discountAmount);
        toast.success(`Coupon Applied: ${res.discount}% Off`);
      } else {
        setDiscount(res.discount);
        toast.success(`Coupon Applied: ₹${res.discount} Off`);
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const finalTotal = cart.totalPrice - discount;

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const dispatch = useDispatch();
  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: finalTotal,
        coupon: coupon || '',
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Address:</strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode},{' '}
                {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method: </strong>
              {cart.paymentMethod}
              {cart.paymentMethod === 'UPI QR' && (
                <div className='mt-3 p-3 border rounded bg-light'>
                  <p className='fw-bold mb-2'>
                    <i className='fas fa-qrcode me-2'></i>Scan & Pay with any UPI App:
                  </p>
                  <div className='text-center bg-white p-2 d-inline-block border rounded mb-2'>
                    <Image
                      src='/qr_code.jpeg'
                      alt='UPI QR Code'
                      style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                    />
                  </div>
                  <p className='mb-1'>
                    <strong>Phone Number:</strong> 8712127297
                  </p>
                  <p className='text-muted small mb-0'>
                    Scan the QR and complete the payment. After payment, place the order.
                  </p>
                </div>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ₹{item.price.toLocaleString('en-IN')} = ₹{((item.qty * (item.price * 100)) / 100).toLocaleString('en-IN')}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>₹{Number(cart.itemsPrice).toLocaleString('en-IN')}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>₹{Number(cart.shippingPrice).toLocaleString('en-IN')}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>₹{Number(cart.taxPrice).toLocaleString('en-IN')}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>
                    {discount > 0 ? (
                      <>
                        <span style={{ textDecoration: 'line-through' }} className='text-muted me-2'>
                          ₹{Number(cart.totalPrice).toLocaleString('en-IN')}
                        </span>
                        <span>₹{Number(finalTotal).toLocaleString('en-IN')}</span>
                      </>
                    ) : (
                      `₹${Number(cart.totalPrice).toLocaleString('en-IN')}`
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col md={8}>
                    <Form.Control
                      type='text'
                      placeholder='Enter Coupon'
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Button onClick={applyCouponHandler} size='sm'>Apply</Button>
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {error && (
                  <Message variant='danger'>{error.data.message}</Message>
                )}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type='button'
                  className='btn-block'
                  disabled={cart.cartItems === 0}
                  onClick={placeOrderHandler}
                >
                  Place Order
                </Button>
                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
