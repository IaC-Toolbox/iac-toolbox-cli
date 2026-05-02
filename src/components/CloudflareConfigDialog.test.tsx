import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { validateToken } from './CloudflareConfigDialog.js';

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('validateToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns valid when fetch responds 200 with success: true', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response);

    const result = await validateToken('valid-token');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('Token validated');
  });

  it('returns valid when fetch responds 200 with no success field', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    const result = await validateToken('valid-token');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('Token validated');
  });

  it('returns invalid when fetch responds with 401', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    const result = await validateToken('invalid-token');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('401');
  });

  it('returns invalid when fetch responds 200 with success: false', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: false }),
    } as Response);

    const result = await validateToken('limited-token');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('200');
  });

  it('returns invalid on network error', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
      new Error('Network error')
    );

    const result = await validateToken('some-token');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Connection failed');
  });
});
