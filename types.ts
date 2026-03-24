import type React from 'react';
import type { BusinessNameField } from './src/lib/utils';

export interface Story {
  id: number;
  avatar: string;
  name: string;
  viewed?: boolean;
  verified?: boolean;
  thumbnail: string;
  userName: string;
  type: 'business' | 'community';
  aiVerified?: boolean;
  isLive?: boolean;
  media: string[];
  timeAgo: string;
}

export interface Subcategory {
  id: string;
  icon: React.ReactNode;
  nameKey: string;
  count?: number;
  subcategories?: Subcategory[];
}

export interface Category {
  id: string;
  icon: React.ReactNode;
  nameKey: string;
  eventCount: number;
  recommended?: boolean;
  subcategories?: Subcategory[];
}

export interface Business {
  id: string | number;
  name: BusinessNameField;
  nameAr?: string;
  nameKu?: string;
  coverImage?: string;
  imageUrl?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  category: string;
  subcategory?: string;
  rating: number;
  distance?: number;
  status?: string;
  image?: string;
  verified?: boolean;
  isVerified?: boolean;
  reviews?: number;
  reviewCount?: number;
  governorate?: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  description?: string;
  descriptionAr?: string;
  descriptionKu?: string;
  openHours?: string;
  priceRange?: 1 | 2 | 3 | 4;
  tags?: string[];
  lat?: number;
  lng?: number;
}

export interface Event {
  id: number;
  image: string;
  title: string;
  aiRecommended?: boolean;
  date: Date;
  venue: string;
  attendees: number;
  price: number;
  accessibility?: {
    wheelchairAccessible?: boolean;
    familyFriendly?: boolean;
    womenOnly?: boolean;
    sensoryFriendly?: boolean;
    signLanguage?: boolean;
    audioDescription?: boolean;
  };
}

export interface Deal {
  id: number;
  discount: number;
  businessLogo: string;
  title: string;
  description: string;
  expiresIn: string;
  claimed: number;
  total: number;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    image: string;
}
