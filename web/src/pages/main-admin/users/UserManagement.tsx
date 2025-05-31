import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'MainAdmin' | 'StationAdmin' | 'Driver' | 'Passenger';
  phoneNumber: string;
  username: string;
  createdAt: string;
  stationId?: string | { _id: string; name: string }; // Accept both string and populated object
  busId?: string | { _id: string; name: string }; // Added for Driver
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: User['role'];
  phoneNumber: string;
  username: string;
  stationId?: string; // Added for StationAdmin
  busId?: string; // Added for Driver
}

interface Station {
  _id: string;
  name: string;
}

interface Bus {
  _id: string;
  name: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Driver',
    phoneNumber: '',
    username: '',
    stationId: '',
    busId: '',
  });

  const { addNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
    fetchStations();
    fetchBuses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch users. Please try again.',
      });
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (err) {
      console.error('Error fetching stations:', err);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await api.get('/buses');
      console.log('Fetched buses:', response.data); // Debug log
      setBuses(response.data);
    } catch (err) {
      console.error('Error fetching buses:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Don't send password if it's empty (not being changed)
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete (dataToSend as any).password;
        }
        await api.put(`/users/${selectedUser._id}`, dataToSend);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'User updated successfully',
        });
      } else {
        await api.post('/users', formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'User created successfully',
        });
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Driver',
        phoneNumber: '',
        username: '',
        stationId: '',
        busId: '',
      });
      fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to save user';
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '', // Don't show password when editing
      role: user.role,
      phoneNumber: user.phoneNumber,
      username: user.username,
      // If stationId is an object, use its _id, else use the string
      stationId: typeof user.stationId === 'object' && user.stationId !== null ? user.stationId._id : user.stationId || '',
      busId: typeof user.busId === 'object' && user.busId !== null ? user.busId._id : user.busId || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'User deleted successfully',
        });
        fetchUsers();
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Failed to delete user';
        addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });
        console.error('Error deleting user:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users in the system including their name, email, role, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'Driver',
                phoneNumber: '',
                username: '',
                stationId: '',
                busId: '',
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add user
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Username
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Station
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Bus
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.username}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.phoneNumber}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.role === 'StationAdmin'
                          ? (user.stationId && typeof user.stationId === 'object'
                              ? user.stationId.name
                              : stations.find(s => s._id === user.stationId)?.name || 'N/A')
                          : user.role === 'Driver'
                            ? (user.busId && typeof user.busId === 'object'
                                ? user.busId.name
                                : buses.find(b => b._id === user.busId)?.name || 'N/A')
                            : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.role === 'Driver'
                          ? (user.busId && typeof user.busId === 'object'
                              ? user.busId.name
                              : buses.find(b => b._id === user.busId)?.name || 'N/A')
                          : 'N/A'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
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
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">{selectedUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required={!selectedUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="MainAdmin">Main Admin</option>
                  <option value="StationAdmin">Station Admin</option>
                  <option value="Driver">Driver</option>
                  <option value="Passenger">Passenger</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              {formData.role === 'StationAdmin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Station</label>
                  <select
                    value={formData.stationId}
                    onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a station</option>
                    {stations.map((station) => (
                      <option key={station._id} value={station._id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formData.role === 'Driver' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bus</label>
                  <select
                    value={formData.busId}
                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a bus</option>
                    {buses.map((bus) => (
                      <option key={bus._id} value={bus._id}>
                        {bus.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {selectedUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;