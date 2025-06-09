import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../types';
import { BorrowRequest, RequestStatus } from '../../types';
import { requestAPI } from '../../services/api';

interface RequestState {
  requests: BorrowRequest[];
  loading: boolean;
  error: string | null;
  selectedRequest: BorrowRequest | null;
}

const initialState: RequestState = {
  requests: [],
  loading: false,
  error: null,
  selectedRequest: null,
};

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    fetchRequestsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRequestsSuccess: (state, action: PayloadAction<BorrowRequest[]>) => {
      state.requests = action.payload;
      state.loading = false;
    },
    fetchRequestsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedRequest: (state, action: PayloadAction<BorrowRequest | null>) => {
      state.selectedRequest = action.payload;
    },
    fetchRequestByIdSuccess: (state, action: PayloadAction<BorrowRequest | null>) => {
      state.selectedRequest = action.payload;
      state.loading = false;
    },
    addRequest: (state, action: PayloadAction<BorrowRequest>) => {
      state.requests.push(action.payload);
    },
    updateRequestStatus: (state, action: PayloadAction<BorrowRequest>) => {
      const index = state.requests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    }
  }
});

export const {
  fetchRequestsStart,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  setSelectedRequest,
  fetchRequestByIdSuccess,
  addRequest,
  updateRequestStatus
} = requestSlice.actions;

// Hành động không đồng bộ để lấy tất cả các yêu cầu
export const fetchRequests = (): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchRequestsStart());
    const requests = await requestAPI.getAll();
    dispatch(fetchRequestsSuccess(requests));
  } catch (error) {
    dispatch(fetchRequestsFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

// Hành động bất đồng bộ để nhận yêu cầu theo ID
export const getRequestById = (id: string): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchRequestsStart());
    const request = await requestAPI.getById(id);
    console.log('API getById result:', request);
    dispatch(fetchRequestByIdSuccess(request));
  } catch (error) {
    dispatch(fetchRequestsFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

// Hành động không đồng bộ để tạo yêu cầu
export const createRequest = (requestData: Omit<BorrowRequest, 'id' | 'status' | 'requestDate'>): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchRequestsStart());
    const request = await requestAPI.create(requestData);
    dispatch(addRequest(request));
  } catch (error) {
    dispatch(fetchRequestsFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

// Hành động không đồng bộ để cập nhật trạng thái yêu cầu
export const updateRequestStatusById = (id: string, status: RequestStatus): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchRequestsStart());
    const request = await requestAPI.updateStatus(id, status);
    dispatch(updateRequestStatus(request));
  } catch (error) {
    dispatch(fetchRequestsFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

// Hành động không đồng bộ để xóa yêu cầu
export const deleteRequest = (id: string): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchRequestsStart());
    await requestAPI.delete(id);
    dispatch(fetchRequests());
  } catch (error) {
    dispatch(fetchRequestsFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

export default requestSlice.reducer;