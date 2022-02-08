import {
  START_FETCHING_ORDERS,
  ERROR_FETCHING_ORDERS,
  SUCCESS_FETCHING_ORDERS,
  SET_PAGE,
  PREV_PAGE,
  NEXT_PAGE,
} from './constants';

import { getOrders } from '../../api/orders';
import debounce from 'debounce-promise';

export const startFetchingOrders = () => {
  return { type: START_FETCHING_ORDERS };
};

export const errorFetchingOrders = () => {
  return {
    type: ERROR_FETCHING_ORDERS,
  };
};

export const successFetchingOrders = ({ data, count, fullData }) => {
  return {
    type: SUCCESS_FETCHING_ORDERS,
    data,
    count,
    fullData,
  };
};

let debounceFetchOrders = debounce(getOrders, 500);

export const fetchOrders = (date) => {
  let startDate, endDate;
  if (date) {
    startDate = date[0].startDate;
    endDate = date[0].endDate;
  }
  return async (dispatch, getState) => {
    dispatch(startFetchingOrders());

    let perPage = getState().orders.perPage || 2;
    let currentPage = getState().orders.currentPage || 1;

    const params = {
      limit: perPage,
      skip: currentPage * perPage - perPage,
      startDate,
      endDate,
    };

    try {
      let {
        data: { data, count },
      } = await debounceFetchOrders(params);
      let fullData = await debounceFetchOrders({ startDate, endDate });
      dispatch(
        successFetchingOrders({ data, count, fullData: fullData.data.data }),
      );
    } catch (err) {
      dispatch(errorFetchingOrders());
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
