'use server';

export async function triggerWebsiteRevalidation(tag: 'hero' | 'gallery' | 'events' | 'team') {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REVALIDATION_TOKEN}`,
      },
      body: JSON.stringify({ tag }),
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Revalidation failed with status code: ${res.status}`);
    }
  } catch (error) {
    console.error('Failed to trigger website revalidation:', error);
  }
}

export async function triggerHackXWebsiteRevalidation() {
  try {
    const websiteUrl = process.env.HACKX_WEBSITE_URL || 'https://hackx-40.vercel.app';
    const token = process.env.HACKX_REVALIDATION_TOKEN;
    if (!token) {
      console.warn('HACKX_REVALIDATION_TOKEN is not set, skipping HackX revalidation trigger.');
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${websiteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tag: 'hackx-team' }),
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`HackX website revalidation failed with status code: ${res.status}`);
    }
  } catch (error) {
    console.error('Failed to trigger HackX website revalidation:', error);
  }
}

