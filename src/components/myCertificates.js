import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import '../CSS/myCertificates.css';
import { Container, Table, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';
import * as pdfjsLib from 'pdfjs-dist';

const CDNURL = "https://hvcusyfentyezvuopvzd.supabase.co/storage/v1/object/public/pdf/";

// Configurar la ruta local del worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';

function MyCertificates() {
  const { user, pdfs, addPdf, deletePdf } = useContext(UserContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [career, setCareer] = useState('');
  const [fileNameOptions, setFileNameOptions] = useState([]);
  const [pdfInfos, setPdfInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { t, i18n } = useTranslation();
  const [initialized, setInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
    setInitialized(true);
  }, [i18n]);

  useEffect(() => {
    if (user && user.id) {
      const fetchUserCareer = async () => {
        const { data, error } = await supabase
          .from('userinfo')
          .select('career')
          .eq('userid', user.id)
          .single();

        if (error) {
          console.error('Error fetching user career:', error);
        } else {
          setCareer(data.career);
          fetchFileNameOptions(data.career);
        }
      };

      fetchUserCareer();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user && user.id) {
        try {
          const { data, error } = await supabase
            .from('userinfo')
            .select('name, lastname')
            .eq('userid', user.id)
            .single();

          if (error) {
            console.error('Error fetching user info:', error);
          } else {
            setUserInfo({ name: data.name, lastname: data.lastname });
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, [user]);

  const fetchFileNameOptions = async (career) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('certificate_name')
        .eq('career', career);

      if (error) {
        console.error('Error fetching file name options:', error);
      } else {
        const options = data.map((cert) => cert.certificate_name);
        setFileNameOptions(options);
      }
    } catch (error) {
      console.error('Error fetching file name options:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleNewFileNameChange = (e) => {
    setNewFileName(e.target.value);
  };

  const readPDFContent = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textContent = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      const textItems = text.items.map(item => item.str);
      textContent += textItems.join(' ');
    }

    return textContent;
  };

  const verifyPDFContent = (content, firstName, lastName) => {
    return content.includes(firstName) && content.includes(lastName);
  };

  const uploadFile = async () => {
    if (selectedFile && newFileName && user && user.id && userInfo) {
      setUploading(true);
      const { name: firstName, lastname: lastName } = userInfo;

      console.log('Nombre del usuario:', firstName);
      console.log('Apellido del usuario:', lastName);

      try {
        // Obtener el tipo de validación del certificado
        const { data: certData, error: certError } = await supabase
          .from('certificates')
          .select('val_type')
          .eq('certificate_name', newFileName)
          .single();

        if (certError) {
          console.error('Error fetching certificate validation type:', certError);
          return;
        }

        const validationType = certData.val_type;

        if (validationType === 'automatic' || validationType === 'automatico') {
          const content = await readPDFContent(selectedFile);

          if (verifyPDFContent(content, firstName, lastName)) {
            const { data: storageData, error: storageError } = await supabase
              .storage
              .from('pdf')
              .upload(`${user.id}/${newFileName}`, selectedFile);

            if (storageError) {
              console.error('Error uploading file:', storageError);
              return;
            }

            const { error: dbError } = await supabase
              .from('pdfinfo')
              .insert({
                pdfname: newFileName,
                userid: user.id,
                career,
                verificate: true
              });

            if (dbError) {
              console.error('Error saving file info:', dbError);
              return;
            }

            await addPdf(selectedFile, newFileName);
            setSelectedFile(null);
            setNewFileName('');
            fetchAllPdfs();

            document.querySelector('input[type="file"]').value = '';
          } else {
            alert('El nombre y el apellido del usuario no se encontraron en el PDF.');
          }
        } else if (validationType === 'manual') {
          const { data: storageData, error: storageError } = await supabase
            .storage
            .from('pdf')
            .upload(`${user.id}/${newFileName}`, selectedFile);

          if (storageError) {
            console.error('Error uploading file:', storageError);
            return;
          }

          const { error: dbError } = await supabase
            .from('pdfinfo')
            .insert({
              pdfname: newFileName,
              userid: user.id,
              career,
              verificate: false
            });

          if (dbError) {
            console.error('Error saving file info:', dbError);
            return;
          }

          await addPdf(selectedFile, newFileName);
          setSelectedFile(null);
          setNewFileName('');
          fetchAllPdfs();

          document.querySelector('input[type="file"]').value = '';
        }
      } catch (error) {
        console.error('Error reading or verifying PDF:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const fetchAllPdfs = async () => {
    if (user && user.id) {
      try {
        const { data, error } = await supabase
          .from('pdfinfo')
          .select('*')
          .eq('userid', user.id);

        if (error) {
          throw error;
        }

        setPdfInfos(data);
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchAllPdfs();
    }
  }, [user]);

  return (
    <div className="my-certificates-container">
      <h2>{t('mycertificates.uploadefile')}</h2>
      <input 
        type="file" 
        onChange={handleFileChange} 
        className="my-certificates-input" 
      />
      <select 
        value={newFileName} 
        onChange={handleNewFileNameChange} 
        className="my-certificates-select"
      >
        <option value="">{t('mycertificates.filename')}</option>
        {fileNameOptions.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
      <button 
        onClick={uploadFile} 
        disabled={!selectedFile || !newFileName}
        className="my-certificates-button"
      >
        {t('mycertificates.filebutton')}
      </button>

      {uploading && (
        <Modal show={true} centered>
          <Modal.Body className="text-center">
            <Spinner animation="border" />
            <p>{t('mycertificates.uploading')}</p>
          </Modal.Body>
        </Modal>
      )}

      <h2>{t('mycertificates.myfiles')}</h2>
      <Container align="center" className="container-sm mt-4">
        <Table striped bordered hover className="my-certificates-table">
          <thead>
            <tr>
              <th>{t('mycertificates.pdfname')}</th>
              <th>{t('mycertificates.link')}</th>
              <th>{t('mycertificates.verificate')}</th>
            </tr>
          </thead>
          <tbody>
            {pdfInfos.map((pdf, index) => (
              <tr key={index}>
                <td data-label={t('mycertificates.pdfname')}>{pdf.pdfname}</td>
                <td data-label={t('mycertificates.link')}>
                  <a 
                    href={`${CDNURL}${user.id}/${pdf.pdfname}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {t('mycertificates.viewpdf')}
                  </a>
                </td>
                <td data-label={t('mycertificates.verificate')}>
                  {pdf.verificate ? t('mycertificates.verificateyes') : t('mycertificates.verificateno')}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </div>
  );
}

export default MyCertificates;

