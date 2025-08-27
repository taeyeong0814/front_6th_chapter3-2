import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { debug } from 'vitest-preview';

import { Event } from '../../types';
import { getRepeatIcon, shouldShowRepeatIcon, getRepeatIconClass } from '../../utils/iconUtils';

// 간단한 아이콘 컴포넌트
function RepeatIcon({ event }: { event: Event }) {
  const icon = getRepeatIcon(event);
  const shouldShow = shouldShowRepeatIcon(event);

  if (!shouldShow) return null;

  return (
    <div data-testid="repeat-icon" className="repeat-icon">
      {icon}
    </div>
  );
}

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

describe('아이콘 기능', () => {
  describe('컴포넌트 렌더링', () => {
    it('반복이 없는 일정은 아이콘을 표시하지 않는다', () => {
      render(<RepeatIcon event={baseEvent} />);

      // vitest-preview로 실제 화면 확인
      debug();

      expect(screen.queryByTestId('repeat-icon')).not.toBeInTheDocument();
    });

    it('매일 반복 일정은 🔄 아이콘을 표시한다', () => {
      const dailyEvent = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-05' },
      };

      render(<RepeatIcon event={dailyEvent} />);

      // vitest-preview로 실제 화면 확인
      debug();

      const iconElement = screen.getByTestId('repeat-icon');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveTextContent('🔄');
    });

    it('매주 반복 일정은 📅 아이콘을 표시한다', () => {
      const weeklyEvent = {
        ...baseEvent,
        repeat: { type: 'weekly' as const, interval: 1, endDate: '2025-01-20' },
      };

      render(<RepeatIcon event={weeklyEvent} />);

      // vitest-preview로 실제 화면 확인
      debug();

      const iconElement = screen.getByTestId('repeat-icon');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveTextContent('📅');
    });

    it('매월 반복 일정은 📆 아이콘을 표시한다', () => {
      const monthlyEvent = {
        ...baseEvent,
        repeat: { type: 'monthly' as const, interval: 1, endDate: '2025-03-31' },
      };

      render(<RepeatIcon event={monthlyEvent} />);

      // vitest-preview로 실제 화면 확인
      debug();

      const iconElement = screen.getByTestId('repeat-icon');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveTextContent('📆');
    });

    it('매년 반복 일정은 🗓️ 아이콘을 표시한다', () => {
      const yearlyEvent = {
        ...baseEvent,
        repeat: { type: 'yearly' as const, interval: 1, endDate: '2027-01-01' },
      };

      render(<RepeatIcon event={yearlyEvent} />);

      // vitest-preview로 실제 화면 확인
      debug();

      const iconElement = screen.getByTestId('repeat-icon');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveTextContent('🗓️');
    });
  });

  describe('shouldShowRepeatIcon 유틸리티', () => {
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

    it('모든 반복 타입에서 아이콘을 표시한다', () => {
      const repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'] as const;

      repeatTypes.forEach((type) => {
        const event = {
          ...baseEvent,
          repeat: { type, interval: 1, endDate: '2025-01-05' },
        };
        const result = shouldShowRepeatIcon(event);
        expect(result).toBe(true);
      });
    });
  });

  describe('getRepeatIconClass 유틸리티', () => {
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

    it('알 수 없는 타입은 빈 문자열을 반환한다', () => {
      const result = getRepeatIconClass('unknown');
      expect(result).toBe('');
    });

    it('none 타입은 빈 문자열을 반환한다', () => {
      const result = getRepeatIconClass('none');
      expect(result).toBe('');
    });
  });
});
