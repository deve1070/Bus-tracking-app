import React, { useState } from 'react';
import axios from 'axios';

interface NotificationFormProps {
  onNotificationSent: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ onNotificationSent }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'broadcast' | 'driver'>('broadcast');
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { title, message, type, recipient: type === 'driver' ? driverId : 'all' };
      await axios.post('http://localhost:3000/api/notifications', payload, config);
      alert('Notification sent successfully');
      setTitle('');
      setMessage('');
      setDriverId('');
      onNotificationSent();
    } catch (error) {
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="mb-2 p-2 border rounded"
      />
      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        className="mb-2 p-2 border rounded"
      />
      <select value={type} onChange={(e) => setType(e.target.value as 'broadcast' | 'driver')} className="mb-2 p-2 border rounded">
        <option value="broadcast">Broadcast to All</option>
        <option value="driver">Send to Driver</option>
      </select>
      {type === 'driver' && (
        <input
          placeholder="Driver ID"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          required
          className="mb-2 p-2 border rounded"
        />
      )}
      <button type="submit" disabled={loading} className="p-2 bg-blue-500 text-white rounded">
        {loading ? 'Sending...' : 'Send Notification'}
      </button>
    </form>
  );
};

export default NotificationForm; 