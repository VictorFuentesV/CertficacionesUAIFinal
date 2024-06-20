import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Container, Table, Button, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../CSS/admin.css';
import log from '../logger';

const CDNURL = "https://hvcusyfentyezvuopvzd.supabase.co/storage/v1/object/public/pdf/";

const AdminPage = () => {
  const [pdfInfos, setPdfInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const [initialized, setInitialized] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pdfToVerify, setPdfToVerify] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
    setInitialized(true);
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  useEffect(() => {
    const fetchAllPdfs = async () => {
      log.debug('Fetching all PDFs from database');
      try {
        const { data: pdfsData, error: pdfsError } = await supabase
          .from('pdfinfo')
          .select('pdfname, userid, verificate');

        if (pdfsError) {
          throw pdfsError;
        }

        const pdfInfos = [];

        for (const pdf of pdfsData) {
          const { data: userInfo, error: userError } = await supabase
            .from('userinfo')
            .select('name, lastname, career')
            .eq('userid', pdf.userid)
            .single();

          if (userError) {
            log.error('Error fetching user info:', userError);
            continue;
          }

          const { data: certificateInfo, error: certificateError } = await supabase
            .from('certificates')
            .select('val_type')
            .eq('certificate_name', pdf.pdfname)
            .single();

          if (certificateError) {
            log.error('Error fetching certificate info:', certificateError);
            continue;
          }

          pdfInfos.push({
            fileName: pdf.pdfname,
            userId: pdf.userid,
            verificate: pdf.verificate,
            verificationType: certificateInfo.val_type,
            ...userInfo
          });
        }

        setPdfInfos(pdfInfos);
        log.info('PDFs and user info successfully fetched');
      } catch (error) {
        log.error('Error fetching PDFs and user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPdfs();
  }, []);

  const handleVerify = async (pdf) => {
    log.debug(`Verifying PDF: ${pdf.fileName} for user: ${pdf.userId}`);
    try {
      const currentDate = new Date().toISOString();
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;

      const { error } = await supabase
        .from('pdfinfo')
        .update({ verificate: true, time_ver: currentDate, user_ver: userEmail })
        .eq('pdfname', pdf.fileName)
        .eq('userid', pdf.userId);

      if (error) {
        throw error;
      }

      setPdfInfos((prevPdfInfos) =>
        prevPdfInfos.map((p) =>
          p.fileName === pdf.fileName && p.userId === pdf.userId
            ? { ...p, verificate: true }
            : p
        )
      );

      log.info(`PDF verified successfully: ${pdf.fileName}`);
      setShowConfirmModal(false); // Close the modal after successful verification
    } catch (error) {
      log.error('Error verifying PDF:', error);
    }
  };

  const navigateToAdminPanel = () => {
    navigate('/tipovalidacion');
  };

  const handleVerifyClick = (pdf) => {
    setPdfToVerify(pdf);
    setShowConfirmModal(true);
  };

  const handleConfirmVerify = () => {
    if (pdfToVerify) {
      handleVerify(pdfToVerify);
    }
  };

  const handleCancelVerify = () => {
    setPdfToVerify(null);
    setShowConfirmModal(false);
  };

  return (
    <Container align="center" className="container-sm mt-4">
      <h1>{t('admin.title')}</h1>
      <Button variant="primary" onClick={navigateToAdminPanel} className="mb-4">
        {t('admin.admin2button')}
      </Button>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" role="status">
            <span className="sr-only"></span>
          </Spinner>
          <span className="ml-2">   {t('admin.loading')}</span>
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('admin.pdfname')}</th>
              <th>{t('admin.username')}</th>
              <th>{t('admin.career')}</th>
              <th>{t('admin.vertype')}</th>
              <th>{t('admin.status')}</th>
              <th>{t('admin.link')}</th>
            </tr>
          </thead>
          <tbody>
            {pdfInfos.map((pdf, index) => (
              <tr key={index}>
                <td>{pdf.fileName}</td>
                <td>{`${pdf.name} ${pdf.lastname}`}</td>
                <td>{t(pdf.career)}</td>
                <td>{pdf.verificationType === 'manual' ? t('admin.manual') : pdf.verificationType === 'automatic' ? t('admin.automatic') : t('admin.automatic')}</td>
                <td>
                  {pdf.verificate ? (
                    <span>{t('admin.verification')}</span>
                  ) : (
                    pdf.verificationType === 'manual' && (
                      <Button
                        variant="success"
                        onClick={() => handleVerifyClick(pdf)}
                        className="ml-2 custom-button"
                      >
                        {t('admin.verbutton')}
                      </Button>
                    )
                  )}
                </td>
                <td>
                  <a
                    href={`${CDNURL}${pdf.userId}/${pdf.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('admin.viewpdf')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showConfirmModal} onHide={handleCancelVerify} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('admin.alerttitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('admin.alertInfo')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelVerify}>
            {t('admin.alertno')}
          </Button>
          <Button variant="primary" onClick={handleConfirmVerify}>
            {t('admin.alertyes')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPage;
