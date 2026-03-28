import type { Business, BusinessPostcard, Deal, Event, Post, Story } from '../types';

type GovId = 'baghdad' | 'erbil' | 'basra' | 'nineveh';

const now = new Date('2026-03-28T12:00:00.000Z');
const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

interface GovContent {
  businesses: Business[];
  posts: Post[];
  stories: Story[];
  deals: Deal[];
  events: Event[];
  postcards: BusinessPostcard[];
}

const content: Record<GovId, GovContent> = {
  baghdad: {
    businesses: [
      { id: 'bgd-shabandar', name: 'Shabandar Café', nameAr: 'مقهى الشابندر', nameKu: 'کافێ شابەندەر', category: 'food_drink', subcategory: 'cafes', rating: 4.7, reviewCount: 318, isFeatured: true, isVerified: true, governorate: 'Baghdad', city: 'Baghdad', address: 'Al-Mutanabbi Street', openHours: '8:00 AM - 11:00 PM', imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31', coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', status: 'open' },
      { id: 'bgd-bait-al-baghdadi', name: 'Bait Al-Baghdadi', nameAr: 'بيت البغدادي', category: 'food_drink', subcategory: 'restaurants', rating: 4.8, reviewCount: 505, isFeatured: true, isVerified: true, governorate: 'Baghdad', city: 'Karrada', address: 'Abu Nawas', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', status: 'open' },
    ],
    posts: [
      { id: 'p-bgd-1', businessId: 'bgd-shabandar', businessName: 'Shabandar Café', businessAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', caption: 'Fresh cardamom qahwa is brewing now by the river. Tonight’s oud set starts at 8 PM.', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', createdAt: daysFromNow(-1), likes: 42, isVerified: true, governorate: 'baghdad' },
      { id: 'p-bgd-2', businessId: 'bgd-bait-al-baghdadi', businessName: 'Bait Al-Baghdadi', businessAvatar: 'https://images.unsplash.com/photo-1546961329-78bef0414d7c', caption: 'Masgouf trays just landed. Family tables available after iftar hours.', imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe', createdAt: daysFromNow(-2), likes: 31, isVerified: true, governorate: 'baghdad' },
    ],
    stories: [
      { id: 1001, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', name: 'Shabandar', viewed: false, verified: true, thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', userName: 'Shabandar Café', type: 'business', aiVerified: true, isLive: true, media: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', 'https://images.unsplash.com/photo-1521017432531-fbd92d768814'], timeAgo: '1h ago', governorate: 'baghdad' },
      { id: 1002, avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f', name: 'Mutanabbi', viewed: false, thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a', userName: 'Bookwalk Baghdad', type: 'community', media: ['https://images.unsplash.com/photo-1455390582262-044cdead277a'], timeAgo: '4h ago', governorate: 'baghdad' },
    ],
    deals: [
      { id: 'd-bgd-1', discount: 25, businessLogo: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814', title: 'Baghdad Breakfast Set', description: '25% off breakfast platters before 10:30 AM.', expiresIn: '36 hours', claimed: 44, total: 120, governorate: 'baghdad' },
    ],
    events: [
      { id: 'e-bgd-1', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865', title: 'Baghdad Rooftop Music Night', aiRecommended: true, date: daysFromNow(5), venue: 'Al-Jadriya Riverside', attendees: 230, price: 15000, category: 'events_entertainment', governorate: 'baghdad' },
      { id: 'e-bgd-2', image: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7', title: 'Karrada Street Food Walk', date: daysFromNow(3), venue: 'Karrada Dakhil', attendees: 340, price: 5000, category: 'food_drink', governorate: 'baghdad' },
    ],
    postcards: [
      { id: 'pc-bgd-1', title: 'Shabandar Café', city: 'Baghdad', neighborhood: 'Al-Mutanabbi', governorate: 'Baghdad', category_tag: 'Cafe', phone: '+9647701112233', hero_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', image_gallery: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'], postcard_content: 'Historic café known for writers, poets, and late-night tea.', google_maps_url: 'https://maps.google.com/?q=33.340,44.400', rating: 4.7, review_count: 318, verified: true },
    ],
  },
  erbil: {
    businesses: [
      { id: 'erb-kai-cafe', name: 'Kai Café Erbil', nameAr: 'كاي كافيه أربيل', nameKu: 'کای کافێ هەولێر', category: 'food_drink', subcategory: 'cafes', rating: 4.6, reviewCount: 280, isFeatured: true, isVerified: true, governorate: 'Erbil', city: 'Erbil', address: 'Gulan Street', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', status: 'open' },
      { id: 'erb-ankawa-grill', name: 'Ankawa Grill House', nameAr: 'انكاوا كريل هاوس', category: 'food_drink', subcategory: 'restaurants', rating: 4.5, reviewCount: 198, isFeatured: true, isVerified: true, governorate: 'Erbil', city: 'Ankawa', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', status: 'open' },
    ],
    posts: [
      { id: 'p-erb-1', businessId: 'erb-kai-cafe', businessName: 'Kai Café Erbil', businessAvatar: 'https://images.unsplash.com/photo-1542204625-de293a8e33b3', caption: 'Cold brew + saffron cheesecake combo is back this weekend.', imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', createdAt: daysFromNow(-1), likes: 37, isVerified: true, governorate: 'erbil' },
      { id: 'p-erb-2', businessId: 'erb-ankawa-grill', businessName: 'Ankawa Grill House', businessAvatar: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5', caption: 'Tonight: mixed kebab platters with family-size offers.', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', createdAt: daysFromNow(-3), likes: 29, governorate: 'erbil' },
    ],
    stories: [
      { id: 2001, avatar: 'https://images.unsplash.com/photo-1542204625-de293a8e33b3', name: 'Kai', viewed: false, verified: true, thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', userName: 'Kai Café Erbil', type: 'business', media: ['https://images.unsplash.com/photo-1470337458703-46ad1756a187'], timeAgo: '2h ago', governorate: 'erbil' },
      { id: 2002, avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39', name: 'Erbil Walks', viewed: false, thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e', userName: 'Citadel Walkers', type: 'community', media: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e'], timeAgo: '6h ago', governorate: 'erbil' },
    ],
    deals: [{ id: 'd-erb-1', discount: 30, businessLogo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', title: 'Ankawa Dinner Deal', description: '30% off selected grills after 7 PM.', expiresIn: '2 days', claimed: 27, total: 80, governorate: 'erbil' }],
    events: [{ id: 'e-erb-1', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865', title: 'Erbil Startup Coffee Meetup', date: daysFromNow(7), venue: 'Sami Abdulrahman Park', attendees: 140, price: 0, category: 'business_services', governorate: 'erbil' }],
    postcards: [{ id: 'pc-erb-1', title: 'Kai Café Erbil', city: 'Erbil', neighborhood: 'Gulan', governorate: 'Erbil', category_tag: 'Cafe', phone: '+9647501010101', hero_image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', image_gallery: ['https://images.unsplash.com/photo-1470337458703-46ad1756a187'], postcard_content: 'Popular with remote workers and students in Erbil.', google_maps_url: 'https://maps.google.com/?q=36.191,44.009', rating: 4.6, review_count: 280, verified: true }],
  },
  basra: {
    businesses: [{ id: 'bsr-shatt-view', name: 'Shatt View Restaurant', nameAr: 'مطعم شط فيو', category: 'food_drink', subcategory: 'restaurants', rating: 4.4, reviewCount: 170, isFeatured: true, isVerified: true, governorate: 'Basra', city: 'Basra', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', status: 'open' }],
    posts: [{ id: 'p-bsr-1', businessId: 'bsr-shatt-view', businessName: 'Shatt View Restaurant', businessAvatar: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5', caption: 'Sunset seating on the river terrace is now open.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', createdAt: daysFromNow(-1), likes: 22, governorate: 'basra' }],
    stories: [{ id: 3001, avatar: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5', name: 'Shatt View', viewed: false, thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', userName: 'Shatt View', type: 'business', media: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0'], timeAgo: '3h ago', governorate: 'basra' }],
    deals: [{ id: 'd-bsr-1', discount: 20, businessLogo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', title: 'Basra River Lunch', description: 'Weekday lunch combo with 20% off.', expiresIn: '3 days', claimed: 18, total: 60, governorate: 'basra' }],
    events: [{ id: 'e-bsr-1', image: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7', title: 'Basra Corniche Night Market', date: daysFromNow(4), venue: 'Basra Corniche', attendees: 320, price: 3000, category: 'shopping', governorate: 'basra' }],
    postcards: [{ id: 'pc-bsr-1', title: 'Shatt View Restaurant', city: 'Basra', neighborhood: 'Corniche', governorate: 'Basra', category_tag: 'Restaurant', phone: '+9647802223344', hero_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', image_gallery: ['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe'], postcard_content: 'Seafood and Iraqi classics with riverfront seating.', google_maps_url: 'https://maps.google.com/?q=30.508,47.780', rating: 4.4, review_count: 170, verified: true }],
  },
  nineveh: {
    businesses: [{ id: 'nwv-old-mosul-bakery', name: 'Old Mosul Bakery', nameAr: 'مخبز الموصل القديم', category: 'food_drink', subcategory: 'restaurants', rating: 4.5, reviewCount: 143, isFeatured: true, isVerified: true, governorate: 'Nineveh', city: 'Mosul', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff', status: 'open' }],
    posts: [{ id: 'p-nwv-1', businessId: 'nwv-old-mosul-bakery', businessName: 'Old Mosul Bakery', businessAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', caption: 'Fresh samoon and date pastries available from 6 AM daily.', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff', createdAt: daysFromNow(-2), likes: 19, governorate: 'nineveh' }],
    stories: [{ id: 4001, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', name: 'Mosul Bakery', viewed: false, thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff', userName: 'Old Mosul Bakery', type: 'business', media: ['https://images.unsplash.com/photo-1509440159596-0249088772ff'], timeAgo: '5h ago', governorate: 'nineveh' }],
    deals: [{ id: 'd-nwv-1', discount: 15, businessLogo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff', title: 'Mosul Morning Box', description: '15% off bakery breakfast boxes.', expiresIn: '5 days', claimed: 12, total: 50, governorate: 'nineveh' }],
    events: [{ id: 'e-nwv-1', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e', title: 'Mosul Heritage Walk', date: daysFromNow(6), venue: 'Old City Mosul', attendees: 210, price: 0, category: 'culture_heritage', governorate: 'nineveh' }],
    postcards: [{ id: 'pc-nwv-1', title: 'Old Mosul Bakery', city: 'Mosul', neighborhood: 'Old City', governorate: 'Nineveh', category_tag: 'Bakery', phone: '+9647705556677', hero_image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff', image_gallery: ['https://images.unsplash.com/photo-1517433670267-08bbd4be890f'], postcard_content: 'Traditional oven-baked samoon and local sweets.', google_maps_url: 'https://maps.google.com/?q=36.340,43.130', rating: 4.5, review_count: 143, verified: true }],
  },
};

const govAliases: Record<string, GovId> = {
  baghdad: 'baghdad',
  erbil: 'erbil',
  arbil: 'erbil',
  basra: 'basra',
  nineveh: 'nineveh',
  mosul: 'nineveh',
};

export const normalizeGov = (value?: string) => {
  if (!value || value === 'all') return 'all';
  const key = value.trim().toLowerCase().replace(/\s+/g, '_');
  return govAliases[key] || 'all';
};

const aggregate = <T,>(selector: (item: GovContent) => T[]): T[] => Object.values(content).flatMap(selector);

export const mockData = {
  getBusinesses: (governorate?: string) => {
    const gov = normalizeGov(governorate);
    if (gov === 'all') return aggregate((c) => c.businesses);
    return content[gov]?.businesses ?? [];
  },
  getPosts: (governorate?: string) => {
    const gov = normalizeGov(governorate);
    const data = gov === 'all' ? aggregate((c) => c.posts) : content[gov]?.posts ?? [];
    return [...data].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
  getStories: (governorate?: string) => {
    const gov = normalizeGov(governorate);
    return gov === 'all' ? aggregate((c) => c.stories) : content[gov]?.stories ?? [];
  },
  getDeals: (governorate?: string) => {
    const gov = normalizeGov(governorate);
    return gov === 'all' ? aggregate((c) => c.deals) : content[gov]?.deals ?? [];
  },
  getEvents: (governorate?: string) => {
    const gov = normalizeGov(governorate);
    return gov === 'all' ? aggregate((c) => c.events) : content[gov]?.events ?? [];
  },
  getPostcards: (governorate?: string) => {
    const gov = normalizeGov(governorate);
    return gov === 'all' ? aggregate((c) => c.postcards) : content[gov]?.postcards ?? [];
  },
};
