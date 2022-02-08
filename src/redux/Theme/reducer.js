import { SET_MODE, SET_COLOR } from './constants.js';

const initialState = {};

const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MODE:
      return {
        ...state,
        mode: action.payload,
      };

    case SET_COLOR:
      return {
        ...state,
        color: action.payload,
      };

    default:
      return state;
  }
};

export default themeReducer;
