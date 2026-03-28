import { describe, expect, it, vi, beforeEach } from 'vitest';

const initializeAppMock = vi.fn(() => ({ name: 'mock-app' }));
const getFirestoreMock = vi.fn(() => ({ name: 'mock-db' }));
const getAuthMock = vi.fn(() => ({ name: 'mock-auth' }));

vi.mock('firebase/app', () => ({
  initializeApp: initializeAppMock,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: getFirestoreMock,
}));

vi.mock('firebase/auth', () => ({
  getAuth: getAuthMock,
}));

describe('firebase bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    initializeAppMock.mockClear();
    getFirestoreMock.mockClear();
    getAuthMock.mockClear();
  });

  it('initializes app, firestore, and auth with firebase config', async () => {
    const module = await import('../firebase');
    const configModule = await import('../firebase-applet-config.json');
    const firebaseConfig = configModule.default;

    expect(initializeAppMock).toHaveBeenCalledWith(firebaseConfig);
    expect(getFirestoreMock).toHaveBeenCalledWith({ name: 'mock-app' }, firebaseConfig.firestoreDatabaseId);
    expect(getAuthMock).toHaveBeenCalledWith({ name: 'mock-app' });

    expect(module.db).toEqual({ name: 'mock-db' });
    expect(module.auth).toEqual({ name: 'mock-auth' });
  });
});
