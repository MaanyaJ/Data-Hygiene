import React, { Suspense, lazy, useState, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import { Box, Snackbar, Alert} from "@mui/material"
import Navbar from './components/Navbar';
import { Loader, PageNotFound, ProtectedRoute, GuestRoute, useSnackbar } from "@data-hygiene/ui";

// Remote MFEs
const RecordsListPage = lazy(() => import('dashboard/RecordsListPage'));
const DetailsPage = lazy(() => import('details/DetailsPage'));
const LoginPage = lazy(() => import('auth/LoginPage'));

// Layout for pages that should have a Navbar
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Box sx={{ pt: 7 }}> 
        <Outlet />
      </Box>
    </>
  );
};

const App = () => {
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("login_success")) {
      showSnackbar("Login successful", "success");
      localStorage.removeItem("login_success");
    }
  }, [showSnackbar]);

  return (
    <>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes (No Navbar) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Private Protected Routes (With Navbar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<RecordsListPage key="landing" mode="landing" />} />
              <Route path="/active" element={<RecordsListPage key="active" mode="active" />} />
              <Route path="/completed" element={<RecordsListPage key="completed" mode="completed" />} />
              <Route path="/on-hold" element={<RecordsListPage key="onhold" mode="onhold" />} />
              <Route path="/all" element={<RecordsListPage key="all" mode="all" />} />
              <Route path="/details/:id" element={<DetailsPage />} />
            </Route>
          </Route>

          {/* 404 Not Found (No Navbar) */}
          <Route path="*" element= {<PageNotFound/> }/>
        </Routes>
      </Suspense>

      {SnackbarComponent}
    </>
  )
}

export default App
