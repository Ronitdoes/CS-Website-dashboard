'use client';

import React, { useState, useEffect } from 'react';
import { getAdminHackXMembersAction, createHackXMemberAction } from '@/lib/actions/hackx';
import { HackXMember, HackXGroup, HackXYear } from '@/lib/types';
import DragAndDropHackX from '@/components/admin/DragAndDropHackX';
import MediaSelector from '@/components/admin/MediaSelector';
import { Plus, Loader2 } from 'lucide-react';

const GROUP_OPTIONS: { value: HackXGroup; label: string }[] = [
  { value: 'convener', label: 'Convener' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'core', label: 'Core Committee' },
  { value: 'ec', label: 'Executive Committee' },
];

const YEAR_OPTIONS: HackXYear[] = ['2026', '2025', '2024'];

export default function HackXManagerClient() {
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [members, setMembers] = useState<HackXMember[]>([]);
  const [formData, setFormData] = useState({
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

  const loadMembers = () => {
    getAdminHackXMembersAction().then(data => setMembers(data || []));
  };

  useEffect(() => {
    getAdminHackXMembersAction().then(data => {
      setMembers(data || []);
      setLoading(false);
    });
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl || !formData.name || !formData.role) return;

    setAdding(true);
    const res = await createHackXMemberAction({
      name: formData.name,
      role: formData.role,
      imageUrl: formData.imageUrl,
      group: formData.group,
      year: formData.year,
      email: formData.email || null,
      linkedinUrl: formData.linkedinUrl || null,
      instagramUrl: formData.instagramUrl || null,
      githubUrl: formData.githubUrl || null,
      isActive: formData.isActive,
    });
    setAdding(false);

    if (res.success) {
      alert('HackX member added successfully!');
      setFormData({
        name: '',
        role: '',
        imageUrl: '',
        group: 'core',
        year: '2026',
        email: '',
        linkedinUrl: '',
        instagramUrl: '',
        githubUrl: '',
        isActive: true,
      });
      loadMembers();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-mono">Loading HackX team members...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          HackX Manager
          <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-md bg-[#f9ba1f]/10 text-[#f9ba1f] border border-[#f9ba1f]/20">
            Exclusive Portal
          </span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage Core Committee, Executive Committee, Faculty, and Conveners across HackX editions (2026, 2025, 2024).
        </p>
      </div>

      <div className="space-y-8 animate-fadeIn">
        {/* Drag & Drop Card Grid */}
        <DragAndDropHackX initialItems={members} onRefresh={loadMembers} />

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl p-8 space-y-6">
          <div>
            <h3 className="font-semibold text-white text-base">Add HackX Team Member</h3>
            <p className="text-xs text-gray-500 mt-1">
              Select an edition year and group category to publish a team member.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1f1f1f] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.g., Dr. Jane Doe"
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Role / Position</label>
                <input
                  required
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="E.g., Convener / Lead Developer"
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Edition Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value as HackXYear })}
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                >
                  {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Group Category</label>
                <select
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value as HackXGroup })}
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                >
                  {GROUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Email Field for Faculty & Convener */}
            {(formData.group === 'faculty' || formData.group === 'convener') && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Email Address <span className="text-gray-500 font-normal">(Required for Faculty & Convener)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="faculty@university.edu"
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>
            )}

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>

              {(formData.group === 'core' || formData.group === 'ec' || formData.group === 'convener') && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Instagram URL</label>
                    <input
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">GitHub URL</label>
                    <input
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                    />
                  </div>
                </>
              )}
            </div>

            <MediaSelector
              label="Select Member Photo"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              bucket={process.env.NEXT_PUBLIC_HACKX_R2_BUCKET_NAME || 'hackx-4'}
              folder="hackx"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="add-active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-700 bg-black text-[#f9ba1f] focus:ring-[#f9ba1f]"
              />
              <label htmlFor="add-active" className="text-xs text-gray-400 select-none">Active on Live Website</label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#1f1f1f]">
            <button
              type="submit"
              disabled={adding || !formData.imageUrl || !formData.name || !formData.role}
              className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? 'Adding...' : 'Add HackX Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
