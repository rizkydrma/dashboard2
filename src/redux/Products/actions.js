import {
  START_FETCHING_PRODUCTS,
  ERROR_FETCHING_PRODUCTS,
  SUCCESS_FETCHING_PRODUCTS,
  SET_PAGE,
  NEXT_PAGE,
  PREV_PAGE,
} from './constants';

import { getProducts } from '../../api/products';
import debounce from 'debounce-promise';

export const startFetchingProducts = () => {
  return { type: START_FETCHING_PRODUCTS };
};

export const errorFetchingProducts = () => {
  return { type: ERROR_FETCHING_PRODUCTS };
};

export const successFetchingProducts = ({ data, count, fullData }) => {
  return {
    type: SUCCESS_FETCHING_PRODUCTS,
    data,
    count,
    fullData,
  };
};

let debountFetchProducts = debounce(getProducts, 500);

export const fetchProducts = () => {
  return async (dispatch, getState) => {
    dispatch(startFetchingProducts());

    let perPage = getState().products.perPage || 2;
    let currentPage = getState().products.currentPage || 1;

    const params = {
      limit: perPage,
      skip: currentPage * perPage - perPage,
    };

    try {
      let {
        data: { data, count },
      } = await debountFetchProducts(params);
      let fullData = await debountFetchProducts();

      dispatch(
        successFetchingProducts({ data, count, fullData: fullData.data.data }),
      );
    } catch (err) {
      dispatch(errorFetchingProducts());
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
