import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { login } from '../api/auth';
import { userLogin } from '../redux/Auth/actions';
import { rules } from '../validation/LoginValidation';
import Button from '../elements/Button/Button';
import Logo from '../assets/images/logo_rosid_red.png';

import '../assets/css/login.css';

const statusList = {
  idle: 'idle',
  proccess: 'proccess',
  success: 'success',
  error: 'error',
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const [status, setStatus] = useState(statusList.idle);
  const dispatch = useDispatch();
  const MySwal = withReactContent(Swal);

  const onSubmit = async ({ email, password }) => {
    setStatus(statusList.proccess);

    let { data } = await login(email, password);

    if (data.error) {
      setError('password', {
        type: 'invalidCredential',
        message: data.message,
      });

      setStatus(statusList.error);
      return;
    }

    if (data.user.role === 'guest') {
      setError('password', {
        type: 'invalidCredential',
        message: 'Akun tidak memiliki akses!',
      });

      setStatus(statusList.error);
      return;
    }

    let { user, token } = data;

    dispatch(userLogin(user, token));
    onSubmitSuccess(data.message);
    setStatus(statusList.success);
  };

  const onSubmitSuccess = (message) => {
    MySwal.fire({
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#4caf50',
    });
  };

  useEffect(() => {
    setStatus(statusList.idle);
    return function cleanup() {
      setStatus(statusList.idle);
    };
  }, []);

  return (
    <div className="full-background gradient">
      <div className="container">
        <form onSubmit={handleSubmit(onSubmit)} className="form-login">
          <div className="login__logo">
            <img src={Logo} alt="Logo Studio Rosid" />
            <span>Studio Rosid</span>
          </div>
          <h5 className="aggresive-text">
            Hello there! Sign in and start working today with happiness.
          </h5>
          <div className="form-group">
            <label htmlFor="email">Email</label> <br />
            <input
              type="email"
              name="email"
              id="email"
              ref={register(rules.email)}
              placeholder="type a email..."
              className={`${errors.email ? 'invalid' : ''} `}
            />
            {errors.email && (
              <span className="error">*{errors.email.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label> <br />
            <input
              type="password"
              name="password"
              id="password"
              ref={register(rules.password)}
              placeholder="type a password..."
              className={`${errors.password ? 'invalid' : ''}`}
            />
            {errors.password && (
              <span className="error">*{errors.password.message}</span>
            )}
          </div>
          <br />
          <Button
            type="submit"
            submit
            className="btn btn-lg btn-danger btn-block"
            disabled={status === 'proccess'}
          >
            Sign In Now
          </Button>
        </form>

        <div className="drops">
          <div className="drop drop-1"></div>
          <div className="drop drop-2"></div>
          <div className="drop drop-3"></div>
          <div className="drop drop-4"></div>
          <div className="drop drop-5"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// <div className="card login">
// <div className="card__header">
//   <div className="login__logo">
//     <img src={Logo} alt="Logo Studio Rosid" />
//     <span>Studio Rosid</span>
//   </div>
// </div>
// <div className="card__body">
//   <h5 className="aggresive-text">
//     Hello there! Sign in and start working today with happiness.
//   </h5>
//   <form onSubmit={handleSubmit(onSubmit)} className="form-group">
//     <div className="form-input">
//       <input
//         type="text"
//         name="email"
//         id="email"
//         ref={register(rules.email)}
//         placeholder="type a username..."
//         className={`input-text ${errors.email ? 'invalid' : ''} `}
//       />
//       <span className="label">Username</span>
//       {errors.email && (
//         <span className="error">*{errors.email.message}</span>
//       )}
//     </div>
//     <div className="form-input">
//       <input
//         type="password"
//         name="password"
//         id="password"
//         ref={register(rules.password)}
//         placeholder="type a password..."
//         className={`input-text ${errors.password ? 'invalid' : ''}`}
//       />
//       <span className="label">Password</span>
//       {errors.password && (
//         <span className="error">*{errors.password.message}</span>
//       )}
//     </div>

//     <button
//       type="submit"
//       className="btn btn-danger"
//       disabled={status === 'proccess'}
//     >
//       Sign In Now
//     </button>
//   </form>
// </div>
// </div>
