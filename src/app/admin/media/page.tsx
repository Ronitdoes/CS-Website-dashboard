'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { uploadMediaToR2Action, listR2MediaFilesAction, deleteMediaFromR2Action } from '@/lib/actions/media';
import { Upload, Trash2, Eye, Loader2, Copy, Database, Sparkles, Search, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';

type BucketType = 'main' | 'hackx';

interface MediaFile {
  name: string;
  key: string;
  url: string;
  size: number;
  lastModified: string | Date;
  bucket?: string;
}

interface PopupState {
  type: 'error' | 'success';
  title: string;
  message: string;
}

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

function ClientDate({ date }: { date: string | Date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <>{new Date(date).toLocaleDateString()}</> : null;
}

export default function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState<BucketType>('main');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popup, setPopup] = useState<PopupState | null>(null);

  const fetchFiles = useCallback(async (bucket: BucketType, showLoading = false) => {
    if (showLoading) setLoading(true);
    const res = await listR2MediaFilesAction('all', bucket);
    if (res.success) {
      setFiles(res.files);
    } else {
      setFiles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles(activeTab, true);
  }, [activeTab, fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setPopup({
        type: 'error',
        title: 'File Size Limit Exceeded',
        message: `The selected file "${file.name}" is ${sizeMB} MB, which exceeds the 1 MB maximum upload limit. Please select a smaller file.`
      });
      e.target.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucketType', activeTab);
    formData.append('folder', activeTab === 'hackx' ? 'hackx' : 'media');

    try {
      const res = await uploadMediaToR2Action(formData);
      setUploading(false);
      e.target.value = '';

      if (res.success) {
        setPopup({
          type: 'success',
          title: 'Upload Successful',
          message: `Asset "${file.name}" uploaded to ${activeTab === 'hackx' ? 'HackX 4.0' : 'IEEE-CS Main'} Bucket!`
        });
        fetchFiles(activeTab, true);
      } else {
        setPopup({
          type: 'error',
          title: 'Upload Failed',
          message: res.error || 'Failed to upload asset to R2 storage.'
        });
      }
    } catch (err: unknown) {
      setUploading(false);
      e.target.value = '';
      const rawMsg = (err as Error)?.message || String(err);
      let message = rawMsg;
      if (rawMsg.includes('Body exceeded') || rawMsg.includes('limit') || rawMsg.includes('413')) {
        message = 'File payload exceeded the 1 MB server body size limit. Please select a smaller file.';
      }
      setPopup({
        type: 'error',
        title: 'Server Action Body Limit Error',
        message
      });
    }
  };

  const handleDelete = async (key: string) => {
    const targetName = activeTab === 'hackx' ? 'HackX 4.0 Bucket' : 'IEEE-CS Main Bucket';
    if (!confirm(`Are you sure you want to delete this file from ${targetName}?`)) return;

    const res = await deleteMediaFromR2Action(key, activeTab);
    if (res.success) {
      setPopup({
        type: 'success',
        title: 'File Deleted',
        message: `File removed from ${targetName}.`
      });
      fetchFiles(activeTab, true);
    } else {
      setPopup({
        type: 'error',
        title: 'Deletion Error',
        message: res.error || 'Failed to delete file.'
      });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setPopup({
      type: 'success',
      title: 'Copied',
      message: 'Asset URL copied to clipboard!'
    });
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-8 relative">
      {/* Custom Popup Modal */}
      {popup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`bg-[#0c0c0c] border rounded-xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl relative ${
            popup.type === 'error' ? 'border-red-900/50 text-red-200' : 'border-emerald-900/50 text-emerald-200'
          }`}>
            <button
              onClick={() => setPopup(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              {popup.type === 'error' ? (
                <div className="p-2.5 rounded-full bg-red-950/80 text-red-400 border border-red-900/40">
                  <AlertCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-900/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-white text-base">{popup.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Media Library Notification</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 bg-black/40 p-3.5 rounded-lg border border-[#1f1f1f] leading-relaxed font-mono text-xs">
              {popup.message}
            </p>

            <button
              onClick={() => setPopup(null)}
              className={`w-full py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors ${
                popup.type === 'error'
                  ? 'bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-800/40'
                  : 'bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-800/40'
              }`}
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Media Library
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Segregated file management for Cloudflare R2 Buckets (Max upload: 1 MB).
          </p>
        </div>

        <label className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors shrink-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : `Upload to ${activeTab === 'hackx' ? 'HackX' : 'Main'} Bucket`}
          <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {/* Bucket Segregation Tabs & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-[#1f1f1f] pb-4">
        {/* Bucket Tabs */}
        <div className="flex gap-2 p-1 bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'main'
                ? 'bg-[#f9ba1f] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>IEEE-CS Main Bucket</span>
          </button>

          <button
            onClick={() => setActiveTab('hackx')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'hackx'
                ? 'bg-[#f9ba1f] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>HackX 4.0 Bucket</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              activeTab === 'hackx' ? 'bg-black/20 text-black' : 'bg-[#f9ba1f]/10 text-[#f9ba1f]'
            }`}>
              hackx-4
            </span>
          </button>
        </div>

        {/* Stats & Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-[#1f1f1f] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#f9ba1f]"
            />
          </div>

          <div className="text-right text-[11px] text-gray-500 font-mono hidden sm:block">
            <span>{files.length} Assets</span>
            <span className="mx-1.5">•</span>
            <span>{totalMB} MB</span>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-40">
          <Loader2 className="w-8 h-8 text-[#f9ba1f] animate-spin" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="border border-dashed border-[#1f1f1f] rounded-xl text-center py-40 bg-[#0c0c0c]">
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'No files match your search.' : `No files in the ${activeTab === 'hackx' ? 'HackX 4.0' : 'IEEE-CS Main'} Bucket.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFiles.map(file => (
            <div key={file.key} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl overflow-hidden flex flex-col group hover:border-[#f9ba1f]/40 transition-all">
              <div className="relative aspect-video w-full bg-black">
                <Image src={file.url} alt={file.name} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-all">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0c0c0c] rounded-lg text-gray-400 hover:text-white border border-[#1f1f1f]">
                    <Eye className="w-4 h-4" />
                  </a>
                  <button onClick={() => copyUrl(file.url)} className="p-2 bg-[#0c0c0c] rounded-lg text-gray-400 hover:text-white border border-[#1f1f1f]">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(file.key)} className="p-2 bg-red-950/80 rounded-lg text-red-400 hover:text-red-300 border border-red-900/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-white truncate font-mono" title={file.name}>{file.name}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono mt-3">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span><ClientDate date={file.lastModified} /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


