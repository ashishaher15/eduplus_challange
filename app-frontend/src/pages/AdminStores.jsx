import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminApi from '../api/adminApi';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    // Fetch stores
    const fetchStores = async () => {
      try {
        const data = await adminApi.getAllStores();
        setStores(data);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStores();
  }, [user, navigate]);
  
  // Filter stores based on search term
  const filteredStores = searchTerm
    ? stores.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        store.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : stores;
  
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Stores</h1>
        <div>
          <Link 
            to="/admin/stores/new"
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            Create Store
          </Link>
          <Link 
            to="/admin"
            style={{
              padding: '8px 16px',
              backgroundColor: '#607d8b',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '250px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      
      {isLoading ? (
        <div>Loading stores...</div>
      ) : filteredStores.length === 0 ? (
        <div>No stores found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Address</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(store => (
                <tr key={store.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{store.id}</td>
                  <td style={{ padding: '12px' }}>{store.name}</td>
                  <td style={{ padding: '12px' }}>{store.email}</td>
                  <td style={{ padding: '12px' }}>{store.address}</td>
                  <td style={{ padding: '12px' }}>
                    {`${parseFloat(store.averageRating).toFixed(2)} (${store.ratingsCount} votes)`}
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

export default AdminStores;