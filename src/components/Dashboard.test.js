import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { supabase } from '../supabaseClient';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Assuming you have i18n configuration

// Mock data for testing
const mockUserInfo = [{ career: '0' }, { career: '1' }];
const mockPdfInfo = [{ verificate: 'some verification info', pdfname: 'some_pdf.pdf' }];
const mockCertificates = [{ career: '0' }, { career: '1' }];
const mockPdfInfoData = [{ some: 'pdf', info: 'data' }];

// Mock the supabase client
jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Analytics Dashboard heading', async () => {
    supabase.from.mockImplementation((table) => {
      switch (table) {
        case 'userinfo':
          return { select: jest.fn().mockResolvedValue({ data: mockUserInfo, error: null }) };
        case 'pdfinfo':
          return { select: jest.fn().mockResolvedValue({ data: mockPdfInfo, error: null }) };
        case 'certificates':
          return { select: jest.fn().mockResolvedValue({ data: mockCertificates, error: null }) };
        case 'pdfInfo':
          return { select: jest.fn().mockResolvedValue({ data: mockPdfInfoData, error: null }) };
        default:
          return { select: jest.fn().mockResolvedValue({ data: [], error: null }) };
      }
    });

    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );

    const headingElement = await screen.findByText(i18n.t('dashboard.title')); // Adjust translation
    expect(headingElement).toBeInTheDocument();
  });

  test('fetches and renders number of students per career chart', async () => {
    supabase.from.mockImplementation((table) => {
      switch (table) {
        case 'userinfo':
          return { select: jest.fn().mockResolvedValue({ data: mockUserInfo, error: null }) };
        case 'pdfinfo':
          return { select: jest.fn().mockResolvedValue({ data: mockPdfInfo, error: null }) };
        case 'certificates':
          return { select: jest.fn().mockResolvedValue({ data: mockCertificates, error: null }) };
        case 'pdfInfo':
          return { select: jest.fn().mockResolvedValue({ data: mockPdfInfoData, error: null }) };
        default:
          return { select: jest.fn().mockResolvedValue({ data: [], error: null }) };
      }
    });

    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );

    const chartElement = await screen.findByText(i18n.t('dashboard.chart1')); // Adjust translation
    expect(chartElement).toBeInTheDocument();
  });

  test('fetches and renders number of certificates per career chart', async () => {
    // Same implementation as the previous test case
    supabase.from.mockImplementation((table) => {
      switch (table) {
        case 'userinfo':
          return { select: jest.fn().mockResolvedValue({ data: mockUserInfo, error: null }) };
        case 'pdfinfo':
          return { select: jest.fn().mockResolvedValue({ data: mockPdfInfo, error: null }) };
        case 'certificates':
          return { select: jest.fn().mockResolvedValue({ data: mockCertificates, error: null }) };
        case 'pdfInfo':
          return { select: jest.fn().mockResolvedValue({ data: mockPdfInfoData, error: null }) };
        default:
          return { select: jest.fn().mockResolvedValue({ data: [], error: null }) };
      }
    });

    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );

    const chartElement = await screen.findByText(i18n.t('dashboard.chart2')); // Adjust translation
    expect(chartElement).toBeInTheDocument();
  });
  test('fetches and renders most common certificates list', async () => {
    // Mock data for the certificate item
    const mockCertificateItem = { pdfname: 'some_pdf.pdf', count: 1 };

    supabase.from.mockImplementation((table) => {
      switch (table) {
        case 'userinfo':
          return { select: jest.fn().mockResolvedValue({ data: mockUserInfo, error: null }) };
        case 'pdfinfo':
          return { select: jest.fn().mockResolvedValue({ data: mockPdfInfo, error: null }) };
        case 'certificates':
          return { select: jest.fn().mockResolvedValue({ data: mockCertificates, error: null }) };
        case 'pdfInfo':
          return { select: jest.fn().mockResolvedValue({ data: mockPdfInfoData, error: null }) };
        default:
          return { select: jest.fn().mockResolvedValue({ data: [], error: null }) };
      }
    });

    render(
      <I18nextProvider i18n={i18n}>
        <Dashboard />
      </I18nextProvider>
    );

    const listElement = await screen.findByText(i18n.t('dashboard.chart3')); // Adjust translation
    expect(listElement).toBeInTheDocument();

    // Construct the expected text with dynamic elements
    const expectedText = i18n.t('{{pdfName}} (dashboard.user {{count}} dashboard.user2)', {
      pdfName: mockCertificateItem.pdfname,
      count: mockCertificateItem.count,
    });

    const certificateItem = await screen.findByText(expectedText); // Adjust translation
    expect(certificateItem).toBeInTheDocument();
  });
});
