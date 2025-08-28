import { Event } from '../types';

/**
 * 월간 반복에서 특정 날짜가 없는 달을 건너뛰고 다음 유효한 날짜를 찾는 함수
 * @param currentDate 현재 날짜
 * @param targetDay 목표 날짜 (1-31)
 * @param interval 간격 (월 단위)
 * @returns 다음 유효한 날짜
 */
function getNextValidMonthlyDate(currentDate: Date, targetDay: number, interval: number): Date {
  // 현재 날짜에서 interval만큼 월을 더함
  const nextDate = new Date(currentDate);
  nextDate.setMonth(currentDate.getMonth() + interval);

  // 해당 월의 마지막 날 확인
  const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();

  // 목표 날짜가 해당 월에 존재하는지 확인
  if (targetDay <= lastDayOfMonth) {
    // 목표 날짜가 존재하면 해당 날짜로 설정
    nextDate.setDate(targetDay);
    return nextDate;
  } else {
    // 목표 날짜가 존재하지 않으면 해당 월의 마지막 날로 설정
    nextDate.setDate(lastDayOfMonth);
    return nextDate;
  }
}

/**
 * 반복 일정을 생성하는 함수
 * @param baseEvent 기본 일정 정보
 * @returns 생성된 반복 일정들의 배열
 */
export function generateRepeatEvents(baseEvent: Event): Event[] {
  if (baseEvent.repeat.type === 'none') {
    return [baseEvent];
  }

  const events = [baseEvent];
  // 예제 특성상 2025-10-30까지만 생성
  const maxEndDate = new Date('2025-10-30');
  const userEndDate = baseEvent.repeat.endDate ? new Date(baseEvent.repeat.endDate) : null;

  // 사용자 설정 종료일과 최대 종료일 중 더 이른 날짜 선택
  const endDate = userEndDate && userEndDate < maxEndDate ? userEndDate : maxEndDate;
  const maxOccurrences = 365; // 최대 생성 개수 제한

  // 원래 시작일의 날짜를 기억 (31일 기준)
  const originalDay = new Date(baseEvent.date).getDate();
  let currentDate = new Date(baseEvent.date);
  let occurrenceCount = 1;

  // 음수 interval 처리
  const interval = Math.max(1, baseEvent.repeat.interval);

  while (occurrenceCount < maxOccurrences) {
    let nextDate = new Date(currentDate);

    switch (baseEvent.repeat.type) {
      case 'daily':
        nextDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        // 주간 반복: 7일씩 증가
        nextDate.setDate(currentDate.getDate() + 7 * interval);
        break;
      case 'monthly': {
        // 새로운 유틸리티 함수를 사용하여 다음 유효한 날짜 찾기
        nextDate = getNextValidMonthlyDate(currentDate, originalDay, interval);
        break;
      }
      case 'yearly': {
        nextDate.setFullYear(currentDate.getFullYear() + interval);

        // 윤년 처리: 2월 29일인 경우 윤년에만 생성
        if (currentDate.getMonth() === 1 && currentDate.getDate() === 29) {
          // 다음 해가 윤년인지 확인
          const nextYear = currentDate.getFullYear() + interval;
          const isLeapYear = (nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0;

          if (!isLeapYear) {
            // 평년인 경우 2월 29일이 없으므로 생성하지 않음
            // nextDate를 종료일 이후로 설정하여 루프를 종료시킴
            nextDate = new Date(endDate);
            nextDate.setDate(nextDate.getDate() + 1);
          }
        }
        break;
      }
      default:
        return events;
    }

    // 종료일 체크
    if (nextDate > endDate) {
      break;
    }

    events.push({
      ...baseEvent,
      id: `${baseEvent.id}-${occurrenceCount}`,
      date: nextDate.toISOString().split('T')[0],
    });

    currentDate = nextDate;
    occurrenceCount++;
  }

  return events;
}
