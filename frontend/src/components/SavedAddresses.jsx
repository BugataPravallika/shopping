import { useState } from 'react';
import { Card, Button, Form, Row, Col, Modal, Table } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import {
  useGetSavedAddressesQuery,
  useAddSavedAddressMutation,
  useUpdateSavedAddressMutation, // Wait, this one might be wrongly named in the component vs slices.
  useDeleteSavedAddressMutation,
} from '../slices/usersApiSlice';
import { toast } from 'react-toastify';
import Loader from './Loader';
import Message from './Message';

const SavedAddresses = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    isDefault: false,
  });

  const { data: addresses, isLoading, error } = useGetSavedAddressesQuery();
  const [addAddress, { isLoading: adding }] = useAddSavedAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateSavedAddressMutation();
  const [deleteAddress, { isLoading: deleting }] = useDeleteSavedAddressMutation();

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address._id);
      setFormData({
        name: address.name,
        address: address.address,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        isDefault: addresses?.length === 0, // First address is default
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      isDefault: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateAddress({ addressId: editingAddress, ...formData }).unwrap();
        toast.success('Address updated successfully');
      } else {
        await addAddress(formData).unwrap();
        toast.success('Address added successfully');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to save address');
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId).unwrap();
        toast.success('Address deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error || 'Failed to delete address');
      }
    }
  };

  return (
    <Card className='mt-4'>
      <Card.Header className='d-flex justify-content-between align-items-center'>
        <h5 className='mb-0'>Saved Addresses</h5>
        <Button variant='primary' size='sm' onClick={() => handleOpenModal()}>
          <FaPlus /> Add Address
        </Button>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : addresses?.length === 0 ? (
          <Message>No saved addresses. Add one to get started!</Message>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>City</th>
                <th>Postal Code</th>
                <th>Country</th>
                <th>Default</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses?.map((address) => (
                <tr key={address._id}>
                  <td>{address.name}</td>
                  <td>{address.address}</td>
                  <td>{address.city}</td>
                  <td>{address.postalCode}</td>
                  <td>{address.country}</td>
                  <td>{address.isDefault ? 'Yes' : 'No'}</td>
                  <td>
                    <Button
                      variant='light'
                      size='sm'
                      className='me-2'
                      onClick={() => handleOpenModal(address)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant='danger'
                      size='sm'
                      onClick={() => handleDelete(address._id)}
                      disabled={deleting}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className='mb-3'>
                <Form.Label>Address Name</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='e.g., Home, Office'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Street Address</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter street address'
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Enter city'
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Enter postal code'
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className='mb-3'>
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter country'
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Check
                type='checkbox'
                label='Set as default address'
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant='primary'
                type='submit'
                disabled={adding || updating}
              >
                {adding || updating ? (
                  <Loader />
                ) : editingAddress ? (
                  'Update Address'
                ) : (
                  'Add Address'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default SavedAddresses;

