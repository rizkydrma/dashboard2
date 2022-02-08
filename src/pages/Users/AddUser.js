import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { addUsers } from '../../api/users';
import ImageDefault from '../../assets/images/image_default.png';

import { rules } from '../../validation/UserValidation';
import Button from '../../elements/Button/Button';

const statusList = {
  idle: 'idle',
  proccess: 'proccess',
  success: 'success',
  error: 'error',
};

const initRole = ['admin', 'kitchen', 'cashier', 'waiter'];
const initActive = ['active', 'deactive', 'suspend'];

function AddUser() {
  const history = useHistory();
  const [status, setStatus] = useState(statusList.idle);
  const [role, setRole] = useState('');
  const [active, setActive] = useState('active');
  const [imagePreview, setImagePreview] = useState(ImageDefault);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const MySwal = withReactContent(Swal);

  const onSubmit = async (data) => {
    setStatus(statusList.proccess);
    const formData = new FormData();
    const { image, confirmPassword, ...restData } = data;
    const keys = Object.keys(restData);
    const values = Object.values(restData);

    formData.append('image', image[0]);
    keys.forEach((item, idx) => {
      formData.append(item, values[idx]);
    });

    if (data.password !== confirmPassword) {
      setError('password', {
        message: 'Password Tidak Cocok !',
      });
      setStatus(statusList.error);
      return;
    }

    const product = await addUsers(formData);

    if (product.error) {
      setError('full_name', {
        message: product.message,
      });
      setStatus(statusList.error);
    } else {
      onSubmitSuccess('Berhasil Menambah Data!');
      setStatus(statusList.success);
    }
  };

  const onSubmitSuccess = (message) => {
    MySwal.fire({
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#4caf50',
    }).then((result) => {
      if (result.isConfirmed) {
        history.push('/users');
      }
    });
  };

  const imageHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  useEffect(() => {
    setStatus(statusList.idle);
    return () => setStatus(statusList.idle);
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Add Data User</h1>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
              <div className="col-sm-12 col-md-12 col-6">
                <div className="input">
                  {errors.full_name && (
                    <span className="error">*{errors.full_name.message}</span>
                  )}
                  <input
                    type="text"
                    className="input-field"
                    ref={register(rules.full_name)}
                    name="full_name"
                  />
                  <label className="input-label">Full Name</label>
                </div>
                <div className="input">
                  {errors.email && (
                    <span className="error">*{errors.email.message}</span>
                  )}
                  <input
                    type="email"
                    className="input-field"
                    ref={register(rules.email)}
                    name="email"
                  />
                  <label className="input-label">Email</label>
                </div>
                <div className="input">
                  {errors.password && (
                    <span className="error">*{errors.password.message}</span>
                  )}
                  <input
                    type="password"
                    className="input-field"
                    ref={register(rules.password)}
                    name="password"
                  />
                  <label className="input-label">Password</label>
                </div>
                <div className="input">
                  {errors.confirmPassword && (
                    <span className="error">
                      *{errors.confirmPassword.message}
                    </span>
                  )}
                  <input
                    type="password"
                    className="input-field"
                    ref={register(rules.confirmPassword)}
                    name="confirmPassword"
                  />
                  <label className="input-label">Confirm Password</label>
                </div>
                <div className="input">
                  {errors.active && (
                    <span className="error">*{errors.active.message}</span>
                  )}
                  <div className="list-colors">
                    {initActive &&
                      initActive.map((item, idx) => (
                        <div
                          className={`pill  active ${
                            item === active ? 'pill-theme' : ''
                          }`}
                          key={idx}
                          onClick={() => setActive(item)}
                        >
                          {item}
                        </div>
                      ))}
                  </div>
                  <label htmlFor="active">Status User</label>
                  <input
                    value={active}
                    type="hidden"
                    name="active"
                    ref={register(rules.active)}
                  />
                </div>
              </div>
              <div className="col-sm-12 col-md-12 col-6">
                <div className="input">
                  {errors.image && (
                    <span className="error">*{errors.image.message}</span>
                  )}
                  <input
                    type="file"
                    name="image"
                    onChange={(e) => imageHandler(e)}
                    ref={register()}
                    className="custom-file-input"
                  />
                  <label className="input-label">Image Product</label>
                </div>
                <div className="image-preview">
                  <img src={imagePreview} alt="" style={{ maxWidth: 150 }} />
                </div>
                <div className="input" style={{ marginTop: 15 }}>
                  {errors.role && (
                    <span className="error">*{errors.role.message}</span>
                  )}
                  <div className="list-colors">
                    {initRole &&
                      initRole.map((item, idx) => (
                        <div
                          className={`pill  active ${
                            item === role ? 'pill-theme' : ''
                          }`}
                          key={idx}
                          onClick={() => setRole(item)}
                        >
                          {item}
                        </div>
                      ))}
                  </div>
                  <label htmlFor="role">Role User</label>
                  <input
                    value={role}
                    type="hidden"
                    name="role"
                    ref={register(rules.role)}
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              submit
              className="btn btn-theme btn-lg btn-block"
              disabled={status === 'proccess'}
            >
              Add Data
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUser;
