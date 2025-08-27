import { describe, it, expect } from 'vitest';

import { getRepeatIcon, shouldShowRepeatIcon, getRepeatIconClass } from '../../utils/iconUtils';

const baseEvent = {
  id: '1',
  title: '테스트 일정',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'none' as const,
    interval: 1,
  },
  notificationTime: 0,
};

describe('아이콘 유틸리티', () => {
  describe('getRepeatIcon', () => {
    it('반복이 없는 일정은 빈 아이콘을 반환한다', () => {
      const result = getRepeatIcon(baseEvent);
      expect(result).toBe('');
    });

    it('매일 반복 일정은 🔄 아이콘을 반환한다', () => {
      const dailyEvent = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-05' },
      };
      const result = getRepeatIcon(dailyEvent);
      expect(result).toBe('🔄');
    });

    it('매주 반복 일정은 📅 아이콘을 반환한다', () => {
      const weeklyEvent = {
        ...baseEvent,
        repeat: { type: 'weekly' as const, interval: 1, endDate: '2025-01-20' },
      };
      const result = getRepeatIcon(weeklyEvent);
      expect(result).toBe('📅');
    });

    it('매월 반복 일정은 📆 아이콘을 반환한다', () => {
      const monthlyEvent = {
        ...baseEvent,
        repeat: { type: 'monthly' as const, interval: 1, endDate: '2025-03-31' },
      };
      const result = getRepeatIcon(monthlyEvent);
      expect(result).toBe('📆');
    });

    it('매년 반복 일정은 🗓️ 아이콘을 반환한다', () => {
      const yearlyEvent = {
        ...baseEvent,
        repeat: { type: 'yearly' as const, interval: 1, endDate: '2027-01-01' },
      };
      const result = getRepeatIcon(yearlyEvent);
      expect(result).toBe('🗓️');
    });
  });

  describe('shouldShowRepeatIcon', () => {
    it('반복이 없는 일정은 아이콘을 표시하지 않는다', () => {
      const result = shouldShowRepeatIcon(baseEvent);
      expect(result).toBe(false);
    });

    it('반복이 있는 일정은 아이콘을 표시한다', () => {
      const repeatEvent = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-05' },
      };
      const result = shouldShowRepeatIcon(repeatEvent);
      expect(result).toBe(true);
    });
  });

  describe('getRepeatIconClass', () => {
    it('매일 반복은 icon-daily 클래스를 반환한다', () => {
      const result = getRepeatIconClass('daily');
      expect(result).toBe('icon-daily');
    });

    it('매주 반복은 icon-weekly 클래스를 반환한다', () => {
      const result = getRepeatIconClass('weekly');
      expect(result).toBe('icon-weekly');
    });

    it('매월 반복은 icon-monthly 클래스를 반환한다', () => {
      const result = getRepeatIconClass('monthly');
      expect(result).toBe('icon-monthly');
    });

    it('매년 반복은 icon-yearly 클래스를 반환한다', () => {
      const result = getRepeatIconClass('yearly');
      expect(result).toBe('icon-yearly');
    });
  });
});
