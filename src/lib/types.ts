export interface GalleryItem {
  id: string;
  title: string;
  caption: string | null;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewGalleryItem {
  title?: string;
  caption?: string | null;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface HeroSettings {
  id: string;
  heading: string;
  subheading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImageUrl: string;
  updatedAt: Date;
}

export interface HeroImage {
  id: string;
  heroId: string;
  imageUrl: string;
  displayOrder: number;
}

export interface HeroData extends HeroSettings {
  overlayImages: HeroImage[];
}

export interface EventModel {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  eventDate: Date;
  displayOrder: number;
  featured: boolean;
  status: string;
  tag: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewEventModel {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  eventDate: Date;
  displayOrder?: number;
  featured?: boolean;
  status?: string;
  tag?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  group: string;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  githubUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTeamMember {
  id?: string;
  name?: string;
  role?: string;
  imageUrl?: string;
  group?: string;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  githubUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type HackXGroup = 'core' | 'ec' | 'faculty' | 'convener';
export type HackXYear = '2026' | '2025' | '2024';

export interface HackXMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  group: HackXGroup;
  year: HackXYear;
  email: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  githubUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewHackXMember {
  id?: string;
  name?: string;
  role?: string;
  imageUrl?: string;
  group?: HackXGroup;
  year?: HackXYear;
  email?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  githubUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

