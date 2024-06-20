import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import 'bootstrap-icons/font/bootstrap-icons.css';

function NavBar() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    navigate('/home');
  }

  async function getUserRole(userId) {
    const { data, error } = await supabase
      .from('userinfo')
      .select('role')
      .eq('userid', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    return data.role;
  }

  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    setSession(session);

    if (session) {
      const userRole = await getUserRole(session.user.id);
      setRole(userRole);
    }
  };

  useEffect(() => {
    const unsubscribe = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getUserRole(session.user.id).then(role => setRole(role));
      } else {
        setRole(null);
      }
    });

    return () => {
      typeof unsubscribe === 'function' && unsubscribe();
    };
  }, []);

  useEffect(() => {
    getSession();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-3">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className="nav-link fs-5 text-white"
                to="/home"
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: '#034574',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                      }
                    : {}
                }
              >
                {t('navbar.home')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link fs-5 text-white"
                to="/carreras"
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: '#034574',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                      }
                    : {}
                }
              >
                {t('navbar.certificates')}
              </NavLink>
            </li>
            {session && role === 'Estudiante' && (
              <li className="nav-item">
                <NavLink
                  className="nav-link fs-5 text-white"
                  to="/miscertificados"
                  style={({ isActive }) =>
                    isActive
                      ? {
                          backgroundColor: '#034574',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem',
                        }
                      : {}
                  }
                >
                  {t('navbar.myCertificates')}
                </NavLink>
              </li>
            )}
            {session && role === 'Administrador' && (
              <li className="nav-item">
                <NavLink
                  className="nav-link fs-5 text-white"
                  to="/administracion"
                  style={({ isActive }) =>
                    isActive
                      ? {
                          backgroundColor: '#034574',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem',
                        }
                      : {}
                  }
                >
                  {t('navbar.admin')}
                </NavLink>
              </li>
            )}
            {session && role === 'Administrador' && (
              <li className="nav-item">
                <NavLink
                  className="nav-link fs-5 text-white"
                  to="/estadisticas"
                  style={({ isActive }) =>
                    isActive
                      ? {
                          backgroundColor: '#034574',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem',
                        }
                      : {}
                  }
                >
                  {t('navbar.stats')}
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              {session ? (
                <button className="btn btn-outline-light me-2" onClick={handleLogout}>
                  {t('navbar.logOut')}
                </button>
              ) : (
                <NavLink
                  className="nav-link fs-5 text-white"
                  to="/login"
                  style={({ isActive }) =>
                    isActive
                      ? {
                          backgroundColor: '#034574',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem',
                        }
                      : {}
                  }
                >
                  {t('navbar.logIn')}
                </NavLink>
              )}
            </li>
            {session && (
              <li className="nav-item">
                <NavLink
                  className="nav-link fs-5 text-white"
                  to="/profile"
                  style={({ isActive }) =>
                    isActive
                      ? {
                          backgroundColor: '#034574',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem',
                        }
                      : {}
                  }
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {t('navbar.account')}
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;