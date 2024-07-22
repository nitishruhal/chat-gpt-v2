
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login-signup.css';
import logo from "./img/Achievers.png";

const Login = () => {
  const [formData, setFormData] = useState({
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
      const response = await axios.post('http://localhost:5000/login', formData);
      console.log(response);
      if (response.data.message === 'Login successful') {
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem("token", response.data.token);
        console.log(response.token);

        localStorage.setItem('user', JSON.stringify(response.data.result)); // Store user data including username
        navigate('/gpt-app'); // Use navigate to redirect
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
    }
  };

  return (
    <section className="Box">
      <div className="heading">
        <img src={logo} alt="logo" />
        <h1>LOG IN</h1>
      </div>
      <div className="form">
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit">Login</button>
          <br/>
          <p>Not Signed Up? <span onClick={() => { navigate('/signup') }}>Sign UP</span></p>

        </form>
      </div>
    </section>
  );
};

export default Login;
