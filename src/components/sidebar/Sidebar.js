import React from 'react';
import { useSelector } from 'react-redux';
import './sidebar.css';

import logo from '../../assets/images/logo_rosid_red.png';

import sidebar_items from '../../assets/JsonData/sidebar_routes.json';
import { Link } from 'react-router-dom';

const SidebarItem = (props) => {
  const active = props.active ? 'active' : '';

  return (
    <div className="sidebar__item">
      <div className={`sidebar__item-inner ${active}`}>
        <i className={props.icon}></i>
        <span>{props.title}</span>
      </div>
    </div>
  );
};

const Sidebar = (props) => {
  let { user } = useSelector((state) => state.auth);
  const activeItem = sidebar_items.findIndex(
    (item) => item.route === props.location.pathname,
  );

  return (
    <div className={`sidebar ${props.sidebar ? 'minimize' : ''}`}>
      <div className="sidebar__logo">
        <img src={logo} alt="company logo" />
        <span>Studio Rosid</span>
      </div>

      {user !== null &&
        sidebar_items.map((item, index) => {
          let show = item.policy.includes(user.role);
          if (show) {
            return (
              <Link to={item.route} key={index}>
                <SidebarItem
                  title={item.display_name}
                  icon={item.icon}
                  active={index === activeItem}
                />
              </Link>
            );
          }
          return '';
        })}
    </div>
  );
};

export default Sidebar;
