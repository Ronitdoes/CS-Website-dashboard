'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type AuthState = {
  error?: string;
  success?: boolean;
} | null;

export async function getHackXAdminEmails(): Promise<string[]> {
  const envEmails = [
    process.env.HACKX_ADMIN_EMAIL_VIDHYANSHU,
    process.env.HACKX_ADMIN_EMAIL_RONIT,
    process.env.HACKX_ADMIN_EMAIL_TANMAY,
  ]
    .filter(Boolean)
    .map(e => e!.trim().toLowerCase());

  const hardcoded = ['vidhyanshu@ieeecs.com', 'ronit@ieeecs.com', 'tanmay@ieeecs.com'];
  return Array.from(new Set([...envEmails, ...hardcoded]));
}

export async function isHackXAdmin(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const allowed = await getHackXAdminEmails();
  return allowed.includes(normalized);
}

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please fill out both email and password fields.' };
  }

  const normalizedInputEmail = email.trim().toLowerCase();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminEmail1 = process.env.ADMIN_EMAIL1?.trim().toLowerCase();
  const adminPassword1 = process.env.ADMIN_PASSWORD1?.trim();
  const adminEmail2 = process.env.ADMIN_EMAIL2?.trim().toLowerCase();
  const adminPassword2 = process.env.ADMIN_PASSWORD2?.trim();

  const hVidhyanshuEmail = process.env.HACKX_ADMIN_EMAIL_VIDHYANSHU?.trim().toLowerCase();
  const hVidhyanshuPass = process.env.HACKX_ADMIN_PASSWORD_VIDHYANSHU?.trim();
  const hRonitEmail = process.env.HACKX_ADMIN_EMAIL_RONIT?.trim().toLowerCase();
  const hRonitPass = process.env.HACKX_ADMIN_PASSWORD_RONIT?.trim();
  const hTanmayEmail = process.env.HACKX_ADMIN_EMAIL_TANMAY?.trim().toLowerCase();
  const hTanmayPass = process.env.HACKX_ADMIN_PASSWORD_TANMAY?.trim();

  const sessionToken = process.env.ADMIN_SESSION_TOKEN;

  const validCredentials = [
    { email: adminEmail, password: adminPassword },
    { email: adminEmail1, password: adminPassword1 },
    { email: adminEmail2, password: adminPassword2 },
    { email: hVidhyanshuEmail, password: hVidhyanshuPass },
    { email: hRonitEmail, password: hRonitPass },
    { email: hTanmayEmail, password: hTanmayPass },
  ].filter(c => c.email && c.password);

  const matched = validCredentials.find(
    cred => normalizedInputEmail === cred.email && password === cred.password
  );

  if (!matched) {
    return { error: 'Invalid email or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_session', sessionToken!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set('admin_email', normalizedInputEmail, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/admin');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  cookieStore.delete('admin_email');
  redirect('/login');
}

