import {
  START_FETCHING_USER,
  ERROR_FETCHING_USER,
  SUCCESS_FETCHING_USER,
  SET_PAGE,
  NEXT_PAGE,
  PREV_PAGE,
} from './constants';

import { getUsers } from '../../api/users';
import debounce from 'debounce-promise';

export const startFetchingUsers = () => {
  return { type: START_FETCHING_USER };
};

export const errorFetchingUsers = () => {
  return { type: ERROR_FETCHING_USER };
};

export const successFetchingUsers = ({ data, count }) => {
  return {
    type: SUCCESS_FETCHING_USER,
    data,
    count,
  };
};

let debountFetchUsers = debounce(getUsers, 500);

export const fetchUsers = () => {
  return async (dispatch, getState) => {
    dispatch(startFetchingUsers());

    let perPage = getState().users.perPage || 2;
    let currentPage = getState().users.currentPage || 1;

    const params = {
      limit: perPage,
      skip: currentPage * perPage - perPage,
    };

    try {
      let {
        data: { data, count },
      } = await debountFetchUsers(params);

      dispatch(successFetchingUsers({ data, count }));
    } catch (err) {
      dispatch(errorFetchingUsers());
    }
  };
};

export const setPage = (number = 1) => {
  return {
    type: SET_PAGE,
    currentPage: number,
  };
};

export const goToNextPage = () => {
  return {
    type: NEXT_PAGE,
  };
};

export const goToPrevPage = () => {
  return {
    type: PREV_PAGE,
  };
};
