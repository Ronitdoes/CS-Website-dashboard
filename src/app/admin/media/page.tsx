'use client';

import React, { useState, useEffect } from 'react';
import { uploadMediaToR2Action, listR2MediaFilesAction, deleteMediaFromR2Action } from '@/lib/actions/media';
import { Upload, Trash2, Eye, Loader2, Copy } from 'lucide-react';
import Image from 'next/image';

interface MediaFile {
  name: string;
  key: string;
  url: string;
  size: number;
  lastModified: string | Date;
}

function ClientDate({ date }: { date: string | Date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <>{new Date(date).toLocaleDateString()}</> : null;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    const res = await listR2MediaFilesAction('media');
    if (res.success) setFiles(res.files);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    listR2MediaFilesAction('media').then(res => {
      if (!ignore) {
        if (res.success) setFiles(res.files);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'media');

    const res = await uploadMediaToR2Action(formData);
    setUploading(false);
    if (res.success) {
      alert('Asset uploaded to Cloudflare R2!');
      fetchFiles(true);
    } else {
      alert(`Error uploading: ${res.error}`);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file from Cloudflare R2?')) return;
    const res = await deleteMediaFromR2Action(key);
    if (res.success) {
      alert('File deleted!');
      fetchFiles(true);
    } else {
      alert(`Error deleting: ${res.error}`);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Media Library</h2>
          <p className="text-gray-500 text-sm mt-1">Upload and manage files stored in Cloudflare R2.</p>
        </div>
        
        <label className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload File'}
          <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-40">
          <Loader2 className="w-8 h-8 text-[#f9ba1f] animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="border border-dashed border-[#1f1f1f] rounded-xl text-center py-40 bg-[#0c0c0c]">
          <p className="text-gray-500 text-sm">No files uploaded yet. Click Upload File above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map(file => (
            <div key={file.key} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl overflow-hidden flex flex-col group hover:border-[#f9ba1f]/30 transition-all">
              <div className="relative aspect-video w-full bg-black">
                <Image src={file.url} alt={file.name} fill className="object-cover" />
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
