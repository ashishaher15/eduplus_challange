import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userApi from '../api/userApi';
import authApi from '../api/authApi';

function UserHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  useEffect(() => {
    // Redirect if not logged in or not a user
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }
    
    fetchStores();
  }, [user, navigate]);
  
  const fetchStores = async (name = searchName, address = searchAddress) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await userApi.fetchStores({
        userId: user.id,
        name,
        address
      });
      setStores(data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores(searchName, searchAddress);
  };
  
  const handleRatingChange = async (storeId, rating) => {
    if (!user) return;
    
    try {
      const updatedStore = await userApi.submitRating({
        userId: user.id,
        storeId,
        rating: parseInt(rating)
      });
      
      // Update the store in the list
      setStores(stores.map(store => 
        store.id === updatedStore.id ? updatedStore : store
      ));
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordError('Both fields are required');
      return;
    }
    
    if (passwordForm.newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters');
      return;
    }
    
    try {
      await authApi.updatePassword({
        userId: user.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordSuccess('Password updated successfully');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (error) {
      setPasswordError(error.error || 'Failed to update password');
    }
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>User Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <p>Welcome, {user.name}! You are logged in as a {user.role}.</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          style={{ 
            padding: '8px 12px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {showPasswordForm ? 'Hide Password Form' : 'Update Password'}
        </button>
        
        <button 
          onClick={logout}
          style={{ 
            padding: '8px 12px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      {showPasswordForm && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
          <h3>Update Password</h3>
          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
          {passwordSuccess && <p style={{ color: 'green' }}>{passwordSuccess}</p>}
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Current Password:
              </label>
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                New Password:
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <button
              type="submit"
              style={{ 
                padding: '8px 12px', 
                backgroundColor: '#2196F3', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Update Password
            </button>
          </form>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Store Listings</h2>
        <form onSubmit={handleSearch} style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Search by Name:
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Search by Address:
              </label>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          </div>
          <button
            type="submit"
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>
        
        {isLoading ? (
          <p>Loading stores...</p>
        ) : stores.length === 0 ? (
          <p>No stores found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Address</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Overall Rating</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Your Rating</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{store.name}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{store.address}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      {parseFloat(store.averageRating).toFixed(1)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      {store.userRating ? parseFloat(store.userRating).toFixed(1) : 'Not rated'}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      <select
                        value={store.userRating || ''}
                        onChange={(e) => handleRatingChange(store.id, e.target.value)}
                        style={{ padding: '5px' }}
                      >
                        <option value="">Select Rating</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserHome;