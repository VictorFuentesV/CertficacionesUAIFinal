import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import '../CSS/profile.css';

function Profile() {
  const { t } = useTranslation();
  const { user, userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const navigateToAdminPanel = () => {
    navigate('/crearcuenta');
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">{t('profile.title')}</h2>
        {user && (
          <div className="profile-info">
            <p>
              <strong>{t('profile.email')}:</strong> {user.email}
            </p>
            {userInfo && (
              <div>
                <p>
                  <strong>{t('profile.name')}:</strong> {userInfo.name}
                </p>
                <p>
                  <strong>{t('profile.lastname')}:</strong> {userInfo.lastname}
                </p>
                <p>
                  <strong>{t('profile.career')}:</strong> {t(userInfo.career)}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="profile-button-container">
          <Button variant="primary" onClick={navigateToAdminPanel}>
            {t('profile.editButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
