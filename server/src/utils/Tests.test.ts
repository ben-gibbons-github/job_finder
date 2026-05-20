import axios from 'axios';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nameToLonLat, clearLocationCache, getCacheSize } from './NameToLonLat';

describe('NameToLonLat', () => {
  beforeEach(() => {
    clearLocationCache();
    vi.clearAllMocks();
  });

  describe('nameToLonLat', () => {
    it('should return coordinates for a valid location', async () => {
      vi.mock('axios');
      const mockAxios = vi.mocked(axios);
      mockAxios.get.mockResolvedValueOnce({
        data: [{ lat: '51.5074', lon: '-0.1278' }],
      });

      const result = await nameToLonLat('London');
      expect(result).toEqual({ lat: 51.5074, lon: -0.1278 });
    });

    it('should cache results to avoid repeated API calls', async () => {
      vi.mock('axios');
      const mockAxios = vi.mocked(axios);
      mockAxios.get.mockResolvedValueOnce({
        data: [{ lat: '48.8566', lon: '2.3522' }],
      });

      await nameToLonLat('Paris');
      await nameToLonLat('Paris');

      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should normalize location names for cache lookup', async () => {
      vi.mock('axios');
      const mockAxios = vi.mocked(axios);
      mockAxios.get.mockResolvedValueOnce({
        data: [{ lat: '35.6762', lon: '139.6503' }],
      });

      await nameToLonLat('Tokyo');
      await nameToLonLat('  TOKYO  ');

      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error when location not found', async () => {
      vi.mock('axios');
      const mockAxios = vi.mocked(axios);
      mockAxios.get.mockResolvedValueOnce({ data: [] });

      await expect(nameToLonLat('InvalidLocation123')).rejects.toThrow(
        'No results found for location: InvalidLocation123'
      );
    });

    it('should throw error on API failure', async () => {
      vi.mock('axios');
      const mockAxios = vi.mocked(axios);
      mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(nameToLonLat('AnyLocation')).rejects.toThrow('Failed to geocode location');
    });
  });

  describe('clearLocationCache', () => {
    it('should clear all cached locations', async () => {
      vi.mock('axios');
      const mockAxios = vi.mocked(axios);
      mockAxios.get.mockResolvedValue({
        data: [{ lat: '0', lon: '0' }],
      });

      await nameToLonLat('Location1');
      await nameToLonLat('Location2');
      expect(getCacheSize()).toBe(2);

      clearLocationCache();
      expect(getCacheSize()).toBe(0);
    });
  });

  describe('getCacheSize', () => {
    it('should return 0 for empty cache', () => {
      expect(getCacheSize()).toBe(0);
    });

    it('should return correct cache size', async () => {
      vi.mock('axios');
      const mockAxios = vi.mocked(axios);
      mockAxios.get.mockResolvedValue({
        data: [{ lat: '0', lon: '0' }],
      });

      await nameToLonLat('Location1');
      expect(getCacheSize()).toBe(1);

      await nameToLonLat('Location2');
      expect(getCacheSize()).toBe(2);
    });
  });
});
