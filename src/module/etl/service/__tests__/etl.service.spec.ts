import { EtlService } from '../etl.service';

describe('EtlService', () => {
  let service: EtlService;

  beforeEach(() => {
    service = new EtlService(null as any, null as any, null as any, null as any);
  });

  describe('calculateInitialQueryParams', () => {
    it('should correctly calculate time window for given date', () => {
      const testDate = new Date('2023-05-15T14:30:45.123Z');

      const expectedEndDate = new Date('2023-05-15T14:29:59.999Z');
      const expectedStartDate = new Date(expectedEndDate.getTime() - EtlService.HISTORY_PRELOAD_PERIOD);

      const result = service['calculateInitialQueryParams'](testDate);

      expect(result.endDate.getTime()).toBe(expectedEndDate.getTime());
      expect(result.startDate.getTime()).toBe(expectedStartDate.getTime());
      expect(result.pageNumber).toBeNull();
    });

    it('should handle exact minute boundary', () => {
      const testDate = new Date('2023-05-15T14:30:00.000Z');

      const expectedEndDate = new Date('2023-05-15T14:29:59.999Z');
      const expectedStartDate = new Date(expectedEndDate.getTime() - EtlService.HISTORY_PRELOAD_PERIOD);

      const result = service['calculateInitialQueryParams'](testDate);

      expect(result.endDate.getTime()).toBe(expectedEndDate.getTime());
      expect(result.startDate.getTime()).toBe(expectedStartDate.getTime());
    });

    it('should calculate correct window for different dates', () => {
      const testCases = [
        {
          input: new Date('2023-01-01T00:00:00.000Z'),
          expectedEnd: new Date('2022-12-31T23:59:59.999Z'),
        },
        {
          input: new Date('2023-12-31T23:59:59.999Z'),
          expectedEnd: new Date('2023-12-31T23:58:59.999Z'),
        },
        {
          input: new Date('2024-02-29T12:15:30.500Z'),
          expectedEnd: new Date('2024-02-29T12:14:59.999Z'),
        },
      ];

      testCases.forEach(({ input, expectedEnd }) => {
        const result = service['calculateInitialQueryParams'](input);
        const expectedStart = new Date(expectedEnd.getTime() - EtlService.HISTORY_PRELOAD_PERIOD);

        expect(result.endDate.getTime()).toBe(expectedEnd.getTime());
        expect(result.startDate.getTime()).toBe(expectedStart.getTime());
      });
    });
  });
});
