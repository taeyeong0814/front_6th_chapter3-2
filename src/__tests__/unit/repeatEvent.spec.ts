import { describe, it, expect } from 'vitest';

import { generateRepeatEvents } from '../../utils/repeatEventUtils';

describe('반복 일정 생성', () => {
  it('반복이 없는 일정은 그대로 반환해야 한다', () => {
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

    const result = generateRepeatEvents(baseEvent);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(baseEvent);
  });

  // 반복 타입 종류
  // export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  it('반복 일정은 반복 타입에 따라 생성된다.', () => {
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
        type: 'daily' as const,
        interval: 1,
        endDate: '2025-01-02',
      },
      notificationTime: 0,
    };

    const result = generateRepeatEvents(baseEvent);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(baseEvent);
    expect(result[1]).toEqual({
      ...baseEvent,
      date: '2025-01-02',
    });
  });
});
