'use server';

import sql from '../db';
import { HackXMember, NewHackXMember } from '../types';
import { triggerHackXWebsiteRevalidation } from './revalidate';

export async function getAdminHackXMembersAction(): Promise<HackXMember[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const rows = await sql`
        SELECT
          id, name, role,
          image_url      AS "imageUrl",
          "group",
          COALESCE(year, '2026') AS "year",
          email,
          linkedin_url   AS "linkedinUrl",
          instagram_url  AS "instagramUrl",
          github_url     AS "githubUrl",
          display_order  AS "displayOrder",
          is_active      AS "isActive",
          created_at     AS "createdAt",
          updated_at     AS "updatedAt"
        FROM hackx_members
        ORDER BY
          COALESCE(year, '2026') DESC,
          CASE "group" 
            WHEN 'convener' THEN 1 
            WHEN 'faculty' THEN 2 
            WHEN 'core' THEN 3 
            WHEN 'ec' THEN 4 
            ELSE 5 
          END,
          display_order ASC
      `;
      return rows as unknown as HackXMember[];
    } catch (error) {
      lastError = error as Error;
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  throw lastError || new Error('Failed to fetch HackX members');
}

export async function createHackXMemberAction(data: Omit<NewHackXMember, 'id' | 'displayOrder' | 'createdAt' | 'updatedAt'>) {
  try {
    const name = data.name ?? '';
    const role = data.role ?? '';
    const imageUrl = data.imageUrl ?? '';
    const group = data.group ?? 'core';
    const year = data.year ?? '2026';
    const email = data.email ?? null;
    const linkedinUrl = data.linkedinUrl ?? null;
    const instagramUrl = data.instagramUrl ?? null;
    const githubUrl = data.githubUrl ?? null;
    const isActive = data.isActive ?? true;

    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM hackx_members WHERE "group" = ${group} AND COALESCE(year, '2026') = ${year}`;
    await sql`
      INSERT INTO hackx_members (name, role, image_url, "group", year, email, linkedin_url, instagram_url, github_url, display_order, is_active)
      VALUES (
        ${name}, ${role}, ${imageUrl}, ${group}, ${year}, ${email},
        ${linkedinUrl}, ${instagramUrl}, ${githubUrl},
        ${count}, ${isActive}
      )
    `;

    triggerHackXWebsiteRevalidation().catch(() => {});
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateHackXMemberAction(id: string, data: Partial<NewHackXMember>) {
  try {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.role !== undefined) updates.role = data.role;
    if (data.imageUrl !== undefined) updates.image_url = data.imageUrl;
    if (data.group !== undefined) updates.group = data.group;
    if (data.year !== undefined) updates.year = data.year;
    if ('email' in data) updates.email = data.email ?? null;
    if ('linkedinUrl' in data) updates.linkedin_url = data.linkedinUrl ?? null;
    if ('instagramUrl' in data) updates.instagram_url = data.instagramUrl ?? null;
    if ('githubUrl' in data) updates.github_url = data.githubUrl ?? null;
    if (data.isActive !== undefined) updates.is_active = data.isActive;

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date();
      await sql`UPDATE hackx_members SET ${sql(updates)} WHERE id = ${id}`;
    }

    triggerHackXWebsiteRevalidation().catch(() => {});
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteHackXMemberAction(id: string) {
  try {
    await sql`DELETE FROM hackx_members WHERE id = ${id}`;
    triggerHackXWebsiteRevalidation().catch(() => {});
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateHackXMembersOrderAction(orderedIds: string[]) {
  try {
    if (orderedIds.length === 0) return { success: true };

    await sql.begin(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx`UPDATE hackx_members SET display_order = ${i} WHERE id = ${orderedIds[i]}`;
      }
    });

    triggerHackXWebsiteRevalidation().catch(() => {});
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

