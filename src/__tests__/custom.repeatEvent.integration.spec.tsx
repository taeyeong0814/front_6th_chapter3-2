import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
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

// 확장된 일정 생성 헬퍼 함수 (일반 일정 + 반복일정)
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'> & {
    repeatType?: string;
    repeatInterval?: number;
    repeatEndDate?: string;
  }
) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    category,
    repeatType,
    repeatInterval,
    repeatEndDate,
  } = form;

  // 1. 일정 추가 버튼 클릭
  await user.click(screen.getAllByText('일정 추가')[0]);

  // 2. 기본 정보 입력
  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);

  // 3. 선택적 필드들
  if (location) await user.type(screen.getByLabelText('위치'), location);
  if (description) await user.type(screen.getByLabelText('설명'), description);
  if (category) {
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${category}-option` }));
  }

  // 4. 반복 설정 (선택적)
  if (repeatType) {
    await user.click(screen.getByLabelText('반복 일정'));
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(screen.getByRole('option', { name: repeatType }));

    if (repeatInterval && repeatInterval > 1) {
      await user.clear(screen.getByLabelText('반복 간격'));
      await user.type(screen.getByLabelText('반복 간격'), String(repeatInterval));
    }

    if (repeatEndDate) {
      await user.type(screen.getByLabelText('반복 종료일'), repeatEndDate);
    }
  }

  // 5. 저장
  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 통합 테스트', () => {
  beforeEach(() => {
    // 반복일정 생성 전용 핸들러 설정
    setupMockHandlerRepeatCreation();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // 1단계: 매일 반복 일정 생성 테스트 (RED)
  it('매일 반복 일정을 생성할 수 있다', async () => {
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '매일 운동',
      date: '2025-01-01',
      startTime: '06:00',
      endTime: '07:00',
      description: '매일 아침 운동',
      location: '헬스장',
      category: '개인',
      repeatType: '매일',
      repeatEndDate: '2025-01-05',
    });

    // 성공 메시지 확인
    expect(screen.getByText('반복 일정이 저장되었습니다.')).toBeInTheDocument();
  });
});
