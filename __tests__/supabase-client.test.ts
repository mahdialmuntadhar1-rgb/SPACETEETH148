const createClientMock = jest.fn(() => ({ auth: {} }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

describe('supabase client initialization', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'anon-key';
  });

  it('creates a supabase client with env credentials', async () => {
    await import('../supabase');

    expect(createClientMock).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({ auth: expect.any(Object) }),
    );
  });
});
