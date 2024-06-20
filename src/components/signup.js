import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../CSS/signup.css'; // Importa los estilos CSS
import { useTranslation } from 'react-i18next';
import signupImage from '../pictures/LogoUAI.png'; // Importa la imagen

const SignUp = () => {
  const { t, i18n } = useTranslation();
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
    setInitialized(true);
  }, [i18n]);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  function handleChange(event) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      alert('Check your email for verification link');
      navigate('/crearcuenta');
    } catch (error) {
      alert(error);
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <img src={signupImage} alt="Sign Up" className="signup-image" /> {/* Añadir la imagen aquí */}
        <h2 className="signup-title">{t('signup.title')}</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            className="signup-input"
            placeholder= {t('signup.email')}
            name="email"
            type="email"
            onChange={handleChange}
            value={formData.email}
            required
          />
          <input
            className="signup-input"
            placeholder= {t('signup.password')}
            name="password"
            type="password"
            onChange={handleChange}
            value={formData.password}
            required
          />
          <button className="signup-button" type="submit">{t('signup.submitbutton')}</button>
        </form>
        <div className="signup-link">
        {t('signup.text')} <Link to="/login">{t('signup.login')}</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;