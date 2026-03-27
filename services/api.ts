import { supabase } from '../supabase';
import type { Business, Post, User, BusinessPostcard } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
  };
}

async function handleSupabaseError(error: unknown, operationType: OperationType, path: string): Promise<never> {
  const { data: authData } = await supabase.auth.getUser();
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : JSON.stringify(error),
    operationType,
    path,
    authInfo: {
      userId: authData.user?.id,
      email: authData.user?.email,
    },
  };

  console.error('Supabase Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function mapBusiness(row: any): Business {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    nameKu: row.name_ku,
    imageUrl: row.image_url,
    coverImage: row.cover_image,
    isPremium: row.is_premium,
    isFeatured: row.is_featured,
    category: row.category,
    subcategory: row.subcategory,
    rating: row.rating,
    status: row.status,
    isVerified: row.is_verified,
    reviewCount: row.review_count,
    governorate: row.governorate,
    city: row.city,
    address: row.address,
    phone: row.phone,
    whatsapp: row.whatsapp,
    website: row.website,
    description: row.description,
    descriptionAr: row.description_ar,
    descriptionKu: row.description_ku,
    openHours: row.open_hours,
    priceRange: row.price_range,
    tags: row.tags,
    lat: row.lat,
    lng: row.lng,
  };
}

function mapPost(row: any): Post {
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: row.business_name,
    businessAvatar: row.business_avatar,
    caption: row.caption,
    imageUrl: row.image_url,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    likes: row.likes,
    isVerified: row.is_verified ?? row.verified ?? false,
  };
}

export const api = {
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; lastDoc?: number; limit?: number; featuredOnly?: boolean } = {}) {
    const path = 'businesses';

    try {
      const pageSize = params.limit || 20;
      const offset = params.lastDoc ?? 0;
      let query = supabase.from(path).select('*').order('name', { ascending: true }).range(offset, offset + pageSize - 1);

      if (params.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }

      if (params.city && params.city.trim()) {
        query = query.ilike('city', `${params.city.trim()}%`);
      }

      if (params.governorate && params.governorate !== 'all') {
        query = query.eq('governorate', params.governorate);
      }

      if (params.featuredOnly) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data ?? []).map(mapBusiness);
      return {
        data: mapped,
        lastDoc: offset + mapped.length,
        hasMore: mapped.length === pageSize,
      };
    } catch (error) {
      await handleSupabaseError(error, OperationType.GET, path);
    }
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    const path = 'posts';

    const fetchPosts = async () => {
      const { data, error } = await supabase.from(path).select('*').order('created_at', { ascending: false }).limit(50);
      if (error) {
        await handleSupabaseError(error, OperationType.GET, path);
        return;
      }
      callback((data ?? []).map(mapPost));
    };

    fetchPosts();

    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: path }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async getDeals() {
    const path = 'deals';
    try {
      const { data, error } = await supabase.from(path).select('*').order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      return data ?? [];
    } catch (error) {
      await handleSupabaseError(error, OperationType.GET, path);
    }
  },

  async getStories() {
    const path = 'stories';
    try {
      const { data, error } = await supabase.from(path).select('*').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data ?? [];
    } catch (error) {
      await handleSupabaseError(error, OperationType.GET, path);
    }
  },

  async getEvents(params: { category?: string; governorate?: string } = {}) {
    const path = 'events';

    try {
      let query = supabase.from(path).select('*').order('date', { ascending: true });

      if (params.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }

      if (params.governorate && params.governorate !== 'all') {
        query = query.eq('governorate', params.governorate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((row) => ({ ...row, date: row.date ? new Date(row.date) : new Date() }));
    } catch (error) {
      await handleSupabaseError(error, OperationType.GET, path);
    }
  },

  async createPost(postData: Partial<Post>) {
    const path = 'posts';

    try {
      const payload = {
        business_id: postData.businessId,
        business_name: postData.businessName,
        business_avatar: postData.businessAvatar,
        caption: postData.caption,
        image_url: postData.imageUrl,
        likes: 0,
      };
      const { data, error } = await supabase.from(path).insert(payload).select('id').single();
      if (error) throw error;

      return { success: true, id: data.id };
    } catch (error) {
      await handleSupabaseError(error, OperationType.WRITE, path);
    }
  },

  async getOrCreateProfile(authUser: { id: string; email?: string | null; user_metadata?: { name?: string; avatar_url?: string } }, requestedRole: 'user' | 'owner' = 'user') {
    if (!authUser) return null;

    const path = `users/${authUser.id}`;

    try {
      const { data: existingUser, error: readError } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
      if (readError) throw readError;

      const adminEmail = 'safaribosafar@gmail.com';
      const isAdminEmail = authUser.email === adminEmail;

      if (existingUser) {
        if (isAdminEmail && existingUser.role !== 'admin') {
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', authUser.id)
            .select('*')
            .single();
          if (updateError) throw updateError;
          return updatedUser as User;
        }

        return existingUser as User;
      }

      const newUser: User = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        avatar: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
        role: isAdminEmail ? 'admin' : requestedRole,
        businessId: requestedRole === 'owner' ? `b_${authUser.id}` : undefined,
      };

      const { data: createdUser, error: createError } = await supabase.from('users').insert(newUser).select('*').single();
      if (createError) throw createError;

      return createdUser as User;
    } catch (error) {
      await handleSupabaseError(error, OperationType.WRITE, path);
    }
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const path = 'business_postcards';

    try {
      const docId = `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();
      const payload = {
        id: docId,
        title: postcard.title,
        city: postcard.city,
        neighborhood: postcard.neighborhood,
        governorate: postcard.governorate,
        category_tag: postcard.category_tag,
        phone: postcard.phone,
        website: postcard.website,
        instagram: postcard.instagram,
        hero_image: postcard.hero_image,
        image_gallery: postcard.image_gallery,
        postcard_content: postcard.postcard_content,
        google_maps_url: postcard.google_maps_url,
        rating: postcard.rating,
        review_count: postcard.review_count,
        verified: postcard.verified,
      };

      const { error } = await supabase.from(path).upsert(payload, { onConflict: 'id' });
      if (error) throw error;

      return { success: true, id: docId };
    } catch (error) {
      await handleSupabaseError(error, OperationType.WRITE, path);
    }
  },

  async getPostcards(governorate?: string) {
    const path = 'business_postcards';

    try {
      let query = supabase.from(path).select('*').order('updated_at', { ascending: false });
      if (governorate && governorate !== 'all') {
        query = query.eq('governorate', governorate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        city: row.city,
        neighborhood: row.neighborhood,
        governorate: row.governorate,
        category_tag: row.category_tag,
        phone: row.phone,
        website: row.website,
        instagram: row.instagram,
        hero_image: row.hero_image,
        image_gallery: row.image_gallery,
        postcard_content: row.postcard_content,
        google_maps_url: row.google_maps_url,
        rating: row.rating,
        review_count: row.review_count,
        verified: row.verified,
        updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      })) as BusinessPostcard[];
    } catch (error) {
      await handleSupabaseError(error, OperationType.GET, path);
    }
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const path = `users/${userId}`;

    try {
      const { error } = await supabase.from('users').update(data).eq('id', userId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      await handleSupabaseError(error, OperationType.WRITE, path);
    }
  },
};
