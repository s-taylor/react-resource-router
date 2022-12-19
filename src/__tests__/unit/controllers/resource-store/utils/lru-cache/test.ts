import { getLRUResourceKey } from '../../../../../../controllers/resource-store/utils/lru-cache';
import {
  RouteResourceDataForType,
  RouteResourceResponse,
  RouteResourceTimestamp,
} from '../../../../../../common/types';

const mock = <T>({
  data,
  accessedAt,
  expiresAt,
}: {
  data: T;
  accessedAt: RouteResourceTimestamp;
  expiresAt: RouteResourceTimestamp;
}): RouteResourceResponse<T> => ({
  loading: false,
  error: null,
  data,
  promise: Promise.resolve(data),
  accessedAt,
  expiresAt,
});

describe('lru-cache', () => {
  const resourceDataForTypeWithExpiredKeys: RouteResourceDataForType = {
    home: mock({
      data: 'home',
      accessedAt: 2500,
      expiresAt: 5000,
    }),
    about: mock({
      data: 'about',
      accessedAt: 500,
      expiresAt: 1000,
    }),
    shop: mock({
      data: 'shop',
      accessedAt: 2500,
      expiresAt: 3000,
    }),
  };

  const resourceDataForTypeWithNoExpiredKeys: RouteResourceDataForType = {
    home: mock({
      data: 'home',
      accessedAt: 2400,
      expiresAt: 5000,
    }),
    about: mock({
      data: 'about',
      accessedAt: 2600,
      expiresAt: 3500,
    }),
    shop: mock({
      data: 'shop',
      accessedAt: 2500,
      expiresAt: 3000,
    }),
  };

  const currentTime = 2000;

  beforeEach(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(currentTime);
  });

  describe('getLRUResourceKey', () => {
    it('should return null if max cache is equal to Infinity', () => {
      const key = getLRUResourceKey(
        Infinity,
        resourceDataForTypeWithExpiredKeys,
        'home'
      );
      expect(key).toBeNull();
    });

    it('should return null if max cache is less than 1', () => {
      const key = getLRUResourceKey(
        0,
        resourceDataForTypeWithExpiredKeys,
        'home'
      );
      expect(key).toBeNull();
    });

    it('should return expired key if keys for a type are less than the max cache value', () => {
      const key = getLRUResourceKey(
        2,
        resourceDataForTypeWithExpiredKeys,
        'home'
      );
      expect(key).toEqual('about');
    });

    it('should return the least recent key which is not equal to the current key if max cache is attained for a type', () => {
      expect(
        getLRUResourceKey(2, resourceDataForTypeWithNoExpiredKeys, 'home')
      ).toEqual('home');

      expect(
        getLRUResourceKey(2, resourceDataForTypeWithNoExpiredKeys, 'shop')
      ).toEqual('home');
    });
  });
});
