import { 
    collection, 
    getDocs, 
    query, 
    where, 
    limit, 
    orderBy, 
    addDoc, 
    serverTimestamp, 
    doc, 
    getDoc, 
    setDoc,
    getDocFromServer,
    Timestamp,
    onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { hasSupabaseEnv, querySupabase } from './supabase';
import type { Business, Post, User, BusinessPostcard } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();


type BusinessDataSource = 'live' | 'fallback';
let businessDataSource: BusinessDataSource = hasSupabaseEnv ? 'live' : 'fallback';

function mapSupabaseBusiness(row: Record<string, any>): Business {
  return {
    id: row.id,
    name: row.name || row.title || 'Unnamed business',
    nameAr: row.name_ar || row.nameAr,
    nameKu: row.name_ku || row.nameKu,
    coverImage: row.cover_image || row.coverImage,
    imageUrl: row.image_url || row.imageUrl || row.hero_image,
    category: row.category || row.category_tag || 'other',
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? row.reviewCount ?? 0),
    reviews: Number(row.review_count ?? row.reviewCount ?? 0),
    distance: row.distance,
    city: row.city,
    governorate: row.governorate,
    isFeatured: Boolean(row.is_featured ?? row.isFeatured ?? false),
    isPremium: Boolean(row.is_premium ?? row.isPremium ?? false),
    isVerified: Boolean(row.is_verified ?? row.isVerified ?? false),
    status: row.status,
    phone: row.phone,
    address: row.address,
    website: row.website,
    description: row.description,
  };
}

export const api = {
    async getBusinesses(params: { category?: string; city?: string; governorate?: string; offset?: number; limit?: number; featuredOnly?: boolean } = {}) {
        const path = 'businesses';
        const pageSize = params.limit || 20;
        const offset = params.offset || 0;

        if (hasSupabaseEnv) {
            const filters: string[] = [];

            if (params.category && params.category !== 'all') {
                filters.push(`or=category.eq.${params.category},category_tag.eq.${params.category}`);
            }

            if (params.governorate && params.governorate !== 'all') {
                filters.push(`governorate=eq.${params.governorate}`);
            }

            if (params.featuredOnly) {
                filters.push('is_featured=eq.true');
            }

            if (params.city?.trim()) {
                filters.push(`city=ilike.*${encodeURIComponent(params.city.trim())}*`);
            }

            const { data, error, count } = await querySupabase(path, {
                select: 'id,name,name_ar,name_ku,cover_image,image_url,hero_image,category,category_tag,rating,review_count,distance,city,governorate,is_featured,is_premium,is_verified,status,phone,address,website,description',
                orderBy: 'name',
                ascending: true,
                offset,
                limit: pageSize,
                filters,
            });

            if (!error) {
                businessDataSource = 'live';
                const mapped = (data || []).map((row) => mapSupabaseBusiness(row as Record<string, any>));
                const nextOffset = offset + mapped.length;
                return {
                    data: mapped,
                    hasMore: typeof count === 'number' ? nextOffset < count : mapped.length === pageSize,
                    nextOffset,
                    totalCount: count ?? undefined,
                    source: businessDataSource,
                };
            }

            // Supabase is configured but request failed: surface the error for visibility.
            throw new Error(`Supabase query failed: ${error}`);
        }

        // Fallback path: Firestore for environments without Supabase variables.
        businessDataSource = 'fallback';

        try {
            let q: any;
            const searchStr = params.city?.trim();

            if (searchStr) {
                q = query(
                    collection(db, path),
                    where('city', '>=', searchStr),
                    where('city', '<=', searchStr + '\uf8ff'),
                    orderBy('city'),
                    orderBy('name')
                );
            } else {
                q = query(collection(db, path), orderBy('name'));
            }

            if (params.category && params.category !== 'all') {
                q = query(q, where('category', '==', params.category));
            }

            if (params.governorate && params.governorate !== 'all') {
                q = query(q, where('governorate', '==', params.governorate));
            }

            if (params.featuredOnly) {
                q = query(q, where('isFeatured', '==', true));
            }

            q = query(q, limit(offset + pageSize));

            const snapshot = await getDocs(q);
            const allData = snapshot.docs.map((docItem) => {
                const d = docItem.data() as any;
                return {
                    id: docItem.id,
                    ...d,
                    isVerified: d.isVerified ?? d.verified ?? false,
                } as Business;
            });

            const paged = allData.slice(offset, offset + pageSize);
            const nextOffset = offset + paged.length;

            return {
                data: paged,
                hasMore: allData.length > nextOffset,
                nextOffset,
                source: businessDataSource,
            };
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return { data: [], hasMore: false, nextOffset: offset, source: businessDataSource };
        }
    },

    getBusinessDataSourceStatus() {
        return {
            envOk: hasSupabaseEnv,
            dataSource: businessDataSource,
        } as const;
    },

    /**
     * Real-time subscription for the social feed.
     * Real-time is used here because social feeds are dynamic and users expect to see
     * new posts, likes, and updates immediately without refreshing.
     */
    subscribeToPosts(callback: (posts: Post[]) => void) {
        const path = 'posts';
        const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
        
        return onSnapshot(q, (snapshot) => {
            const postsMap = new Map<string, Post>();
            
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const post = { 
                    id: doc.id, 
                    ...data,
                    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date()
                } as Post;
                postsMap.set(post.id, post);
            });
            
            // Convert map back to array and ensure order is maintained (Map preserves insertion order)
            callback(Array.from(postsMap.values()));
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, path);
        });
    },

    /**
     * One-time fetch for deals.
     * One-time fetch is used because deals are relatively static listings that don't
     * change frequently enough to justify the overhead of a real-time connection.
     */
    async getDeals() {
        const path = 'deals';
        try {
            const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(10));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return [];
        }
    },

    /**
     * One-time fetch for stories.
     * Stories are fetched once on load to provide a stable browsing experience.
     */
    async getStories() {
        const path = 'stories';
        try {
            const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(20));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return [];
        }
    },

    /**
     * One-time fetch for events.
     * Events are scheduled items; real-time updates are not critical for a general directory view.
     */
    async getEvents(params: { category?: string; governorate?: string } = {}) {
        const path = 'events';
        try {
            let q = query(collection(db, path), orderBy('date', 'asc'));
            if (params.category && params.category !== 'all') {
                q = query(q, where('category', '==', params.category));
            }
            if (params.governorate && params.governorate !== 'all') {
                q = query(q, where('governorate', '==', params.governorate));
            }
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date ? (data.date as Timestamp).toDate() : new Date()
                } as any;
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return [];
        }
    },

    async createPost(postData: Partial<Post>) {
        const path = 'posts';
        try {
            const docRef = await addDoc(collection(db, path), {
                ...postData,
                createdAt: serverTimestamp(),
                likes: 0
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { success: false };
        }
    },

    async getOrCreateProfile(firebaseUser: any, requestedRole: 'user' | 'owner' = 'user') {
        if (!firebaseUser) return null;
        
        const path = `users/${firebaseUser.uid}`;
        try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            
            // Check if this is the admin email for bootstrapping
            const isAdminEmail = firebaseUser.email === 'safaribosafar@gmail.com';
            
            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                
                // If it's the admin email, ensure they have the admin role in the DB
                if (isAdminEmail && userData.role !== 'admin') {
                    const updatedUser = { ...userData, role: 'admin' as any };
                    await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser, { merge: true });
                    return updatedUser;
                }
                
                return userData;
            } else {
                // New user creation
                const newUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email || '',
                    avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
                    role: isAdminEmail ? 'admin' as any : requestedRole,
                    businessId: requestedRole === 'owner' ? `b_${firebaseUser.uid}` : undefined
                };
                await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
                return newUser;
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return null;
        }
    },

    async upsertPostcard(postcard: BusinessPostcard) {
        const path = 'business_postcards';
        try {
            const docId = `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();
            const docRef = doc(db, path, docId);
            
            await setDoc(docRef, {
                ...postcard,
                updatedAt: serverTimestamp()
            }, { merge: true });
            
            return { success: true, id: docId };
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { success: false };
        }
    },

    async getPostcards(governorate?: string) {
        const path = 'business_postcards';
        try {
            let q = query(collection(db, path), orderBy('updatedAt', 'desc'));
            if (governorate && governorate !== 'all') {
                q = query(q, where('governorate', '==', governorate));
            }
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined
                } as BusinessPostcard;
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return [];
        }
    },

    async updateProfile(userId: string, data: Partial<User>) {
        const path = `users/${userId}`;
        try {
            await setDoc(doc(db, 'users', userId), {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true });
            return { success: true };
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
            return { success: false };
        }
    }
};
