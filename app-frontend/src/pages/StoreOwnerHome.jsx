import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminApi from '../api/adminApi';
import authApi from '../api/authApi';

function StoreOwnerHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [ratingUsers, setRatingUsers] = useState([]);
  const [loadingRatingUsers, setLoadingRatingUsers] = useState(false);
  const [showRatingUsers, setShowRatingUsers] = useState(false);
  
  useEffect(() => {
    // Redirect if not logged in or not a store owner
    if (!user || user.role !== 'store_owner') {
      navigate('/login');
      return;
    }
    
    // Fetch store data for this owner
    const fetchStoreData = async () => {
      try {
        const storeData = await adminApi.getStoreByOwnerId(user.id);
        setStore(storeData);
      } catch (err) {
        console.error('Error fetching store:', err);
        setError(err.error || 'Failed to load store data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStoreData();
  }, [user, navigate]);

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
    
    try {
      await authApi.updatePassword({
        userId: user.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordSuccess('Password updated successfully');
      setPasswordForm({
        oldPassword: '',
        newPassword: ''
      });
    } catch (err) {
      setPasswordError(err.error || 'Failed to update password');
    }
  };

  const fetchRatingUsers = async () => {
    if (!store) return;
    
    setLoadingRatingUsers(true);
    try {
      const users = await adminApi.getStoreRatingUsers(store.id);
      setRatingUsers(users);
      setShowRatingUsers(true);
    } catch (err) {
      console.error('Error fetching rating users:', err);
    } finally {
      setLoadingRatingUsers(false);
    }
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Store Owner Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <p>Welcome, {user.name}! You are logged in as a {user.role}.</p>
      </div>
      
      {loading ? (
        <div>Loading store information...</div>
      ) : error ? (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'red' }}>{error}</p>
          <Link 
            to="/owner/store/new"
            style={{
              display: 'inline-block',
              padding: '10px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '10px'
            }}
          >
            Create Your Store
          </Link>
        </div>
      ) : (
        <div style={{ marginBottom: '30px' }}>
          <h2>Your Store</h2>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{store.name}</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '5px 0', color: '#666' }}><strong>Email:</strong> {store.email}</p>
              <p style={{ margin: '5px 0', color: '#666' }}><strong>Address:</strong> {store.address}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Rating:</strong> {parseFloat(store.averageRating).toFixed(2)} ({store.ratingsCount} reviews)
              </p>
            </div>
            
            <Link 
              to={`/owner/store/edit`}
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                backgroundColor: '#2196f3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                marginRight: '10px',
                fontSize: '14px'
              }}
            >
              Edit Store
            </Link>
            
            <Link 
              to={`/owner/store/items`}
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                backgroundColor: '#ff9800',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                marginRight: '10px'
              }}
            >
              Manage Items
            </Link>
            
            <button
              onClick={fetchRatingUsers}
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              View Rating Users
            </button>
          </div>
          
          {/* Rating Users Section */}
          {showRatingUsers && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3>Users Who Rated Your Store</h3>
              {loadingRatingUsers ? (
                <p>Loading users...</p>
              ) : ratingUsers.length === 0 ? (
                <p>No ratings yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratingUsers.map(user => (
                      <tr key={user.id}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.name}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.email}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button
                onClick={() => setShowRatingUsers(false)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#9e9e9e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
              >
                Hide
              </button>
            </div>
          )}
          
          {/* Password Update Section */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3>Update Password</h3>
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#607d8b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
                {passwordSuccess && <p style={{ color: 'green' }}>{passwordSuccess}</p>}
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Current Password:</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>New Password:</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    required
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      marginRight: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordError('');
                      setPasswordSuccess('');
                      setPasswordForm({ oldPassword: '', newPassword: '' });
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      <button 
        onClick={logout}
        style={{ 
          padding: '10px 15px', 
          backgroundColor: '#f44336', 
          color: 'white', 
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default StoreOwnerHome;