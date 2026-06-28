'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { EventModel } from '@/lib/types';
import { updateEventsOrderAction } from '@/lib/actions/events';
import { GripVertical, Loader2, Edit, Trash2, Calendar, ArrowUpDown, Check, X, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DragAndDropEventsProps {
  initialItems: EventModel[];
  deleteEventServerAction: (id: string) => Promise<{ success: boolean; error?: string }>;
}

function ClientDate({ date }: { date: string | Date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <>{new Date(date).toLocaleDateString()}</> : null;
}

export default function DragAndDropEvents({ initialItems, deleteEventServerAction }: DragAndDropEventsProps) {
  const router = useRouter();
  const [items, setItems] = useState<EventModel[]>(initialItems);
  const [isRearranging, setIsRearranging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copy = [...items];
      const dragged = copy[dragItem.current];
      copy.splice(dragItem.current, 1);
      copy.splice(dragOverItem.current, 0, dragged);
      setItems(copy);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const saveOrder = async () => {
    setSaving(true);
    const ids = items.map(i => i.id);
    const res = await updateEventsOrderAction(ids);
    setSaving(false);
    if (res.success) {
      alert('Event order saved successfully!');
      setIsRearranging(false);
      router.refresh();
    } else {
      alert(`Error saving order: ${res.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setDeletingId(id);
    const res = await deleteEventServerAction(id);
    setDeletingId(null);
    if (res.success) {
      router.refresh();
    } else {
      alert(`Error deleting event: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Events Manager</h2>
          <p className="text-gray-500 text-sm mt-1">
            {isRearranging
              ? 'Drag and drop cards to rearrange display order. Save when done.'
              : 'Create, edit, delete, and list events hosted by the club.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isRearranging ? (
            <>
              <button
                onClick={() => {
                  setItems(initialItems);
                  setIsRearranging(false);
                }}
                className="bg-[#181818] hover:bg-[#222] border border-[#333] text-gray-300 font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={saveOrder}
                disabled={saving}
                className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Order
              </button>
            </>
          ) : (
            <>
              {items.length > 1 && (
                <button
                  onClick={() => setIsRearranging(true)}
                  className="bg-[#181818] hover:bg-[#222] border border-[#333] text-gray-300 font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4 text-[#f9ba1f]" />
                  Rearrange
                </button>
              )}
              <Link
                href="/admin/events/new"
                className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Grid or Table Container */}
      <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl overflow-hidden p-6">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-[#0c0c0c]">
            No events found. Click &quot;Add Event&quot; to create one.
          </div>
        ) : isRearranging ? (
          /* Draggable Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((event, index) => (
              <div
                key={event.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="group relative bg-[#080808] border border-[#1f1f1f] hover:border-[#f9ba1f]/50 rounded-xl transition-all duration-200 flex flex-col gap-3 p-4 cursor-grab active:cursor-grabbing"
              >
                {/* Image Cover */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-[#1f1f1f]">
                  <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-xs text-[#f9ba1f] font-mono border border-[#1f1f1f]">
                    #{index + 1}
                  </div>
                  <div className="absolute top-2 right-2 bg-black/80 p-1.5 rounded text-gray-400 border border-[#1f1f1f] opacity-80 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-semibold text-white text-sm truncate" title={event.title}>{event.title}</h4>
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-900/30">
                      {event.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span><ClientDate date={event.eventDate} /></span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      event.status === 'published'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                        : 'bg-zinc-900 text-gray-400 border border-zinc-700/40'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Normal List Table View */
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full border-collapse text-left text-sm text-gray-300">
              <thead className="bg-[#090909] text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-[#1f1f1f]">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {items.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white truncate max-w-xs">{event.title}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{event.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span><ClientDate date={event.eventDate} /></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        event.status === 'published'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                          : 'bg-zinc-900 text-gray-400 border border-zinc-700/40'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.featured ? (
                        <span className="text-[#f9ba1f] text-xs bg-[#f9ba1f]/10 px-2 py-0.5 rounded-full border border-[#f9ba1f]/20 font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-600 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="p-1.5 hover:bg-[#222] rounded text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(event.id)}
                          disabled={deletingId === event.id}
                          className="p-1.5 hover:bg-red-950/60 rounded text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {deletingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
