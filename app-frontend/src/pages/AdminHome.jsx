import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminApi from '../api/adminApi';

function AdminHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  
  useEffect(() => {
    // Redirect if not logged in or not an admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // Get users count
        const users = await adminApi.getAllUsers();
        
        // Get stores count and total ratings
        const stores = await adminApi.getAllStores();
        
        // Calculate total ratings
        const totalRatings = stores.reduce((sum, store) => sum + store.ratingsCount, 0);
        
        setStats({
          totalUsers: users.length,
          totalStores: stores.length,
          totalRatings: totalRatings
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, [user, navigate]);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <p>Welcome, {user.name}! You are logged in as an {user.role}.</p>
      </div>
      
      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          flex: 1, 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total Users</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#1976d2' }}>{stats.totalUsers}</p>
        </div>
        
        <div style={{ 
          flex: 1, 
          backgroundColor: '#e8f5e9', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>Total Stores</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#388e3c' }}>{stats.totalStores}</p>
        </div>
        
        <div style={{ 
          flex: 1, 
          backgroundColor: '#fff8e1', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Total Ratings</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#f57c00' }}>{stats.totalRatings}</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link 
            to="/admin/users"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: '#333',
              width: '120px'
            }}
          >
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              backgroundColor: '#e3f2fd', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '10px',
              fontSize: '24px',
              color: '#1976d2'
            }}>
              👥
            </div>
            <span>Manage Users</span>
          </Link>
          
          <Link 
            to="/admin/stores"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: '#333',
              width: '120px'
            }}
          >
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              backgroundColor: '#fff8e1', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '10px',
              fontSize: '24px',
              color: '#f57c00'
            }}>
              🏪
            </div>
            <span>View Stores</span>
          </Link>
          
          <Link 
            to="/admin/users/new"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: '#333',
              width: '120px'
            }}
          >
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              backgroundColor: '#e8f5e9', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '10px',
              fontSize: '24px',
              color: '#388e3c'
            }}>
              ➕
            </div>
            <span>Add User</span>
          </Link>
        </div>
      </div>
      
      <button 
        onClick={logout}
        style={{ 
          padding: '10px 15px', 
          backgroundColor: '#f44336', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default AdminHome;