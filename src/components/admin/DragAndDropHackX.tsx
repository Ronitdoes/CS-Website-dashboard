'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HackXMember, HackXGroup, HackXYear } from '@/lib/types';
import {
  updateHackXMembersOrderAction,
  deleteHackXMemberAction,
  updateHackXMemberAction,
} from '@/lib/actions/hackx';
import Image from 'next/image';
import { GripVertical, Loader2, Trash2, Edit2, Check, X, Eye, EyeOff, Link2, AtSign, Code2, Mail, Calendar } from 'lucide-react';
import MediaSelector from '@/components/admin/MediaSelector';

const GROUP_OPTIONS: { value: HackXGroup; label: string }[] = [
  { value: 'convener', label: 'Convener' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'core', label: 'Core Committee' },
  { value: 'ec', label: 'Executive Committee' },
];

const YEAR_OPTIONS: HackXYear[] = ['2026', '2025', '2024'];

const GROUP_BADGE: Record<HackXGroup, string> = {
  convener: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
  faculty: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
  core: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
  ec: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
};

const GROUP_LABEL: Record<HackXGroup, string> = {
  convener: 'Convener',
  faculty: 'Faculty',
  core: 'Core',
  ec: 'EC',
};

interface DragAndDropHackXProps {
  initialItems: HackXMember[];
  onRefresh: () => void;
}

export default function DragAndDropHackX({ initialItems, onRefresh }: DragAndDropHackXProps) {
  const [items, setItems] = useState<HackXMember[]>(initialItems);
  const [activeGroupTab, setActiveGroupTab] = useState<string>('all');
  const [activeYearTab, setActiveYearTab] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    imageUrl: '',
    group: 'core' as HackXGroup,
    year: '2026' as HackXYear,
    email: '',
    linkedinUrl: '',
    instagramUrl: '',
    githubUrl: '',
    isActive: true,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setItems(initialItems));
  }, [initialItems]);

  const filteredItems = items.filter(item => {
    const matchesGroup = activeGroupTab === 'all' || item.group === activeGroupTab;
    const matchesYear = activeYearTab === 'all' || (item.year || '2026') === activeYearTab;
    return matchesGroup && matchesYear;
  });

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
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
    const res = await updateHackXMembersOrderAction(ids);
    setSaving(false);
    if (res.success) {
      alert('HackX member display layout saved!');
      onRefresh();
    } else {
      alert(`Error saving order: ${res.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this HackX member?')) return;
    setUpdatingId(id);
    const res = await deleteHackXMemberAction(id);
    setUpdatingId(null);
    if (res.success) {
      onRefresh();
    } else {
      alert(`Error deleting member: ${res.error}`);
    }
  };

  const handleToggleActive = async (item: HackXMember) => {
    setUpdatingId(item.id);
    const res = await updateHackXMemberAction(item.id, { isActive: !item.isActive });
    setUpdatingId(null);
    if (res.success) {
      onRefresh();
    } else {
      alert(`Error toggling status: ${res.error}`);
    }
  };

  const startEditing = (item: HackXMember) => {
    setEditingId(item.id);
    setEditFormData({
      name: item.name,
      role: item.role,
      imageUrl: item.imageUrl,
      group: item.group,
      year: item.year || '2026',
      email: item.email || '',
      linkedinUrl: item.linkedinUrl || '',
      instagramUrl: item.instagramUrl || '',
      githubUrl: item.githubUrl || '',
      isActive: item.isActive,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setUpdatingId(editingId);
    const res = await updateHackXMemberAction(editingId, {
      ...editFormData,
      email: editFormData.email || null,
      linkedinUrl: editFormData.linkedinUrl || null,
      instagramUrl: editFormData.instagramUrl || null,
      githubUrl: editFormData.githubUrl || null,
    });
    setUpdatingId(null);
    if (res.success) {
      setEditingId(null);
      onRefresh();
    } else {
      alert(`Error updating member: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Save Bar */}
      <div className="flex flex-col gap-4 bg-[#0c0c0c] p-4 rounded-xl border border-[#1f1f1f]">
        {/* Year Filter Tabs */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#1a1a1a]">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#f9ba1f]" /> Edition Year:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveYearTab('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeYearTab === 'all'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'
              }`}
            >
              All Years ({items.length})
            </button>
            {YEAR_OPTIONS.map(yr => {
              const yrCount = items.filter(i => (i.year || '2026') === yr).length;
              return (
                <button
                  key={yr}
                  onClick={() => setActiveYearTab(yr)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeYearTab === yr
                      ? 'bg-[#f9ba1f] text-black font-semibold shadow-sm'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'
                  }`}
                >
                  {yr} ({yrCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Group Category Filter & Save Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveGroupTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeGroupTab === 'all'
                  ? 'bg-[#f9ba1f] text-black shadow-md'
                  : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'
              }`}
            >
              All Groups ({filteredItems.length})
            </button>
            {GROUP_OPTIONS.map(g => {
              const count = items.filter(i => {
                const matchesGroup = i.group === g.value;
                const matchesYear = activeYearTab === 'all' || (i.year || '2026') === activeYearTab;
                return matchesGroup && matchesYear;
              }).length;
              return (
                <button
                  key={g.value}
                  onClick={() => setActiveGroupTab(g.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeGroupTab === g.value
                      ? 'bg-[#f9ba1f] text-black shadow-md'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'
                  }`}
                >
                  {g.label} ({count})
                </button>
              );
            })}
          </div>

          <button
            onClick={saveOrder}
            disabled={saving || items.length === 0}
            className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 transition-colors shrink-0"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-gray-500 border border-dashed border-[#1f1f1f] rounded-xl bg-[#0c0c0c]">
          No members found in this group category. Use the form below to add members.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const isEditing = editingId === item.id;
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                draggable={!isEditing}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`group relative bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl transition-all duration-200 flex flex-col gap-3 p-4 ${
                  isEditing
                    ? 'border-[#f9ba1f] shadow-[0_0_15px_rgba(249,186,31,0.1)]'
                    : 'hover:border-[#f9ba1f]/50 cursor-grab active:cursor-grabbing'
                }`}
              >
                {isEditing ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3 flex-1 flex flex-col">
                    <h5 className="text-xs font-semibold text-[#f9ba1f] uppercase tracking-wider">Edit Member</h5>

                    <MediaSelector
                      label="Photo"
                      value={editFormData.imageUrl}
                      onChange={(url) => setEditFormData({ ...editFormData, imageUrl: url })}
                      bucket={process.env.NEXT_PUBLIC_HACKX_R2_BUCKET_NAME || 'hackx-4'}
                      folder="hackx"
                    />

                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Name</label>
                        <input
                          required
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Role / Title</label>
                        <input
                          required
                          type="text"
                          value={editFormData.role}
                          onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                          className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Edition Year</label>
                        <select
                          value={editFormData.year}
                          onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value as HackXYear })}
                          className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                        >
                          {YEAR_OPTIONS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Group Category</label>
                        <select
                          value={editFormData.group}
                          onChange={(e) => setEditFormData({ ...editFormData, group: e.target.value as HackXGroup })}
                          className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                        >
                          {GROUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>

                      {(editFormData.group === 'faculty' || editFormData.group === 'convener') && (
                        <div className="space-y-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Email Address</label>
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            placeholder="faculty@example.com"
                            className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">LinkedIn URL</label>
                        <input
                          type="url"
                          value={editFormData.linkedinUrl}
                          onChange={(e) => setEditFormData({ ...editFormData, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                        />
                      </div>

                      {(editFormData.group === 'core' || editFormData.group === 'ec' || editFormData.group === 'convener') && (
                        <>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Instagram URL</label>
                            <input
                              type="url"
                              value={editFormData.instagramUrl}
                              onChange={(e) => setEditFormData({ ...editFormData, instagramUrl: e.target.value })}
                              placeholder="https://instagram.com/..."
                              className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">GitHub URL</label>
                            <input
                              type="url"
                              value={editFormData.githubUrl}
                              onChange={(e) => setEditFormData({ ...editFormData, githubUrl: e.target.value })}
                              placeholder="https://github.com/..."
                              className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`edit-active-${item.id}`}
                        checked={editFormData.isActive}
                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                        className="rounded border-gray-700 bg-black text-[#f9ba1f] focus:ring-[#f9ba1f]"
                      />
                      <label htmlFor={`edit-active-${item.id}`} className="text-xs text-gray-400 select-none">Active on Live Website</label>
                    </div>

                    <div className="mt-auto flex justify-end gap-2 pt-3 border-t border-[#1f1f1f]">
                      <button type="button" onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:text-white rounded border border-[#222] hover:bg-[#141414]" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                      <button type="submit" disabled={isUpdating} className="p-1.5 bg-[#f9ba1f] text-black font-semibold rounded hover:bg-[#d69f1a] disabled:opacity-50" title="Save">
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Photo */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black border border-[#1f1f1f]">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover object-top" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-xs text-[#f9ba1f] font-mono border border-[#1f1f1f]">
                        #{index + 1}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/80 p-1.5 rounded text-gray-400 hover:text-white border border-[#1f1f1f] opacity-80 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Member Info */}
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border bg-[#141414] text-[#f9ba1f] border-[#f9ba1f]/30">
                            {item.year || '2026'}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${GROUP_BADGE[item.group] || GROUP_BADGE.core}`}>
                            {GROUP_LABEL[item.group] || item.group}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{item.role}</p>

                      {/* Email for Faculty & Convener */}
                      {item.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 truncate" title={item.email}>
                          <Mail className="w-3 h-3 text-[#f9ba1f] shrink-0" />
                          <span className="truncate">{item.email}</span>
                        </div>
                      )}

                      {/* Social Links */}
                      <div className="flex items-center gap-2.5 mt-2">
                        {item.linkedinUrl && (
                          <a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors" title="LinkedIn">
                            <Link2 className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {item.instagramUrl && (
                          <a href={item.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-400 transition-colors" title="Instagram">
                            <AtSign className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {item.githubUrl && (
                          <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" title="GitHub">
                            <Code2 className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex justify-between items-center pt-2.5 border-t border-[#1f1f1f] text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        disabled={isUpdating}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium transition-all ${
                          item.isActive
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/80'
                            : 'bg-red-950/80 text-red-400 border border-red-800/40 hover:bg-red-900/80'
                        }`}
                      >
                        {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEditing(item)} className="text-gray-400 hover:text-white transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(item.id)} disabled={isUpdating} className="text-red-400 hover:text-red-300 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
