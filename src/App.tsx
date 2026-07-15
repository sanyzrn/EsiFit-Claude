import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { I18nProvider } from './lib/i18n';
import { ThemeProvider } from './lib/theme';
import { LocaleFormatProvider } from './lib/locale-format-context';
import { AppShell } from './components/layout/AppShell';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute, RoleGate } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthBootstrap } from './components/AuthBootstrap';

const Home = lazy(() => import('./pages/Home'));
const CalculatorIndex = lazy(() => import('./pages/Calculators').then((m) => ({ default: m.CalculatorIndex })));
const CalculatorDetail = lazy(() => import('./pages/Calculators').then((m) => ({ default: m.CalculatorDetail })));
const ExerciseList = lazy(() => import('./pages/Exercises').then((m) => ({ default: m.ExerciseList })));
const ExerciseDetail = lazy(() => import('./pages/Exercises').then((m) => ({ default: m.ExerciseDetail })));
const ProgramList = lazy(() => import('./pages/Programs').then((m) => ({ default: m.ProgramList })));
const ProgramDetail = lazy(() => import('./pages/Programs').then((m) => ({ default: m.ProgramDetail })));
const DietList = lazy(() => import('./pages/Diet').then((m) => ({ default: m.DietList })));
const DietDetail = lazy(() => import('./pages/Diet').then((m) => ({ default: m.DietDetail })));
const BlogList = lazy(() => import('./pages/Blog').then((m) => ({ default: m.BlogList })));
const BlogDetail = lazy(() => import('./pages/Blog').then((m) => ({ default: m.BlogDetail })));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/Auth').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/Auth').then((m) => ({ default: m.ResetPassword })));
const DashboardOverview = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardOverview })));
const DashboardProfile = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardProfile })));
const DashboardPrograms = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardPrograms })));
const DashboardProgress = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardProgress })));
const DashboardChat = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardChat })));
const DashboardBilling = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardBilling })));
const Admin = lazy(() => import('./pages/Admin'));
const Coach = lazy(() => import('./pages/Coach'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <LocaleFormatProvider>
        <BrowserRouter>
        <AuthBootstrap />
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Auth: logo-only chrome — no full site nav */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Main site shell */}
              <Route element={<AppShell />}>
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

                {/* Client-side gates are UX only; JWT is verified on protected APIs */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
                <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardProfile /></ProtectedRoute>} />
                <Route path="/dashboard/programs" element={<ProtectedRoute><DashboardPrograms /></ProtectedRoute>} />
                <Route path="/dashboard/progress" element={<ProtectedRoute><DashboardProgress /></ProtectedRoute>} />
                <Route path="/dashboard/chat" element={<ProtectedRoute><DashboardChat /></ProtectedRoute>} />
                <Route path="/dashboard/billing" element={<ProtectedRoute><DashboardBilling /></ProtectedRoute>} />
                <Route path="/admin" element={<RoleGate roles={['ADMIN']}><Admin /></RoleGate>} />
                <Route path="/coach" element={<RoleGate roles={['COACH']}><Coach /></RoleGate>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
        </BrowserRouter>
        </LocaleFormatProvider>
    </I18nProvider>
    </ThemeProvider>
  );
}
