import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import AppLayout from './components/AppLayout';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import UploadCertificate from './pages/UploadCertificate';
import ApproveCertificates from './pages/ApproveCertificates';
import CertificateDetail from './pages/CertificateDetail';
import VerifyCertificate from './pages/VerifyCertificate';
import LandingPage from './pages/LandingPage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  component: StudentDashboard,
});

const studentUploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student/upload',
  component: UploadCertificate,
});

const adminApproveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/approve',
  component: ApproveCertificates,
});

const certificateDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/certificate/$certificateId',
  component: CertificateDetail,
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify',
  component: VerifyCertificate,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  adminApproveRoute,
  studentRoute,
  studentUploadRoute,
  certificateDetailRoute,
  verifyRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
