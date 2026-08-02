import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HackXManagerClient from './HackXManagerClient';

export default async function HackXAdminPage() {
  const cookieStore = await cookies();
  const userEmail = (cookieStore.get('admin_email')?.value || '').toLowerCase();

  const isAuthorized =
    userEmail.includes('vidhyanshu') ||
    userEmail.includes('ronit') ||
    userEmail.includes('tanmay');

  if (!isAuthorized) {
    redirect('/admin');
  }

  return <HackXManagerClient />;
}
