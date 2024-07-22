import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login-signup.css';
import logo from "./img/Achievers.png";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signup', formData);
      if (response.data.message === 'Signup successful') {
        alert("Signup successful");
        navigate('/'); // Use navigate to redirect to the login page
      } else {
        alert("Signup failed");
      }
    } catch (error) {
      console.error('An error occurred during signup:', error);
      alert("Signup failed");
    }
  };

  return (
    <section className="Box">
      <div className='heading'>
        <img src={logo} alt="logo" />
        <h1>Signup</h1>
      </div>
      <div className="form">
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit">Signup</button>
        </form>
        <br />
        <a href="/">Already have an account? Login</a>
      </div>
    </section>
  );
};

export default Signup;