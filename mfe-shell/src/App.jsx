import React, { Suspense, lazy } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Box, Snackbar, Alert } from "@mui/material"
import Navbar from './components/Navbar';
import { Loader } from "@data-hygiene/ui";

// Remote MFEs
const RecordsListPage = lazy(() => import('dashboard/RecordsListPage'));
const DetailsPage = lazy(() => import('details/DetailsPage'));
const LoginPage = lazy(() => import('auth/LoginPage'));

const App = () => {
  const location = useLocation();
  const [loginSuccess, setLoginSuccess] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem("login_success")) {
      setLoginSuccess(true);
      localStorage.removeItem("login_success");
    }
  }, []);

  const isAuthenticated = !!localStorage.getItem("auth_token");
  const isLoginPage = location.pathname === "/login";

  // Redirect to login if not authenticated and not already on login page
  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {!isLoginPage && <Navbar />}
      <Box sx={{ pt: isLoginPage ? 0 : 7 }}> 
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RecordsListPage key="landing" mode="landing" />} />
            <Route path="/active" element={<RecordsListPage key="active" mode="active" />} />
            <Route path="/completed" element={<RecordsListPage key="completed" mode="completed" />} />
            <Route path="/on-hold" element={<RecordsListPage key="onhold" mode="onhold" />} />
            <Route path="/all" element={<RecordsListPage key="all" mode="all" />} />
            <Route path="/:id" element={<DetailsPage />} />
          </Routes>
        </Suspense>
      </Box>

      <Snackbar
        open={loginSuccess}
        autoHideDuration={4000}
        onClose={() => setLoginSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setLoginSuccess(false)} severity="success" variant="filled" sx={{ width: "100%" }}>
          Login successful
        </Alert>
      </Snackbar>
    </>
  )
}

export default App
