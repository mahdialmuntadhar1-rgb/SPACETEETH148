import { hasSupabaseConfig, requestSupabase } from './supabase';
import type { Business, Post, User, BusinessPostcard } from '../types';

const PAGE_LIMIT = 20;

const asDate = (value: unknown) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(String(value));
};

const createFallbackUser = (requestedRole: 'user' | 'owner' = 'user'): User => ({
  id: 'local-user',
  name: requestedRole === 'owner' ? 'Business Owner' : 'Guest User',
  email: requestedRole === 'owner' ? 'owner@local.app' : 'guest@local.app',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=local-user',
  role: requestedRole,
  businessId: requestedRole === 'owner' ? 'b_local_user' : undefined,
});

export const api = {
  async getBusinesses(params: {
    category?: string;
    city?: string;
    governorate?: string;
    lastId?: string;
    limit?: number;
    featuredOnly?: boolean;
  } = {}) {
    if (!hasSupabaseConfig) return { data: [] as Business[], hasMore: false, lastId: undefined as string | undefined };

    const pageSize = params.limit || PAGE_LIMIT;
    const query: Record<string, string | number | boolean | undefined> = {
      select: '*',
      order: 'id.asc',
      limit: pageSize + 1,
      ...(params.category && params.category !== 'all' ? { category: `eq.${params.category}` } : {}),
      ...(params.city?.trim() ? { city: `ilike.${params.city.trim()}*` } : {}),
      ...(params.governorate && params.governorate !== 'all' ? { governorate: `eq.${params.governorate}` } : {}),
      ...(params.featuredOnly ? { isFeatured: 'eq.true' } : {}),
      ...(params.lastId ? { id: `gt.${params.lastId}` } : {}),
    };

    const { data, error } = await requestSupabase<any[]>('businesses', { query });
    if (error) {
      console.error('Supabase getBusinesses error:', error);
      return { data: [] as Business[], hasMore: false, lastId: undefined as string | undefined };
    }

    const rows = (data ?? []).slice(0, pageSize) as Array<Business & { id: string | number }>;
    const normalized = rows.map((row) => ({ ...row, isVerified: row.isVerified ?? false }));

    return {
      data: normalized,
      hasMore: (data?.length ?? 0) > pageSize,
      lastId: normalized.length > 0 ? String(normalized[normalized.length - 1].id) : params.lastId,
    };
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    if (!hasSupabaseConfig) {
      callback([]);
      return () => {};
    }

    let active = true;
    const load = async () => {
      const { data, error } = await requestSupabase<any[]>('posts', {
        query: { select: '*', order: 'createdAt.desc', limit: 50 },
      });
      if (!active) return;
      if (error) {
        console.error('Supabase getPosts error:', error);
        callback([]);
        return;
      }
      callback(((data ?? []).map((row) => ({ ...row, createdAt: asDate(row.createdAt) })) as Post[]) || []);
    };

    void load();
    return () => {
      active = false;
    };
  },

  async getDeals() {
    if (!hasSupabaseConfig) return [];
    const { data, error } = await requestSupabase<any[]>('deals', {
      query: { select: '*', order: 'createdAt.desc', limit: 10 },
    });
    if (error) {
      console.error('Supabase getDeals error:', error);
      return [];
    }
    return data ?? [];
  },

  async getStories() {
    if (!hasSupabaseConfig) return [];
    const { data, error } = await requestSupabase<any[]>('stories', {
      query: { select: '*', order: 'createdAt.desc', limit: 20 },
    });
    if (error) {
      console.error('Supabase getStories error:', error);
      return [];
    }
    return data ?? [];
  },

  async getEvents(params: { category?: string; governorate?: string } = {}) {
    if (!hasSupabaseConfig) return [];
    const query: Record<string, string> = {
      select: '*',
      order: 'date.asc',
      ...(params.category && params.category !== 'all' ? { category: `eq.${params.category}` } : {}),
      ...(params.governorate && params.governorate !== 'all' ? { governorate: `eq.${params.governorate}` } : {}),
    };
    const { data, error } = await requestSupabase<any[]>('events', { query });
    if (error) {
      console.error('Supabase getEvents error:', error);
      return [];
    }
    return (data ?? []).map((row) => ({ ...row, date: asDate(row.date) }));
  },

  async createPost(postData: Partial<Post>) {
    if (!hasSupabaseConfig) return { success: false };
    const payload = [{ ...postData, createdAt: new Date().toISOString(), likes: 0 }];
    const { data, error } = await requestSupabase<any[]>('posts', {
      method: 'POST',
      body: payload,
      query: { select: 'id' },
      prefer: 'return=representation',
    });
    if (error) {
      console.error('Supabase createPost error:', error);
      return { success: false };
    }
    return { success: true, id: data?.[0]?.id as string | undefined };
  },

  async getOrCreateProfile(inputUser: any, requestedRole: 'user' | 'owner' = 'user') {
    if (!hasSupabaseConfig) return createFallbackUser(requestedRole);

    const id = inputUser?.uid || inputUser?.id || `local-${requestedRole}`;
    const email = inputUser?.email || '';

    const { data: existing, error: selectError } = await requestSupabase<any[]>('users', {
      query: { select: '*', id: `eq.${id}`, limit: 1 },
    });

    if (selectError) {
      console.error('Supabase get profile error:', selectError);
      return createFallbackUser(requestedRole);
    }

    if (existing?.[0]) return existing[0] as User;

    const newUser: User = {
      id,
      name: inputUser?.displayName || email.split('@')[0] || 'User',
      email,
      avatar: inputUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      role: requestedRole,
      businessId: requestedRole === 'owner' ? `b_${id}` : undefined,
    };

    const { error: insertError } = await requestSupabase('users', {
      method: 'POST',
      body: [newUser],
      prefer: 'return=minimal',
    });

    if (insertError) {
      console.error('Supabase create profile error:', insertError);
      return createFallbackUser(requestedRole);
    }

    return newUser;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    if (!hasSupabaseConfig) return { success: false };

    const id = `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();
    const payload = [{ ...postcard, id, updatedAt: new Date().toISOString() }];
    const { error } = await requestSupabase('business_postcards', {
      method: 'POST',
      body: payload,
      query: { on_conflict: 'id' },
      prefer: 'resolution=merge-duplicates,return=minimal',
    });

    if (error) {
      console.error('Supabase upsertPostcard error:', error);
      return { success: false };
    }

    return { success: true, id };
  },

  async getPostcards(governorate?: string) {
    if (!hasSupabaseConfig) return [];
    const { data, error } = await requestSupabase<any[]>('business_postcards', {
      query: {
        select: '*',
        order: 'updatedAt.desc',
        ...(governorate && governorate !== 'all' ? { governorate: `eq.${governorate}` } : {}),
      },
    });
    if (error) {
      console.error('Supabase getPostcards error:', error);
      return [];
    }
    return (data ?? []).map((row) => ({ ...row, updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined }));
  },

  async updateProfile(userId: string, data: Partial<User>) {
    if (!hasSupabaseConfig) return { success: false };

    const { error } = await requestSupabase('users', {
      method: 'PATCH',
      body: { ...data, updatedAt: new Date().toISOString() },
      query: { id: `eq.${userId}` },
      prefer: 'return=minimal',
    });

    if (error) {
      console.error('Supabase updateProfile error:', error);
      return { success: false };
    }

    return { success: true };
  },
};
