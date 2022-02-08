import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import themeAction from '../../redux/Theme/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInbox,
  faProcedures,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';

import GuestOnlyRoute from '../GuestOnlyRoute';
import './layout.css';

import Login from '../../pages/Login';

import Sidebar from '../sidebar/Sidebar';
import TopNav from '../topnav/TopNav';
import Routes from '../Routes';

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { socket } from '../../app/websocket';

const Layout = () => {
  const dispatch = useDispatch();
  const themeReducer = useSelector((state) => state.theme);
  const [sidebar, setSidebar] = useState(false);

  const handleSideBar = () => {
    setSidebar(!sidebar);
  };

  useEffect(() => {
    const themeClass = localStorage.getItem('themeMode', 'theme-mode-light');
    const colorClass = localStorage.getItem('colorMode', 'theme-mode-light');

    dispatch(themeAction.setMode(themeClass));
    dispatch(themeAction.setColor(colorClass));

    socket.on('notifNewOrder', (data) => {
      switch (data.type) {
        case 'preparing':
          toast.info(`Pesanan Baru Atas Nama : ${data.user}`, {
            icon: <FontAwesomeIcon icon={faInbox} />,
          });
          break;
        case 'delivery':
          toast.warning(`Pesanan Siap Atas Nama : ${data.user}`, {
            icon: <FontAwesomeIcon icon={faProcedures} />,
          });
          break;
        case 'delivered':
          toast.success(`Pesanan Terkirim Atas Nama : ${data.user}`, {
            icon: <FontAwesomeIcon icon={faCheckDouble} />,
          });
          break;
        default:
      }
    });

    return function cleanup() {
      socket.off('notifNewOrder', (data) => {
        console.log('socket notif new order is off');
      });
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Switch>
        <GuestOnlyRoute path="/login">
          <Login />
        </GuestOnlyRoute>

        <Route
          render={(props) => (
            <div
              className={`layout ${themeReducer.mode} ${themeReducer.color}`}
            >
              <Sidebar {...props} sidebar={sidebar} />
              <div className={`layout__content ${sidebar ? 'minimize' : ''}`}>
                <TopNav handleSideBar={() => handleSideBar()} />
                <div className="layout__content-main">
                  <Routes />
                </div>
                <ToastContainer autoClose={10000} theme="colored" />
              </div>
            </div>
          )}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default Layout;
