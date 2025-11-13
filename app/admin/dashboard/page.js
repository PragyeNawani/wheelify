// app/admin/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCars: 0,
    totalDrivers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Remove localStorage usage - handle logout appropriately for your auth system
    // For example, call your logout API endpoint
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            {/* <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button> */}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Cars"
            value={stats.totalCars}
            icon="🚗"
            loading={loading}
          />
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            icon="👨‍✈️"
            loading={loading}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="📋"
            loading={loading}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon="💰"
            loading={loading}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <TabButton
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                label="Overview"
              />
              <TabButton
                active={activeTab === 'cars'}
                onClick={() => setActiveTab('cars')}
                label="Manage Cars"
              />
              <TabButton
                active={activeTab === 'drivers'}
                onClick={() => setActiveTab('drivers')}
                label="Manage Drivers"
              />
              <TabButton
                active={activeTab === 'bookings'}
                onClick={() => setActiveTab('bookings')}
                label="View Bookings"
              />
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'cars' && <CarsTab />}
            {activeTab === 'drivers' && <DriversTab />}
            {activeTab === 'bookings' && <BookingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {loading ? '...' : value}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-medium ${
        active
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dashboard Overview</h2>
      <p className="text-gray-600">
        Welcome to the admin dashboard. Use the tabs above to manage cars, drivers, and view bookings.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <ul className="space-y-2">
            <li className="text-blue-600 hover:underline cursor-pointer">➕ Add New Car</li>
            <li className="text-blue-600 hover:underline cursor-pointer">➕ Add New Driver</li>
            <li className="text-blue-600 hover:underline cursor-pointer">📊 View Reports</li>
          </ul>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
}

function CarsTab() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/admin/cars');
      if (!res.ok) throw new Error('Failed to fetch cars');
      const data = await res.json();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    
    try {
      const res = await fetch(`/api/admin/cars/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete car');
      fetchCars();
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Failed to delete car');
    }
  };

  if (showForm) {
    return (
      <CarForm
        car={editingCar}
        onClose={() => {
          setShowForm(false);
          setEditingCar(null);
          fetchCars();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Cars</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New Car
        </button>
      </div>

      {loading ? (
        <p>Loading cars...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cars.map((car) => (
                <tr key={car._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{car.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{car.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{car.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{car.pricePerDay}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {car.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setEditingCar(car);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CarForm({ car, onClose }) {
  const [formData, setFormData] = useState({
    name: car?.name || '',
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    pricePerDay: car?.pricePerDay || '',
    category: car?.category || 'sedan',
    transmission: car?.transmission || 'manual',
    fuelType: car?.fuelType || 'petrol',
    seats: car?.seats || 5,
    location: car?.location || '',
    description: car?.description || '',
    features: car?.features?.join(', ') || '',
    available: car?.available !== undefined ? car.available : true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSend = {
      ...formData,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
    };

    try {
      const url = car ? `/api/admin/cars/${car._id}` : '/api/admin/cars';
      const method = car ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        alert(car ? 'Car updated successfully!' : 'Car added successfully!');
        onClose();
      } else {
        alert('Error saving car');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving car');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">{car ? 'Edit Car' : 'Add New Car'}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Car Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Brand"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Image URL"
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="number"
          placeholder="Price Per Day"
          value={formData.pricePerDay}
          onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="hatchback">Hatchback</option>
          <option value="luxury">Luxury</option>
          <option value="sports">Sports</option>
        </select>
        <select
          value={formData.transmission}
          onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="manual">Manual</option>
          <option value="automatic">Automatic</option>
        </select>
        <select
          value={formData.fuelType}
          onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="electric">Electric</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <input
          type="number"
          placeholder="Seats"
          value={formData.seats}
          onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
      </div>
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="border rounded px-3 py-2 w-full"
        rows="3"
      />
      
      <input
        type="text"
        placeholder="Features (comma separated)"
        value={formData.features}
        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
        className="border rounded px-3 py-2 w-full"
      />
      
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={formData.available}
          onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
          className="mr-2"
        />
        Available for booking
      </label>
      
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {car ? 'Update' : 'Add'} Car
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DriversTab() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/admin/drivers');
      if (!res.ok) throw new Error('Failed to fetch drivers');
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete driver');
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver');
    }
  };

  if (showForm) {
    return (
      <DriverForm
        driver={editingDriver}
        onClose={() => {
          setShowForm(false);
          setEditingDriver(null);
          fetchDrivers();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Drivers</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New Driver
        </button>
      </div>

      {loading ? (
        <p>Loading drivers...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{driver.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{driver.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{driver.licenceDetails.licenceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{driver.salary.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setEditingDriver(driver);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(driver._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DriverForm({ driver, onClose }) {
  const [formData, setFormData] = useState({
    name: driver?.name || '',
    email: driver?.email || '',
    contactNumber: driver?.contactNumber || '',
    licenceNumber: driver?.licenceDetails?.licenceNumber || '',
    licenceType: driver?.licenceDetails?.licenceType || 'Light Motor Vehicle',
    issueDate: driver?.licenceDetails?.issueDate?.split('T')[0] || '',
    expiryDate: driver?.licenceDetails?.expiryDate?.split('T')[0] || '',
    salary: driver?.salary?.amount || '',
    paymentFrequency: driver?.salary?.paymentFrequency || 'monthly',
    experience: driver?.experience || 0,
    status: driver?.status || 'active',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      licenceDetails: {
        licenceNumber: formData.licenceNumber,
        licenceType: formData.licenceType,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
      },
      salary: {
        amount: Number(formData.salary),
        currency: 'INR',
        paymentFrequency: formData.paymentFrequency,
      },
      experience: Number(formData.experience),
      status: formData.status,
    };

    try {
      const url = driver ? `/api/admin/drivers/${driver._id}` : '/api/admin/drivers';
      const method = driver ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        alert(driver ? 'Driver updated successfully!' : 'Driver added successfully!');
        onClose();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || 'Failed to save driver'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving driver');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">{driver ? 'Edit Driver' : 'Add New Driver'}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Driver Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Contact Number (10 digits)"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          className="border rounded px-3 py-2"
          pattern="[0-9]{10}"
          required
        />
        <input
          type="text"
          placeholder="Licence Number"
          value={formData.licenceNumber}
          onChange={(e) => setFormData({ ...formData, licenceNumber: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <select
          value={formData.licenceType}
          onChange={(e) => setFormData({ ...formData, licenceType: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="Light Motor Vehicle">Light Motor Vehicle</option>
          <option value="Heavy Motor Vehicle">Heavy Motor Vehicle</option>
          <option value="Commercial">Commercial</option>
        </select>
        <input
          type="date"
          placeholder="Issue Date"
          value={formData.issueDate}
          onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="date"
          placeholder="Expiry Date"
          value={formData.expiryDate}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="number"
          placeholder="Monthly Salary"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          className="border rounded px-3 py-2"
          required
        />
        <select
          value={formData.paymentFrequency}
          onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
        <input
          type="number"
          placeholder="Years of Experience"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="border rounded px-3 py-2"
          min="0"
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
        </select>
      </div>
      
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {driver ? 'Update' : 'Add'} Driver
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [driverBookings, setDriverBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState('car');

  useEffect(() => {
    fetchBookings();
  }, [bookingType]);

  const fetchBookings = async () => {
    try {
      if (bookingType === 'car') {
        const res = await fetch('/api/admin/bookings');
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const data = await res.json();
        setBookings(data);
      } else {
        const res = await fetch('/api/admin/driver-bookings');
        if (!res.ok) throw new Error('Failed to fetch driver bookings');
        const data = await res.json();
        setDriverBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">View Bookings</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setBookingType('car');
              setLoading(true);
            }}
            className={`px-4 py-2 rounded ${
              bookingType === 'car'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Car Bookings
          </button>
          <button
            onClick={() => {
              setBookingType('driver');
              setLoading(true);
            }}
            className={`px-4 py-2 rounded ${
              bookingType === 'driver'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Driver Bookings
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookingType === 'car' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.user?.name || booking.user?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.car?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.totalDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{booking.totalPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'confirmed' || booking.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : booking.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {driverBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.customerName}
                    <br />
                    <span className="text-xs text-gray-500">{booking.customerPhone}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.driverId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.carId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{booking.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : booking.bookingStatus === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.paymentStatus === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : booking.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}