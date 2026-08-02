import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HackXRedirectPage() {
  const cookieStore = await cookies();
  const userEmail = (cookieStore.get('admin_email')?.value || '').toLowerCase();

  const isAuthorized =
    userEmail.includes('vidhyanshu') ||
    userEmail.includes('ronit') ||
    userEmail.includes('tanmay');

  if (!isAuthorized) {
    redirect('/admin');
  }

  redirect('/admin/hackx');
}

