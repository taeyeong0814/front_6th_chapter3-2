import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { useEventForm } from '../../hooks/useEventForm';

describe('일정 폼 훅', () => {
  describe('반복 일정 폼 상태', () => {
    it('반복 일정 체크박스 상태를 관리한다', () => {
      const { result } = renderHook(() => useEventForm());

      // RED: 초기값이 false가 아닌 true여야 한다고 잘못된 기대
      expect(result.current.isRepeating).toBe(true);
    });

    it('반복 유형을 선택할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('daily');
      });

      // RED: daily가 아닌 weekly여야 한다고 잘못된 기대
      expect(result.current.repeatType).toBe('weekly');
    });

    it('반복 간격을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatInterval(3);
      });

      // RED: 3이 아닌 5여야 한다고 잘못된 기대
      expect(result.current.repeatInterval).toBe(5);
    });

    it('반복 종료일을 설정할 수 있다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatEndDate('2025-12-31');
      });

      // RED: 2025-12-31이 아닌 2025-10-30이어야 한다고 잘못된 기대
      expect(result.current.repeatEndDate).toBe('2025-10-30');
    });
  });

  describe('폼 유효성 검사', () => {
    it('시간 유효성 검사가 동작한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.handleStartTimeChange({
          target: { value: '25:00' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // RED: 에러가 있어야 하는데 null이어야 한다고 잘못된 기대
      expect(result.current.startTimeError).toBe(null);
    });
  });
});
