import React from 'react';
import { Switch } from 'react-router-dom';

import GuardRoute from '../components/GuardRoute';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import Products from '../pages/Products/Products';
import AddProducts from '../pages/Products/AddProducts';
import Categories from '../pages/Category/Category';
import AddCategories from '../pages/Category/AddCategory';
import Users from '../pages/Users/Users';
import AddUser from '../pages/Users/AddUser';
import Payments from '../pages/Payments/Payments';
import Report from '../pages/Report/Report';
import TrendPenjualan from '../pages/Analytics/TrendPenjualan';
import TrendProduct from '../pages/Analytics/TrendProduct';
import TopProducts from '../pages/Analytics/TopProducts';

import Excel from '../pages/Excel';
import Analytics from '../pages/Analytics/Analytics';
import Customers from '../pages/Customers/Customers';
import { useSelector } from 'react-redux';

const Routes = () => {
  let { user } = useSelector((state) => state.auth);

  const protectRoute = (user, route) => {
    if (user !== null) {
      if (user.role !== 'admin') {
        if (user.role === 'waiter' || user.role === 'kitchen') {
          return <Orders />;
        }

        if (user.role === 'cashier') {
          return <Payments />;
        }
      }
      return route;
    }
  };

  return (
    <Switch>
      <GuardRoute path="/" exact>
        {protectRoute(user, <Dashboard />)}
      </GuardRoute>
      <GuardRoute path="/products" exact>
        {protectRoute(user, <Products />)}
      </GuardRoute>
      <GuardRoute path="/products/add">
        {protectRoute(user, <AddProducts />)}
      </GuardRoute>
      <GuardRoute path="/categories" exact>
        {protectRoute(user, <Categories />)}
      </GuardRoute>
      <GuardRoute path="/categories/add">
        {protectRoute(user, <AddCategories />)}
      </GuardRoute>
      <GuardRoute path="/users" exact>
        {protectRoute(user, <Users />)}
      </GuardRoute>
      <GuardRoute path="/users/add">
        {protectRoute(user, <AddUser />)}
      </GuardRoute>
      <GuardRoute path="/orders">{protectRoute(user, <Orders />)}</GuardRoute>
      <GuardRoute path="/payments">
        {protectRoute(user, <Payments />)}
      </GuardRoute>
      <GuardRoute path="/analytics">
        {protectRoute(user, <Analytics />)}
      </GuardRoute>
      <GuardRoute path="/customers">
        {protectRoute(user, <Customers />)}
      </GuardRoute>
      <GuardRoute path="/employee">{protectRoute(user, <Users />)}</GuardRoute>
      <GuardRoute path="/trendpenjualan">
        {protectRoute(user, <TrendPenjualan />)}
      </GuardRoute>
      <GuardRoute path="/topproducts">
        {protectRoute(user, <TopProducts />)}
      </GuardRoute>
      <GuardRoute path="/trendproduct/:name">
        {protectRoute(user, <TrendProduct />)}
      </GuardRoute>

      <GuardRoute path="/excel">
        <Excel />
      </GuardRoute>
      <GuardRoute path="/report">{protectRoute(user, <Report />)}</GuardRoute>
    </Switch>
  );
};

export default Routes;
