import React from 'react';
import { getAdminEventsAction, deleteEventAction } from '@/lib/actions/events';
import DragAndDropEvents from '@/components/admin/DragAndDropEvents';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function EventsListPage() {
  const events = await getAdminEventsAction();

  const deleteEvent = async (id: string) => {
    'use server';
    const res = await deleteEventAction(id);
    revalidatePath('/admin/events');
    return res;
  };

  return (
    <DragAndDropEvents
      initialItems={events}
      deleteEventServerAction={deleteEvent}
    />
  );
}
