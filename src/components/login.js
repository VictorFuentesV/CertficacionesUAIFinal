import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../CSS/login.css'; // Importa los estilos CSS
import { useTranslation } from 'react-i18next';
import loginImage from '../pictures/LogoUAI.png'; // Importa la imagen

const Login = ({ setToken }) => {
  const { t, i18n } = useTranslation();
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
    setInitialized(true);
  }, [i18n]);

  let navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', password: ''
  });

  function handleChange(event) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      setToken(data);
      navigate('/home');
    } catch (error) {
      alert(error);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={loginImage} alt="Login" className="login-image" /> {/* Añadir la imagen aquí */}
        <h2 className="login-title">{t('login.title')}</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input 
            className="login-input"
            placeholder= {t('login.email')}
            name='email'
            type="email"
            onChange={handleChange}
            required
          />
          <input 
            className="login-input"
            placeholder= {t('login.password')}
            name='password'
            type="password"
            onChange={handleChange}
            required
          />
          <button className="login-button" type='submit'>{t('login.submitbutton')}</button>
        </form>
        <div className="login-link">
        {t('login.text')} <Link to='/signup'>{t('login.signup')}</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;