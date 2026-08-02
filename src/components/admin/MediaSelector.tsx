'use client';

import React, { useState, useEffect } from 'react';
import { listR2MediaFilesAction } from '@/lib/actions/media';
import { FolderOpen, X, Loader2, Database, Sparkles } from 'lucide-react';
import Image from 'next/image';

type BucketType = 'main' | 'hackx';

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  bucket?: string;
  folder?: string;
}

interface MediaFile {
  name: string;
  key: string;
  url: string;
  size: number;
  lastModified: Date;
}

export default function MediaSelector({ value, onChange, label, bucket, folder = 'all' }: MediaSelectorProps) {
  const [open, setOpen] = useState(false);
  const initialBucket: BucketType = (bucket === 'hackx' || bucket === 'hackx-4' || folder === 'hackx') ? 'hackx' : 'main';
  const [activeBucket, setActiveBucket] = useState<BucketType>(initialBucket);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      listR2MediaFilesAction('all', activeBucket)
        .then(res => {
          if (res.success) setFiles(res.files);
          else setFiles([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, activeBucket]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      <div className="flex gap-4 items-center">
        {value ? (
          <div className="relative w-24 h-16 rounded overflow-hidden border border-[#222] bg-black">
            <Image src={value} alt="Selected image" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="w-24 h-16 rounded border border-dashed border-[#333] flex items-center justify-center text-xs text-gray-600 bg-[#0c0c0c]">
            Empty
          </div>
        )}
        <div className="flex-1 flex flex-col gap-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://media.ieee-cs-muj.com/file.jpg"
            className="w-full bg-[#0c0c0c] border border-[#222] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
          />
          <button
            type="button"
            onClick={handleOpen}
            className="flex items-center gap-2 text-xs text-[#f9ba1f] hover:text-white font-medium transition-colors w-fit"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Pick from Media Library
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header with Bucket Switcher */}
            <div className="p-4 border-b border-[#1f1f1f] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#090909] rounded-t-xl">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">Select Asset</h3>
                
                {/* Bucket Tabs in Selector */}
                <div className="flex gap-1 bg-[#141414] p-1 rounded-lg border border-[#222]">
                  <button
                    type="button"
                    onClick={() => setActiveBucket('main')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                      activeBucket === 'main'
                        ? 'bg-[#f9ba1f] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Database className="w-3 h-3" />
                    <span>IEEE-CS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBucket('hackx')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                      activeBucket === 'hackx'
                        ? 'bg-[#f9ba1f] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>HackX 4.0</span>
                  </button>
                </div>
              </div>

              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white self-end sm:self-auto">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-black/20">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#f9ba1f] animate-spin" />
                  <p className="text-sm text-gray-500">Loading {activeBucket === 'hackx' ? 'HackX 4.0' : 'IEEE-CS Main'} bucket files...</p>
                </div>
              ) : files.length === 0 ? (
                <p className="text-center text-gray-500 py-20 text-sm">
                  No files found in the {activeBucket === 'hackx' ? 'HackX 4.0' : 'IEEE-CS Main'} bucket. Go to Media Library to upload assets.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {files.map(file => (
                    <button
                      type="button"
                      key={file.key}
                      onClick={() => {
                        onChange(file.url);
                        setOpen(false);
                      }}
                      className="group flex flex-col gap-2 p-2 rounded-lg border border-[#222] bg-[#0c0c0c] hover:border-[#f9ba1f] text-left transition-all"
                    >
                      <div className="relative aspect-video w-full bg-black rounded overflow-hidden">
                        <Image src={file.url} alt={file.name} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                      </div>
                      <span className="text-xs text-gray-400 truncate w-full font-mono" title={file.name}>{file.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

