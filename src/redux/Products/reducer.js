import {
  START_FETCHING_PRODUCTS,
  SUCCESS_FETCHING_PRODUCTS,
  ERROR_FETCHING_PRODUCTS,
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
  perPage: 15,
  status: statusList.idle,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case START_FETCHING_PRODUCTS:
      return { ...state, status: statusList.idle };

    case ERROR_FETCHING_PRODUCTS:
      return { ...state, status: statusList.error };

    case SUCCESS_FETCHING_PRODUCTS:
      return {
        ...state,
        data: action.data,
        totalItems: action.count,
        status: statusList.success,
        fullData: action.fullData,
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
