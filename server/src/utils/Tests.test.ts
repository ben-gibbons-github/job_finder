import { describe, it, expect, beforeEach, vi } from 'vitest';

const { strategyMock } = vi.hoisted(() => ({
  strategyMock: vi.fn(),
}));

vi.mock('./NameToLonLatStrategies.js', () => ({
  geocodingStrategies: [strategyMock],
}));

import { nameToLonLat, clearLocationCache, getCacheSize } from './NameToLonLat.js';

describe('NameToLonLat', () => {
  beforeEach(() => {
    clearLocationCache();
    vi.clearAllMocks();
    strategyMock.mockReset();
  });

  describe('nameToLonLat', () => {
    it('should return coordinates for a valid location', async () => {
      strategyMock.mockResolvedValueOnce({ lat: 51.5074, lon: -0.1278 });

      const result = await nameToLonLat('London');
      expect(result).toEqual({ lat: 51.5074, lon: -0.1278 });
    });

    it('should cache results to avoid repeated API calls', async () => {
      strategyMock.mockResolvedValueOnce({ lat: 48.8566, lon: 2.3522 });

      await nameToLonLat('Paris');
      await nameToLonLat('Paris');

      expect(strategyMock).toHaveBeenCalledTimes(1);
    });

    it('should normalize location names for cache lookup', async () => {
      strategyMock.mockResolvedValueOnce({ lat: 35.6762, lon: 139.6503 });

      await nameToLonLat('Tokyo');
      await nameToLonLat('  TOKYO  ');

      expect(strategyMock).toHaveBeenCalledTimes(1);
    });

    it('should throw error when location not found', async () => {
      strategyMock.mockRejectedValueOnce(new Error('No results found for location: InvalidLocation123'));

      await expect(nameToLonLat('InvalidLocation123')).rejects.toThrow(
        'Failed to geocode location "InvalidLocation123" with all providers: No results found for location: InvalidLocation123'
      );
    });

    it('should throw error on API failure', async () => {
      strategyMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(nameToLonLat('AnyLocation')).rejects.toThrow(
        'Failed to geocode location "AnyLocation" with all providers: Network error'
      );
    });
  });

  describe('clearLocationCache', () => {
    it('should clear all cached locations', async () => {
      strategyMock.mockResolvedValue({ lat: 0, lon: 0 });

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
      strategyMock.mockResolvedValue({ lat: 0, lon: 0 });

      await nameToLonLat('Location1');
      expect(getCacheSize()).toBe(1);

      await nameToLonLat('Location2');
      expect(getCacheSize()).toBe(2);
    });
  });
});
