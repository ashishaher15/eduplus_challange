import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import { validateForm } from '../utils/validators';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData, ['name', 'email', 'address', 'password', 'role']);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const userData = await authApi.registerUser(formData);
      login(userData);
      
      // Redirect based on role
      switch (userData.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'store_owner':
          navigate('/owner');
          break;
        default:
          navigate('/user');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ general: error.error || 'Registration failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Register</h1>
      
      {errors.general && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{errors.general}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            Name (20-60 characters)
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
          <div style={{ fontSize: '12px', marginTop: '2px' }}>
            Character count: {formData.name.length}/60
          </div>
          {errors.name && <div style={{ color: 'red', fontSize: '14px' }}>{errors.name}</div>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.email && <div style={{ color: 'red', fontSize: '14px' }}>{errors.email}</div>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>
            Address (max 400 characters)
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', minHeight: '60px' }}
          />
          <div style={{ fontSize: '12px', marginTop: '2px' }}>
            Character count: {formData.address.length}/400
          </div>
          {errors.address && <div style={{ color: 'red', fontSize: '14px' }}>{errors.address}</div>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password (8-16 characters, at least one uppercase and one special character)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.password && <div style={{ color: 'red', fontSize: '14px' }}>{errors.password}</div>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '5px' }}>Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
          </select>
          {errors.role && <div style={{ color: 'red', fontSize: '14px' }}>{errors.role}</div>}
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default RegisterPage;