import { describe, it, expect } from 'vitest';

import { generateRepeatEvents } from '../../utils/repeatEventUtils';

describe('generateRepeatEvents', () => {
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

  // 1. (필수) 반복 유형 선택 - 요구사항에 맞춘 명확한 테스트
  describe('반복 유형 선택 - 요구사항 검증', () => {
    it('매일 반복: 매일 같은 시간에 일정이 생성된다', () => {
      const dailyEvent = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-05' },
      };
      const result = generateRepeatEvents(dailyEvent);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-02');
      expect(result[2].date).toBe('2025-01-03');
      expect(result[3].date).toBe('2025-01-04');
      expect(result[4].date).toBe('2025-01-05');
    });

    it('매주 반복: 같은 요일에 일정이 생성된다', () => {
      const weeklyEvent = {
        ...baseEvent,
        date: '2025-01-01', // 수요일
        repeat: { type: 'weekly' as const, interval: 1, endDate: '2025-01-22' },
      };
      const result = generateRepeatEvents(weeklyEvent);

      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-01-01'); // 수요일
      expect(result[1].date).toBe('2025-01-08'); // 수요일
      expect(result[2].date).toBe('2025-01-15'); // 수요일
      expect(result[3].date).toBe('2025-01-22'); // 수요일
    });

    it('매월 반복: 같은 날짜에 일정이 생성된다 (31일 기준)', () => {
      const monthlyEvent = {
        ...baseEvent,
        date: '2025-01-31',
        repeat: { type: 'monthly' as const, interval: 1, endDate: '2025-07-31' },
      };
      const result = generateRepeatEvents(monthlyEvent);

      // 31일이 있는 월에만 생성: 1월, 3월, 5월, 7월
      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-01-31');
      expect(result[1].date).toBe('2025-03-31'); // 2월은 31일이 없어서 건너뜀
      expect(result[2].date).toBe('2025-05-31'); // 4월은 31일이 없어서 건너뜀
      expect(result[3].date).toBe('2025-07-31'); // 6월은 31일이 없어서 건너뜀
    });

    it('매년 반복: 같은 날짜에 일정이 생성된다 (윤년 29일 기준)', () => {
      const yearlyEvent = {
        ...baseEvent,
        date: '2024-02-29', // 윤년
        repeat: { type: 'yearly' as const, interval: 1, endDate: '2025-10-30' },
      };
      const result = generateRepeatEvents(yearlyEvent);

      // 2024년은 윤년이므로 2월 29일 생성
      // 2025년은 평년이므로 2월 29일이 없어서 생성 안됨
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-02-29');
    });

    it('매년 반복: 평년 2월 28일은 모든 해에 생성된다', () => {
      const yearlyEvent = {
        ...baseEvent,
        date: '2023-02-28',
        repeat: { type: 'yearly' as const, interval: 1, endDate: '2025-10-30' },
      };
      const result = generateRepeatEvents(yearlyEvent);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2023-02-28');
      expect(result[1].date).toBe('2024-02-28'); // 윤년이어도 28일
      expect(result[2].date).toBe('2025-02-28');
    });
  });

  // 2. (필수) 반복 일정 표시 -> iconUtils.spec.ts에서 테스트

  // 3. (필수) 반복 종료
  describe('반복 종료', () => {
    it('endDate가 없는 경우 기본 제한(2025-10-30)까지 생성한다', () => {
      const event = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1 }, // endDate 없음
      };

      const result = generateRepeatEvents(event);

      // 2025-01-01부터 2025-10-30까지 매일 = 약 303개
      expect(result.length).toBeGreaterThan(300);
      expect(result.length).toBeLessThan(310);

      // 마지막 일정이 2025-10-30 이전이어야 함
      const lastEvent = result[result.length - 1];
      expect(new Date(lastEvent.date).getTime()).toBeLessThanOrEqual(
        new Date('2025-10-30').getTime()
      );
    });

    it('사용자 설정 종료일이 2025-10-30보다 늦으면 기본 제한을 적용한다', () => {
      const event = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-12-31' }, // 기본 제한보다 늦음
      };

      const result = generateRepeatEvents(event);

      // 2025-10-30까지만 생성되어야 함
      const lastEvent = result[result.length - 1];
      expect(new Date(lastEvent.date).getTime()).toBeLessThanOrEqual(
        new Date('2025-10-30').getTime()
      );
    });

    it('사용자 설정 종료일이 2025-10-30보다 이르면 사용자 설정을 적용한다', () => {
      const event = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-03' }, // 기본 제한보다 이름
      };

      const result = generateRepeatEvents(event);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[2].date).toBe('2025-01-03');
    });
  });

  // 4. (필수) 반복 일정 단일 수정
  describe('반복 일정 단일 수정', () => {
    it('반복 일정을 단일 일정으로 수정할 수 있다', () => {
      const repeatEvent = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-05' },
      };

      // 반복 일정 생성
      const repeatEvents = generateRepeatEvents(repeatEvent);
      expect(repeatEvents).toHaveLength(5);

      // 특정 일정을 단일 일정으로 수정 (repeat.type을 'none'으로 변경)
      const modifiedEvent = {
        ...repeatEvents[2], // 2025-01-03 일정
        repeat: { type: 'none' as const, interval: 1 },
      };

      // 수정된 일정은 반복 일정이 아님
      expect(modifiedEvent.repeat.type).toBe('none');
      expect(modifiedEvent.date).toBe('2025-01-03');
    });

    it('반복 일정 수정 시 아이콘이 사라진다', () => {
      const repeatEvent = {
        ...baseEvent,
        repeat: { type: 'weekly' as const, interval: 1, endDate: '2025-01-22' },
      };

      // 반복 일정 생성
      const repeatEvents = generateRepeatEvents(repeatEvent);
      expect(repeatEvents).toHaveLength(4);

      // 원본 반복 일정은 아이콘이 있음
      expect(repeatEvents[0].repeat.type).toBe('weekly');

      // 특정 일정을 단일 일정으로 수정
      const modifiedEvent = {
        ...repeatEvents[1], // 2025-01-08 일정
        repeat: { type: 'none' as const, interval: 1 },
      };

      // 수정된 일정은 아이콘이 없음
      expect(modifiedEvent.repeat.type).toBe('none');
      expect(modifiedEvent.date).toBe('2025-01-08');
    });

    it('수정된 단일 일정은 다른 반복 일정에 영향을 주지 않는다', () => {
      const repeatEvent = {
        ...baseEvent,
        repeat: { type: 'monthly' as const, interval: 1, endDate: '2025-04-30' },
      };

      // 반복 일정 생성
      const repeatEvents = generateRepeatEvents(repeatEvent);
      expect(repeatEvents).toHaveLength(4);

      // 중간 일정을 단일 일정으로 수정
      const modifiedEvent = {
        ...repeatEvents[1], // 2025-02-28 일정
        repeat: { type: 'none' as const, interval: 1 },
      };

      // 수정된 일정만 단일 일정이 됨
      expect(modifiedEvent.repeat.type).toBe('none');
      expect(modifiedEvent.date).toBe('2025-02-01');

      // 다른 일정들은 여전히 반복 일정
      expect(repeatEvents[0].repeat.type).toBe('monthly');
      expect(repeatEvents[2].repeat.type).toBe('monthly');
      expect(repeatEvents[3].repeat.type).toBe('monthly');
    });
  });

  // 5. (필수) 반복 일정 단일 삭제
  describe('반복 일정 단일 삭제', () => {
    it('반복 일정을 단일 삭제할 수 있다', () => {
      const repeatEvent = {
        ...baseEvent,
        repeat: { type: 'weekly' as const, interval: 1, endDate: '2025-01-20' },
      };

      // 반복 일정 생성
      const repeatEvents = generateRepeatEvents(repeatEvent);
      expect(repeatEvents).toHaveLength(3);

      // 특정 일정만 삭제 (배열에서 제거)
      const deletedEvents = repeatEvents.filter((_, index) => index !== 1);
      expect(deletedEvents).toHaveLength(2);
      expect(deletedEvents[0].date).toBe('2025-01-01'); // 첫 번째 일정
      expect(deletedEvents[1].date).toBe('2025-01-15'); // 세 번째 일정 (두 번째 삭제됨)
    });
  });

  describe('반복 간격 테스트', () => {
    it('interval이 1인 경우 기본 간격으로 생성한다', () => {
      const event = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-03' },
      };

      const result = generateRepeatEvents(event);

      expect(result).toHaveLength(3);
      expect(result[1].date).toBe('2025-01-02');
      expect(result[2].date).toBe('2025-01-03');
    });

    it('interval이 2인 경우 2배 간격으로 생성한다', () => {
      const event = {
        ...baseEvent,
        repeat: { type: 'weekly' as const, interval: 2, endDate: '2025-01-20' },
      };

      const result = generateRepeatEvents(event);

      // 2025-01-01: 첫 번째 일정
      // 2025-01-15: 2주 후 (14일)
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-15'); // 2주 간격
    });
  });

  describe('에러 처리 테스트', () => {
    it('잘못된 반복 타입에 대해 기본 일정만 반환한다', () => {
      const invalidEvent = {
        ...baseEvent,
        repeat: { type: 'invalid' as never, interval: 1, endDate: '2025-01-05' },
      };

      const result = generateRepeatEvents(invalidEvent);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(invalidEvent);
    });

    it('음수 interval에 대해 적절히 처리한다', () => {
      const event = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: -1, endDate: '2025-01-05' },
      };

      const result = generateRepeatEvents(event);

      // 음수 interval은 1로 처리되어야 함
      expect(result).toHaveLength(5);
      expect(result[1].date).toBe('2025-01-02');
    });
  });
});
