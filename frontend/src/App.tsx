import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { SessionProvider } from './lib/session';
import Workspace from './components/Workspace';
import AuthPage from './pages/AuthPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import NotificationsPage from './pages/NotificationsPage';
import { Loading } from './components/ui';
import './App.css';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const client = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 20_000, refetchOnWindowFocus: true },
  },
});
export default function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <SessionProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<AuthPage key="login" />} />
              <Route
                path="/register"
                element={<AuthPage key="register" register />}
              />
              <Route element={<Workspace />}>
                <Route index element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route
                  path="*"
                  element={
                    <div>
                      <h1>Page not found</h1>
                      <p>This page may have moved.</p>
                      <Link className="button" to="/">
                        Back to overview
                      </Link>
                    </div>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </SessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
