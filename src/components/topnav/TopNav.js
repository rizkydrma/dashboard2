import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import './topnav.css';

import ThemeMenu from '../theme-menu/ThemeMenu';
import Dropdown from '../dropdown/Dropdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import { useDispatch } from 'react-redux';
import { userLogout } from '../../redux/Auth/actions';
import { logout } from '../../api/auth';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// import notifications from '../../assets/JsonData/notification.json';
import user_menu from '../../assets/JsonData/user_menus.json';
import { config } from '../../config';
const MySwal = withReactContent(Swal);

// const renderNotificationItem = (item, index) => (
//   <div className="notification-item" key={index}>
//     <i className={item.icon}></i>
//     <span>{item.content}</span>
//   </div>
// );

const renderUserToggle = (user) => (
  <div className="topnav__right-user">
    <div className="topnav__right-user__image">
      <img
        src={`${config.api_host}/upload/user/${user.image_url}`}
        alt="foto user"
      />
    </div>
    <div className="topnav__right-user__name">{user.full_name}</div>
  </div>
);

const renderUserMenu = (item, index, func) =>
  !item.content === 'Logout' ? (
    <Link to="/" key={index}>
      <div className="notification-item">
        <i className={item.icon}></i>
        <span>{item.content}</span>
      </div>
    </Link>
  ) : (
    <div className="notification-item" key={index} onClick={() => func()}>
      <i className={item.icon}></i>
      <span>{item.content}</span>
    </div>
  );

const Topnav = (props) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    MySwal.fire({
      title: 'Do you want to logout?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c40ff',
      cancelButtonColor: '#ff5353',
      confirmButtonText: 'Logout',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { data } = await logout();
        if (data.error) {
          MySwal.fire({
            text: data.message,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }

        MySwal.fire('Logout', data.message, 'success');
        dispatch(userLogout());
      }
    });
  };
  return (
    <div className="topnav">
      <div className="topnav__bar">
        <FontAwesomeIcon icon={faBars} onClick={props.handleSideBar} />
      </div>

      <div className="topnav__right">
        <div className="topnav__right-item">
          {user !== null && (
            <Dropdown
              customToggle={() => renderUserToggle(user)}
              contentData={user_menu}
              renderItems={(item, index) =>
                renderUserMenu(item, index, handleLogout)
              }
            />
          )}
        </div>
        {/* <div className="topnav__right-item">
          <Dropdown
            icon="bx bx-bell"
            badge="12"
            contentData={notifications}
            renderItems={(item, index) => renderNotificationItem(item, index)}
            renderFooter={() => <Link to="/">View All</Link>}
          />
        </div> */}
        <div className="topnav__right-item">
          <ThemeMenu />
        </div>
      </div>
    </div>
  );
};

export default Topnav;
