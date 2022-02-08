import {
  START_FETCHING_CATEGORY,
  ERROR_FETCHING_CATEGORY,
  SUCCESS_FETCHING_CATEGORY,
  SET_PAGE,
  NEXT_PAGE,
  PREV_PAGE,
} from './constants';

import { getCategories } from '../../api/categories';
import debounce from 'debounce-promise';

export const startFetchingCategories = () => {
  return { type: START_FETCHING_CATEGORY };
};

export const errorFetchingCategories = () => {
  return { type: ERROR_FETCHING_CATEGORY };
};

export const successFetchingCategories = ({ data, count }) => {
  return {
    type: SUCCESS_FETCHING_CATEGORY,
    data,
    count,
  };
};

let debountFetchCategories = debounce(getCategories, 500);

export const fetchCategories = () => {
  return async (dispatch, getState) => {
    dispatch(startFetchingCategories());

    let perPage = getState().categories.perPage || 2;
    let currentPage = getState().categories.currentPage || 1;

    const params = {
      limit: perPage,
      skip: currentPage * perPage - perPage,
    };

    try {
      let {
        data: { data, count },
      } = await debountFetchCategories(params);

      dispatch(successFetchingCategories({ data, count }));
    } catch (err) {
      dispatch(errorFetchingCategories());
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
