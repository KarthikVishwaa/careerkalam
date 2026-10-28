import { lazy, Suspense, useEffect, useState } from 'react';
import Welcome from './pages/Welcome.jsx';
import StudentDetails from './pages/StudentDetails.jsx';
import Payment from './pages/Payment.jsx';
import Assessment from './pages/Assessment.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// recharts (the biggest dependency by far) is only needed on the results page,
// which most visitors in any given session won't reach yet (still on details/
// payment/the question flow) — code-split so it doesn't weigh down everything else.
const Results = lazy(() => import('./pages/Results.jsx'));

export const ASSESSMENT_ID_KEY = 'sc_assessment_id';

export function navigate(hash) {
  window.location.hash = hash;
}

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  const path = hash.replace(/^#/, '') || '/';
  const isAdmin = path.startsWith('/admin');

  let page;
  if (path.startsWith('/admin/dashboard')) {
    page = <AdminDashboard />;
  } else if (path.startsWith('/admin')) {
    page = <AdminLogin />;
  } else if (path.startsWith('/details')) {
    page = <StudentDetails />;
  } else if (path.startsWith('/pay')) {
    page = <Payment />;
  } else if (path.startsWith('/assessment')) {
    page = <Assessment />;
  } else if (path.startsWith('/results')) {
    page = (
      <Suspense fallback={<div className="sc-center"><div className="sc-spinner" /></div>}>
        <Results />
      </Suspense>
    );
  } else {
    page = <Welcome />;
  }

  return (
    <>
      {!isAdmin && (
        <>
          <div className="sc-side-watermark sc-side-watermark-left sc-no-print" aria-hidden="true" />
          <div className="sc-side-watermark sc-side-watermark-right sc-no-print" aria-hidden="true" />
        </>
      )}
      <div className={isAdmin ? 'sc-admin-shell-root' : 'sc-shell'}>
        {!isAdmin && (
          <header className="sc-header sc-no-print">
            <a href="https://careerkalam360.com" className="sc-wordmark">
              CareerKalam360
            </a>
          </header>
        )}
        {page}
      </div>
    </>
  );
}
