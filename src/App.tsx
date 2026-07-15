import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { I18nProvider } from './lib/i18n';
import Layout from './components/Layout';
import Home from './pages/Home';
import { CalculatorIndex, CalculatorDetail } from './pages/Calculators';
import { ExerciseList, ExerciseDetail } from './pages/Exercises';
import { ProgramList, ProgramDetail } from './pages/Programs';
import { DietList, DietDetail } from './pages/Diet';
import { BlogList, BlogDetail } from './pages/Blog';
import Pricing from './pages/Pricing';
import { Login, Register, ForgotPassword } from './pages/Auth';
import {
  DashboardOverview, DashboardProfile, DashboardPrograms,
  DashboardProgress, DashboardChat, DashboardBilling
} from './pages/Dashboard';
import Admin from './pages/Admin';
import Coach from './pages/Coach';
import NotFound from './pages/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/exercises" element={<ExerciseList />} />
              <Route path="/exercises/:slug" element={<ExerciseDetail />} />
              <Route path="/programs" element={<ProgramList />} />
              <Route path="/programs/:slug" element={<ProgramDetail />} />
              <Route path="/diet" element={<DietList />} />
              <Route path="/diet/:slug" element={<DietDetail />} />
              <Route path="/calculators" element={<CalculatorIndex />} />
              <Route path="/calculators/:slug" element={<CalculatorDetail />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/dashboard/profile" element={<DashboardProfile />} />
              <Route path="/dashboard/programs" element={<DashboardPrograms />} />
              <Route path="/dashboard/progress" element={<DashboardProgress />} />
              <Route path="/dashboard/chat" element={<DashboardChat />} />
              <Route path="/dashboard/billing" element={<DashboardBilling />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/coach" element={<Coach />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </BrowserRouter>
    </I18nProvider>
  );
}
