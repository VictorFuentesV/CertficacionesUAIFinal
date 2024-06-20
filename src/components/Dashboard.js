// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { supabase } from '../supabaseClient';
import '../CSS/dashboard.css';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const [studentsPerCareer, setStudentsPerCareer] = useState([]);
  const [topCertificates, setTopCertificates] = useState([]);
  const [certificatesPerCareer, setCertificatesPerCareer] = useState([]);
  const [pdfInfoCareerCount, setPdfInfoCareerCount] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStudentsPerCareer = async () => {
      const { data, error } = await supabase.from('userinfo').select('career');
      if (error) {
        console.error('Error fetching students per career:', error);
      } else {
        const careerCount = data.reduce((acc, user) => {
          acc[user.career] = (acc[user.career] || 0) + 1;
          return acc;
        }, {});

        const careerCountArray = Object.entries(careerCount).map(([career, count]) => ({
          career: t(`${career}`),
          count
        }));

        setStudentsPerCareer(careerCountArray);
      }
    };

    const fetchTopCertificates = async () => {
      const { data, error } = await supabase.from('pdfinfo').select('verificate, pdfname');
      if (error) {
        console.error('Error fetching top certificates:', error);
      } else {
        const certificateCount = data.reduce((acc, { pdfname }) => {
          acc[pdfname] = (acc[pdfname] || 0) + 1;
          return acc;
        }, {});

        const sortedCertificates = Object.entries(certificateCount)
          .map(([pdfname, count]) => ({ pdfname, count }))
          .sort((a, b) => b.count - a.count);

        setTopCertificates(sortedCertificates);
      }
    };

    const fetchCertificatesPerCareer = async () => {
      const { data, error } = await supabase.from('certificates').select('*');
      if (error) {
        console.error('Error fetching certificates per career:', error);
      } else {
        const careerCertificates = data.reduce((acc, cert) => {
          acc[cert.career] = (acc[cert.career] || 0) + 1;
          return acc;
        }, {});

        const careerCertificatesArray = Object.entries(careerCertificates).map(([career, count]) => ({
          career: t(`${career}`),
          count
        }));

        setCertificatesPerCareer(careerCertificatesArray);
      }
    };

    const fetchPdfInfoCareerCount = async () => {
      const { data, error } = await supabase.from('pdfinfo').select('career');
      if (error) {
        console.error('Error fetching pdfinfo career data:', error);
      } else {
        const careerCount = data.reduce((acc, { career }) => {
          acc[career] = (acc[career] || 0) + 1;
          return acc;
        }, {});

        const careerCountArray = Object.entries(careerCount).map(([career, count]) => ({
          career: t(`${career}`),
          count
        }));

        setPdfInfoCareerCount(careerCountArray);
      }
    };

    fetchStudentsPerCareer();
    fetchTopCertificates();
    fetchCertificatesPerCareer();
    fetchPdfInfoCareerCount();
  }, [t]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">{t('dashboard.title')}</h1>
      <div className="chart-container">
        <div className="chart-wrapper">
          <div className="chart">
            <h2 className="chart-title">{t('dashboard.chart1')}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={studentsPerCareer} layout="vertical" barGap={10} barCategoryGap={20}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="career" width={200} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} layout="horizontal" verticalAlign="bottom" align="center" />
                <Bar dataKey="count" fill="#FF6384" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-wrapper">
          <div className="chart">
            <h2 className="chart-title">{t('dashboard.chart2')}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={certificatesPerCareer} layout="vertical" barGap={10} barCategoryGap={20}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="career" width={200} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} layout="horizontal" verticalAlign="bottom" align="center" />
                <Bar dataKey="count" fill="#36A2EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-wrapper">
          <div className="chart">
            <h2 className="chart-title">{t('dashboard.chart4')}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={pdfInfoCareerCount} layout="vertical" barGap={10} barCategoryGap={20}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="career" width={200} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} layout="horizontal" verticalAlign="bottom" align="center" />
                <Bar dataKey="count" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="list-wrapper">
          <h2 className="list-title">{t('dashboard.chart3')}</h2>
          <ul className="certificate-list">
            {topCertificates.map((item, index) => (
              <li key={index} className="certificate-item">
                <span className="certificate-name">{item.pdfname}</span>
                <span className="certificate-count">
                  {item.count} {t('dashboard.user2')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
