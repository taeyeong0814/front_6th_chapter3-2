import { Event } from '../types';

/**
 * 반복 일정을 생성하는 함수
 * @param baseEvent 기본 일정 정보
 * @returns 생성된 반복 일정들의 배열
 */
export function generateRepeatEvents(baseEvent: Event): Event[] {
  if (baseEvent.repeat.type === 'none') {
    return [baseEvent];
  } else {
    // 반복 일정 생성 로직
    const events = [baseEvent];

    if (baseEvent.repeat.type === 'daily' && baseEvent.repeat.endDate) {
      const endDate = new Date(baseEvent.repeat.endDate);
      const nextDate = new Date(baseEvent.date);
      nextDate.setDate(nextDate.getDate() + baseEvent.repeat.interval);

      if (nextDate <= endDate) {
        events.push({
          ...baseEvent,
          date: nextDate.toISOString().split('T')[0],
        });
      }
    }

    return events;
  }
}
