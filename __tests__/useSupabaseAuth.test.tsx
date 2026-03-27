import { act, renderHook, waitFor } from '@testing-library/react';

const getSessionMock = jest.fn(async () => ({ data: { session: null }, error: null }));
const onAuthStateChangeMock = jest.fn(() => ({
  data: {
    subscription: {
      unsubscribe: jest.fn(),
    },
  },
}));
const signInWithPasswordMock = jest.fn(async () => ({ error: null }));
const signUpMock = jest.fn(async () => ({ error: null }));
const signInWithOAuthMock = jest.fn(async () => ({ error: null }));
const resetPasswordMock = jest.fn(async () => ({ error: null }));
const signOutMock = jest.fn(async () => ({ error: null }));

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession: () => getSessionMock(),
      onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
      signInWithPassword: (...args: unknown[]) => signInWithPasswordMock(...args),
      signUp: (...args: unknown[]) => signUpMock(...args),
      signInWithOAuth: (...args: unknown[]) => signInWithOAuthMock(...args),
      resetPasswordForEmail: (...args: unknown[]) => resetPasswordMock(...args),
      signOut: (...args: unknown[]) => signOutMock(...args),
    },
  },
}));

import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

describe('useSupabaseAuth', () => {
  it('exposes auth methods and initializes session state', async () => {
    const { result } = renderHook(() => useSupabaseAuth());

    await waitFor(() => expect(result.current.isAuthReady).toBe(true));

    await act(async () => {
      await result.current.signInWithEmail('user@example.com', 'secret123');
      await result.current.signUpWithEmail('user@example.com', 'secret123');
      await result.current.resetPassword('user@example.com');
      await result.current.signInWithGoogle();
      await result.current.signOut();
    });

    expect(signInWithPasswordMock).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' });
    expect(signUpMock).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' });
    expect(resetPasswordMock).toHaveBeenCalled();
    expect(signInWithOAuthMock).toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalled();
  });
});
