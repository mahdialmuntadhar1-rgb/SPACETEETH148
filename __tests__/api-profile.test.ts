const maybeSingleMock = jest.fn(async () => ({ data: null, error: null }));
const singleMock = jest.fn(async () => ({ data: { id: 'uid-1', role: 'user' }, error: null }));
const insertMock = jest.fn(() => ({ select: () => ({ single: () => singleMock() }) }));
const fromMock = jest.fn(() => ({
  select: () => ({ eq: () => ({ maybeSingle: () => maybeSingleMock() }) }),
  insert: (...args: unknown[]) => insertMock(...args),
}));

jest.mock('../supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
    auth: {
      getUser: jest.fn(async () => ({ data: { user: { id: 'uid-1', email: 'user@example.com' } } })),
    },
  },
}));

import { api } from '../services/api';

describe('api.getOrCreateProfile', () => {
  it('creates a user profile when one does not exist', async () => {
    await api.getOrCreateProfile({ id: 'uid-1', email: 'user@example.com', user_metadata: {} }, 'owner');

    expect(fromMock).toHaveBeenCalledWith('users');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'uid-1',
        email: 'user@example.com',
        role: 'owner',
      }),
    );
  });
});
