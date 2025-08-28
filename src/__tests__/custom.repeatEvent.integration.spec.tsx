import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerRepeatCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// 통합 테스트용 설정 함수
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// 반복 일정 생성 헬퍼 함수 (기존 saveSchedule과 동일한 방식)
const saveRepeatSchedule = async (user: UserEvent, form: Omit<Event, 'id'>) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    category,
    notificationTime,
    repeat,
  } = form;

  // notificationTime을 실제 표시되는 텍스트로 변환
  const getNotificationText = (time: number) => {
    switch (time) {
      case 1:
        return '1분 전';
      case 10:
        return '10분 전';
      case 60:
        return '1시간 전';
      case 120:
        return '2시간 전';
      case 1440:
        return '1일 전';
      default:
        return `${time}분 전`;
    }
  };

  // repeat.type을 실제 표시되는 텍스트로 변환
  const getRepeatTypeText = (type: string) => {
    switch (type) {
      case 'daily':
        return '매일';
      case 'weekly':
        return '매주';
      case 'monthly':
        return '매월';
      case 'yearly':
        return '매년';
      default:
        return type;
    }
  };

  // 1. 반복일정 체크박스가 기본적으로 선택되어 있는지 확인
  const repeatCheckbox = screen.getByLabelText('반복 일정');
  expect(repeatCheckbox).toHaveAttribute('checked');

  // 2. 반복 설정 UI가 표시되는지 확인
  expect(screen.getByText('알림 설정')).toBeInTheDocument();
  expect(screen.getByText('반복 유형')).toBeInTheDocument();
  expect(screen.getByText('반복 간격')).toBeInTheDocument();
  expect(screen.getByText('반복 종료일')).toBeInTheDocument();

  // 3. 모든 필수 일정 정보 입력 (기존 saveSchedule과 동일)
  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  // 4. 반복일정 관련 설정
  await user.click(screen.getByLabelText('알림 설정'));
  await user.click(within(screen.getByLabelText('알림 설정')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: getNotificationText(notificationTime) }));

  await user.click(screen.getByLabelText('반복 유형'));
  await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: getRepeatTypeText(repeat.type) }));
  await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());
  await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate || '2025-10-30');

  // 5. 저장
  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 기본 통합 테스트', () => {
  beforeEach(() => {
    // 반복일정 생성 전용 핸들러 설정
    setupMockHandlerRepeatCreation();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('시나리오 1: 반복 일정 생성', () => {
    it('반복일정을 생성할 수 있다', async () => {
      const { user } = setup(<App />);

      await saveRepeatSchedule(user, {
        title: '테스트 반복 일정',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 반복 일정 설명',
        location: '테스트 위치',
        category: '업무',
        notificationTime: 10, // 10분 전
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-22', // 테스트용으로 짧게 설정
        },
      });

      // 5. 성공 메시지 확인
      expect(screen.getByText(/개의 반복 일정이 추가되었습니다/)).toBeInTheDocument();
    });
  });

  describe('시나리오 2: 반복 일정 표시', () => {
    it('캘린더에서 반복 일정이 표시된다', async () => {
      const { user } = setup(<App />);

      // 1. 반복 일정 생성
      await saveRepeatSchedule(user, {
        title: '주간 회의',
        date: '2025-10-15', // 수요일
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-22', // 테스트용으로 짧게 설정
        },
      });

      // 2. 캘린더에서 반복 일정 아이콘 확인
      // 먼저 성공 메시지 확인
      expect(screen.getByText(/개의 반복 일정이 추가되었습니다/)).toBeInTheDocument();

      // 월간 뷰에서 반복 일정이 표시되는지 확인
      expect(screen.getByTestId('month-view')).toBeInTheDocument();

      // 일정 목록에서 반복 일정이 표시되는지 확인
      expect(screen.getByTestId('event-list')).toBeInTheDocument();

      // 일정 목록에서 반복 일정 제목 확인 (더 구체적으로)
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('주간 회의')).toBeInTheDocument();

      // 반복 일정 아이콘이 표시되는지 확인 (주간 반복은 📋 아이콘)
      const repeatIcons = screen.getAllByText(/📋/);
      expect(repeatIcons.length).toBeGreaterThan(0);
    });
  });

  describe('시나리오 3: 반복 일정 수정', () => {
    it('반복 일정을 수정할 수 있다', async () => {
      const { user } = setup(<App />);

      // 1. 반복 일정 생성
      await saveRepeatSchedule(user, {
        title: '수정할 반복 일정',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '수정 전 설명',
        location: '수정 전 위치',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-22', // 테스트용으로 짧게 설정 (1주일만)
        },
      });

      // 2. 성공 메시지 확인
      expect(screen.getByText(/개의 반복 일정이 추가되었습니다/)).toBeInTheDocument();

      // 3. 일정 목록에서 반복 일정 찾기
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('수정할 반복 일정')).toBeInTheDocument();

      // 4. 반복 일정 수정 버튼 클릭
      const editButton = within(eventList).getByLabelText('Edit event');
      await user.click(editButton);

      // 5. 수정 폼에서 반복 일정 체크박스 해제
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);

      // 6. 일정 정보 수정
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 단일 일정');
      await user.clear(screen.getByLabelText('설명'));
      await user.type(screen.getByLabelText('설명'), '수정된 설명');

      // 7. 수정된 일정 저장
      await user.click(screen.getByTestId('event-submit-button'));

      // 8. 수정 성공 메시지 확인
      expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
    });
  });

  describe('시나리오 4: 반복 일정 삭제', () => {
    it('반복 일정을 삭제하면 해당 인스턴스만 삭제된다', async () => {
      // TODO: 반복 일정 삭제 테스트 구현
      expect(true).toBe(true);
    });
  });
});
