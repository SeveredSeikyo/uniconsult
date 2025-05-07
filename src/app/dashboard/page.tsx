// app/login/page.tsx
import { Suspense } from 'react';
import DashPage from './DashPage';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <DashPage />
    </Suspense>
  );
}
