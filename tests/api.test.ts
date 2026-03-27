import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn((...args) => ({ __query: args }));
const collectionMock = vi.fn((...args) => ({ __collection: args }));
const whereMock = vi.fn((...args) => ({ __where: args }));
const orderByMock = vi.fn((...args) => ({ __orderBy: args }));
const limitMock = vi.fn((...args) => ({ __limit: args }));
const startAfterMock = vi.fn((...args) => ({ __startAfter: args }));
const getDocsMock = vi.fn();
const addDocMock = vi.fn();
const serverTimestampMock = vi.fn(() => 'SERVER_TS');
const docMock = vi.fn((...args) => ({ __doc: args }));
const getDocMock = vi.fn();
const setDocMock = vi.fn();
const getDocFromServerMock = vi.fn();
const onSnapshotMock = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  query: queryMock,
  where: whereMock,
  limit: limitMock,
  startAfter: startAfterMock,
  orderBy: orderByMock,
  getDocs: getDocsMock,
  addDoc: addDocMock,
  serverTimestamp: serverTimestampMock,
  doc: docMock,
  getDoc: getDocMock,
  setDoc: setDocMock,
  getDocFromServer: getDocFromServerMock,
  onSnapshot: onSnapshotMock,
  Timestamp: class {},
}));

const authState = {
  currentUser: {
    uid: 'auth_uid',
    email: 'user@example.com',
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: [],
  },
};

vi.mock('../firebase', () => ({
  db: { id: 'mock-db' },
  auth: authState,
}));

describe('api service', () => {
  beforeEach(() => {
    vi.resetModules();
    getDocFromServerMock.mockResolvedValue(undefined);
    getDocMock.mockReset();
    setDocMock.mockReset();
    getDocsMock.mockReset();
  });

  it('creates a new owner profile when no document exists', async () => {
    getDocMock.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
    });

    const { api } = await import('../services/api');

    const result = await api.getOrCreateProfile(
      {
        uid: 'u1',
        displayName: '',
        email: 'owner@example.com',
        photoURL: '',
        emailVerified: true,
      },
      'owner',
    );

    expect(result).toMatchObject({
      id: 'u1',
      role: 'owner',
      businessId: 'b_u1',
      email: 'owner@example.com',
    });
    expect(setDocMock).toHaveBeenCalledTimes(1);
  });

  it('promotes admin email to admin role if existing profile is not admin', async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ id: 'admin1', role: 'user', email: 'safaribosafar@gmail.com' }),
    });

    const { api } = await import('../services/api');

    const result = await api.getOrCreateProfile(
      {
        uid: 'admin1',
        email: 'safaribosafar@gmail.com',
        emailVerified: true,
        displayName: 'Admin',
        photoURL: '',
      },
      'user',
    );

    expect(result).toMatchObject({ role: 'admin' });
    expect(setDocMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ role: 'admin' }),
      { merge: true },
    );
  });

  it('builds a filtered businesses query and returns pagination metadata', async () => {
    getDocsMock.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ name: 'A', verified: true }) },
        { id: 'b2', data: () => ({ name: 'B' }) },
      ],
    });

    const { api } = await import('../services/api');

    const response = await api.getBusinesses({
      city: 'Baghdad',
      category: 'food',
      governorate: 'baghdad',
      featuredOnly: true,
      limit: 2,
    });

    expect(collectionMock).toHaveBeenCalledWith({ id: 'mock-db' }, 'businesses');
    expect(whereMock).toHaveBeenCalledWith('city', '>=', 'Baghdad');
    expect(whereMock).toHaveBeenCalledWith('city', '<=', 'Baghdad\uf8ff');
    expect(whereMock).toHaveBeenCalledWith('category', '==', 'food');
    expect(whereMock).toHaveBeenCalledWith('governorate', '==', 'baghdad');
    expect(whereMock).toHaveBeenCalledWith('isFeatured', '==', true);
    expect(limitMock).toHaveBeenCalledWith(2);

    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toMatchObject({ id: 'b1', isVerified: true });
    expect(response.data[1]).toMatchObject({ id: 'b2', isVerified: false });
    expect(response.hasMore).toBe(true);
  });
});
