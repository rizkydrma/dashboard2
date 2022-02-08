import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import themeReducer from '../redux/Theme/reducer';
import authReducer from '../redux/Auth/reducer';
import ordersReducer from '../redux/Orders/reducer';
import productsReducer from '../redux/Products/reducer';
import categoriesReducer from '../redux/Category/reducer';
import usersReducer from '../redux/Users/reducer';

import thunk from 'redux-thunk';

const composerEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducers = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  orders: ordersReducer,
  products: productsReducer,
  categories: categoriesReducer,
  users: usersReducer,
});

const store = createStore(
  rootReducers,
  composerEnhancer(applyMiddleware(thunk)),
);

export default store;
