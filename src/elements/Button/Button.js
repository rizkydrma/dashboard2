/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import { Link } from 'react-router-dom';
import propTypes from 'prop-types';
import './button.css';

export default function Button(props) {
  const className = [props.className];

  if (props.isLarge) className.push('btn-lg');
  if (props.isSmall) className.push('btn-sm');
  if (props.hasShadow) className.push('btn-shadow');

  const onClick = () => {
    if (props.onClick) props.onClick();
  };

  if (props.type === 'link') {
    if (props.isExternal) {
      return (
        <a
          href={props.href}
          className={className.join(' ')}
          style={props.style}
          rel={props.target === '_blank' ? undefined : 'noopener noreferrer'}
          target={props.target === '_blank' ? '_blank' : undefined}
        >
          {props.children}
        </a>
      );
    } else {
      return (
        <Link
          to={props.href}
          className={className.join(' ')}
          style={props.style}
          onClick={onClick}
        >
          {props.children}
        </Link>
      );
    }
  }

  return (
    <button
      className={className.join(' ')}
      style={props.style}
      onClick={onClick}
      type={`${props.submit ? 'submit' : 'button'}`}
    >
      {props.children}
    </button>
  );
}

Button.propTypes = {
  onClick: propTypes.func,
  className: propTypes.string,
  isLarge: propTypes.bool,
  isSmall: propTypes.bool,
  hasShadow: propTypes.bool,
  submit: propTypes.bool,
};
