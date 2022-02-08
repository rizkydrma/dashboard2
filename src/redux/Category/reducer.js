import {
  START_FETCHING_CATEGORY,
  SUCCESS_FETCHING_CATEGORY,
  ERROR_FETCHING_CATEGORY,
  NEXT_PAGE,
  PREV_PAGE,
  SET_PAGE,
} from './constants';

const statusList = {
  idle: 'idle',
  process: 'process',
  success: 'success',
  error: 'error',
};

const initialState = {
  data: [],
  currentPage: 1,
  totalItems: -1,
  perPage: 5,
  status: statusList.idle,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case START_FETCHING_CATEGORY:
      return { ...state, status: statusList.idle };

    case ERROR_FETCHING_CATEGORY:
      return { ...state, status: statusList.error };

    case SUCCESS_FETCHING_CATEGORY:
      return {
        ...state,
        data: action.data,
        totalItems: action.count,
        status: statusList.success,
      };

    case SET_PAGE:
      return {
        ...state,
        currentPage: action.currentPage,
      };

    case NEXT_PAGE:
      return { ...state, currentPage: state.currentPage + 1 };
    case PREV_PAGE:
      return { ...state, currentPage: state.currentPage - 1 };

    default:
      return state;
  }
}
