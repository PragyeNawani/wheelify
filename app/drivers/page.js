'use client';

import { useState, useEffect } from 'react';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [hireFormData, setHireFormData] = useState({
    startDate: '',
    duration: '',
    durationType: 'days',
    carId: '',
    specialRequirements: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, [filter]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const queryParam = filter === 'available' ? '?available=true' : 
                        filter !== 'all' ? `?status=${filter}` : '';
      
      console.log('Fetching from:', `/api/drivers${queryParam}`);
      const response = await fetch(`/api/drivers${queryParam}`);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setDrivers(data.data);
        console.log('Drivers loaded:', data.data.length);
      } else {
        console.error('API returned error:', data.error);
        alert('Error: ' + (data.error || 'Failed to fetch drivers'));
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      alert('Failed to fetch drivers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHireClick = (driver) => {
    setSelectedDriver(driver);
    setShowHireModal(true);
  };

  const calculateTotalAmount = () => {
    if (!selectedDriver || !hireFormData.duration) return 0;
    
    const { amount, paymentFrequency } = selectedDriver.salary;
    const { duration, durationType } = hireFormData;
    
    let multiplier = 1;
    
    // Convert duration to days for calculation
    if (durationType === 'weeks') {
      multiplier = 7;
    } else if (durationType === 'months') {
      multiplier = 30;
    }
    
    const totalDays = duration * multiplier;
    
    // Calculate based on payment frequency
    if (paymentFrequency === 'daily') {
      return amount * totalDays;
    } else if (paymentFrequency === 'weekly') {
      return amount * (totalDays / 7);
    } else { // monthly
      return amount * (totalDays / 30);
    }
  };

  const handlePayment = async () => {
    if (!hireFormData.startDate || !hireFormData.duration || 
        !hireFormData.customerName || !hireFormData.customerEmail || 
        !hireFormData.customerPhone) {
      alert('Please fill in all required fields');
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const totalAmount = calculateTotalAmount();
      
      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          driverId: selectedDriver._id,
          hireDetails: hireFormData
        }),
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }
      
      // Initialize Razorpay
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Driver Hiring Service',
        description: `Hire ${selectedDriver.name} for ${hireFormData.duration} ${hireFormData.durationType}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              driverId: selectedDriver._id,
              hireDetails: hireFormData
            }),
          });
          
          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            alert('Payment successful! Driver hired successfully!');
            setShowHireModal(false);
            fetchDrivers();
            resetHireForm();
          } else {
            alert('Payment verification failed: ' + verifyData.error);
          }
        },
        prefill: {
          name: hireFormData.customerName,
          email: hireFormData.customerEmail,
          contact: hireFormData.customerPhone
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
        setProcessingPayment(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment: ' + error.message);
      setProcessingPayment(false);
    }
  };

  const resetHireForm = () => {
    setHireFormData({
      startDate: '',
      duration: '',
      durationType: 'days',
      carId: '',
      specialRequirements: '',
      customerName: '',
      customerEmail: '',
      customerPhone: ''
    });
    setSelectedDriver(null);
    setProcessingPayment(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHireFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeModal = () => {
    setShowHireModal(false);
    resetHireForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">  
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Hire a Driver</h1>
            <p className="text-gray-600 mt-2">Browse and hire professional drivers for your needs</p>
          </div>
        </div>

        {/* Filter Options */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'available' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Available Drivers
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            All Drivers
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Active
          </button>
        </div>

        {/* Drivers List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading drivers...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No drivers available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
              <div key={driver._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={driver.photo || '/images/default-driver.png'}
                      alt={driver.name}
                      className="w-20 h-20 rounded-full object-cover mr-4"
                      onError={(e) => { e.target.src = '/images/default-driver.png'; }}
                    />
                    <div>
                      <h3 className="text-xl font-bold">{driver.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        driver.status === 'active' ? 'bg-green-100 text-green-800' :
                        driver.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {driver.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {driver.email}</p>
                    <p><strong>Contact:</strong> {driver.contactNumber}</p>
                    <p><strong>Licence:</strong> {driver.licenceDetails.licenceNumber}</p>
                    <p><strong>Type:</strong> {driver.licenceDetails.licenceType}</p>
                    <p><strong>Rate:</strong> ₹{driver.salary.amount} / {driver.salary.paymentFrequency}</p>
                    {driver.experience && <p><strong>Experience:</strong> {driver.experience} years</p>}
                    {driver.assignedCar ? (
                      <p className="text-amber-600"><strong>Currently Assigned:</strong> {driver.assignedCar.make} {driver.assignedCar.model}</p>
                    ) : (
                      <p className="text-green-600"><strong>Status:</strong> Available for hire</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleHireClick(driver)}
                      disabled={driver.status !== 'active'}
                      className={`w-full py-2 rounded-lg transition ${
                        driver.status === 'active'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {driver.status === 'active' ? 'Hire Driver' : 'Not Available'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hire Modal */}
        {showHireModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Hire {selectedDriver.name}</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Driver Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-3">
                    <img
                      src={selectedDriver.photo || '/images/default-driver.png'}
                      alt={selectedDriver.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{selectedDriver.name}</h3>
                      <p className="text-sm text-gray-600">{selectedDriver.licenceDetails.licenceType}</p>
                      <p className="text-sm text-gray-600">{selectedDriver.experience} years experience</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-blue-600">
                    Rate: ₹{selectedDriver.salary.amount} / {selectedDriver.salary.paymentFrequency}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Customer Details */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">Your Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                          type="text"
                          name="customerName"
                          value={hireFormData.customerName}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input
                          type="email"
                          name="customerEmail"
                          value={hireFormData.customerEmail}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="customerPhone"
                          value={hireFormData.customerPhone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hire Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Hire Details</h3>
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={hireFormData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration *</label>
                      <input
                        type="number"
                        name="duration"
                        value={hireFormData.duration}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="Enter duration"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration Type *</label>
                      <select
                        name="durationType"
                        value={hireFormData.durationType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Car ID (optional)</label>
                    <input
                      type="text"
                      name="carId"
                      value={hireFormData.carId}
                      onChange={handleInputChange}
                      placeholder="Enter car ID if assigning"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Special Requirements</label>
                    <textarea
                      name="specialRequirements"
                      value={hireFormData.specialRequirements}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any special requirements or instructions..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Price Summary */}
                  {hireFormData.duration && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{calculateTotalAmount().toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        For {hireFormData.duration} {hireFormData.durationType} @ ₹{selectedDriver.salary.amount}/{selectedDriver.salary.paymentFrequency}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={closeModal}
                      disabled={processingPayment}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={processingPayment}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingPayment ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}