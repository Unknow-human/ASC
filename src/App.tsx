import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import AdminPage from './AdminPage';
import PrivacyPage from './PrivacyPage';
import TermsPage from './TermsPage';
import PaymentSimulation from './PaymentSimulation';
import SuccessPage from './SuccessPage';
import { ConfigProvider } from './ConfigContext';
import { I18nProvider } from './i18n';

export default function App() {
  return (
    <ConfigProvider>
      <I18nProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/payment-sim" element={<PaymentSimulation />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </Router>
      </I18nProvider>
    </ConfigProvider>
  );
}
