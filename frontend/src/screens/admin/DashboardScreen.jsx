import React from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { useGetOrderSummaryQuery } from '../../slices/ordersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const DashboardScreen = () => {
    const { data: summary, isLoading, error } = useGetOrderSummaryQuery();

    return (
        <>
            <h1>Admin Dashboard</h1>
            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error?.data?.message || error.error}</Message>
            ) : (
                <>
                    <Row className='mb-4'>
                        <Col md={4}>
                            <Card className='text-center bg-primary text-white'>
                                <Card.Body>
                                    <Card.Title>Total Sales</Card.Title>
                                    <Card.Text className='h2'>
                                        ₹{summary.orders.totalSales.toLocaleString('en-IN')}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className='text-center bg-success text-white'>
                                <Card.Body>
                                    <Card.Title>Total Orders</Card.Title>
                                    <Card.Text className='h2'>{summary.orders.numOrders}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className='text-center bg-info text-white'>
                                <Card.Body>
                                    <Card.Title>Avg Order Value</Card.Title>
                                    <Card.Text className='h2'>
                                        ₹{(summary.orders.totalSales / summary.orders.numOrders || 0).toFixed(2)}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <h3>Daily Sales (Last 30 Days)</h3>
                            <Table striped bordered hover responsive className='table-sm'>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.dailySales.map((day) => (
                                        <tr key={day._id}>
                                            <td>{day._id}</td>
                                            <td>₹{day.sales.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                        <Col md={6}>
                            <h3>Sales by Category</h3>
                            <Table striped bordered hover responsive className='table-sm'>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.categorySales.map((cat) => (
                                        <tr key={cat._id}>
                                            <td>{cat._id}</td>
                                            <td>₹{cat.sales.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
};

export default DashboardScreen;
