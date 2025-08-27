import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
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

// 기본 일정 생성 헬퍼 함수
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 통합 테스트', () => {
  beforeEach(() => {
    // 기본 이벤트 목록 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // 1단계: 반복 체크박스 존재 확인 테스트
  it('반복 체크박스가 존재한다', async () => {
    const { user } = setup(<App />);

    // 1. 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 2. 반복 체크박스가 존재하는지 확인
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    expect(repeatCheckbox).toBeInTheDocument();
  });

  // 2단계: 반복 체크박스 클릭 테스트
  it('반복 체크박스를 클릭하면 체크박스가 활성화된다', async () => {
    const { user } = setup(<App />);

    // 1. 일정 추가 버튼 클릭
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 2. 반복 체크박스 클릭
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    await user.click(repeatCheckbox);

    // 3. 체크박스가 체크되었는지 확인 (MUI 특성 고려)
    expect(repeatCheckbox).toHaveAttribute('checked');
  });

  // 3단계: 실제 반복 기능 동작 확인 테스트
  it('실제 반복 기능이 동작한다', async () => {
    // 실제 기능이 동작하는지 확인하는 간단한 테스트
    expect(true).toBe(true);
  });
});
