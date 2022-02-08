import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

import Badge from '../../components/badge/Badge';
import { getOneUser, deleteOneUser, updateOneUser } from '../../api/users';
import {
  fetchUsers,
  setPage,
  goToNextPage,
  goToPrevPage,
} from '../../redux/Users/actions';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Table from '../../components/table/Table';
import Pagination from '../../elements/Pagination/Pagination';
import Modal from '../../elements/Modal/Modal';
import ImageDefault from '../../assets/images/image_default.png';

import { rules } from '../../validation/UserValidation';
import { socket } from '../../app/websocket';
import { config } from '../../config';

const initRole = ['admin', 'kitchen', 'cashier', 'waiter'];
const initialState = {
  _id: '',
  full_name: '',
  password: '',
  confirmPassword: '',
  email: '',
  role: '',
  image_url: '',
  active: '',
};

const initActive = ['active', 'deactive', 'suspend'];
const statusList = {
  idle: 'idle',
  proccess: 'proccess',
  success: 'success',
  error: 'error',
};

function Users() {
  const dispatch = useDispatch();
  const target = useRef();
  const [show, setShow] = useState(false);
  const [state, setState] = useState(initialState);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState(statusList.idle);
  const MySwal = withReactContent(Swal);
  const users = useSelector((state) => state.users);
  const [imagePreview, setImagePreview] = useState(ImageDefault);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const usersData = useMemo(
    () => [
      ...users.data
        .filter((user) => user.role !== 'guest')
        .map((user, idx) => {
          return { ...user, no: idx + 1 };
        }),
    ],
    [users],
  );

  const usersColumns = useMemo(
    () => [
      { Header: 'No', accessor: 'no' },
      { Header: 'Full Name', accessor: 'full_name' },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Role', accessor: 'role' },
      { Header: 'status', accessor: 'active' },
      {
        Header: 'Image',
        accessor: 'image_url',
        Cell: ({ value }) => {
          return (
            <img
              src={
                value !== 'null'
                  ? `${config.api_host}/upload/user/${value}`
                  : `${config.api_host}/upload/user/user.jpg`
              }
              alt={value}
              style={{ maxWidth: 50 }}
            />
          );
        },
      },
    ],
    [],
  );

  const fetchOneUser = async (id) => {
    setShow(true);

    let { data } = await getOneUser(id);

    if (data.error) {
      console.log(data.error);
      return;
    }
    setState({
      _id: data._id,
      full_name: data.full_name,
      password: '',
      confirmPassword: '',
      email: data.email,
      role: data.role,
      image_url: data.image_url,
      active: data.active,
    });
  };

  const onDelete = useCallback(
    async (id) => {
      MySwal.fire({
        title: 'Do you want to Delete?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#7c40ff',
        cancelButtonColor: '#ff5353',
        confirmButtonText: 'Delete',
      }).then(async (result) => {
        if (result.isConfirmed) {
          let data = await deleteOneUser(id);
          if (data.error) {
            MySwal.fire({
              text: data.message,
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
          MySwal.fire('Deleted!', data.message, 'success');
          setSuccess(true);
        }
      });
    },
    [MySwal],
  );

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: 'Action',
        Header: 'Action',
        Cell: ({ row }) => (
          <>
            <Badge
              onClick={() => fetchOneUser(row.original._id)}
              type="success"
              content="edit"
            />{' '}
            <Badge
              onClick={() => onDelete(row.original._id)}
              type="danger"
              content="delete"
            />
          </>
        ),
      },
    ]);
  };

  const onSubmit = async (data) => {
    setStatus(statusList.proccess);
    const formData = new FormData();
    const { id, image, email, confirmPassword, password, ...restData } = data;
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
    if (password.length > 0) {
      formData.append('password', password);
    }

    const product = await updateOneUser(id, formData);
    if (product.error > 0) {
      setError('full_name', {
        message: product.message,
      });
      setStatus(statusList.error);
    } else {
      onSubmitSuccess('Berhasil Mengubah Data!');
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
        setState(initialState);
        setShow(false);
        setSuccess(true);
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
    dispatch(fetchUsers());
    setSuccess(false);

    socket.on('thisNewUser', (data) => {
      dispatch(fetchUsers());
    });

    return function cleanup() {
      socket.off('thisNewUser', (data) => {
        console.log('socket off this new customer');
      });
    };
  }, [dispatch, users.currentPage, success]);

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Users</h1>
      <div className="card">
        <div className="card__body">
          <Table
            columns={usersColumns}
            data={usersData}
            tableHooks={tableHooks}
            addData="/users/add"
            withFeature
          />
        </div>
        <div className="card__footer">
          <Pagination
            totalItems={users.totalItems}
            page={users.currentPage}
            perPage={users.perPage}
            onChange={(page) => dispatch(setPage(page))}
            onNext={(_) => dispatch(goToNextPage())}
            onPrev={(_) => dispatch(goToPrevPage())}
          />
        </div>
      </div>

      <Modal
        show={show}
        onClose={() => setShow(false)}
        title="Edit Data Category"
        onSave={() => target.current.click()}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" name="id" value={state._id} ref={register()} />
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
                  value={state.full_name}
                  onChange={(e) =>
                    setState({ ...state, full_name: e.target.value })
                  }
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
                  value={state.email}
                  onChange={(e) =>
                    setState({ ...state, email: e.target.value })
                  }
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
                  ref={register()}
                  name="password"
                  value={state.password}
                  onChange={(e) =>
                    setState({ ...state, password: e.target.value })
                  }
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
                  ref={register()}
                  name="confirmPassword"
                  value={state.confirmPassword}
                  onChange={(e) =>
                    setState({ ...state, confirmPassword: e.target.value })
                  }
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
                        className={`pill active ${
                          item === state.active ? 'pill-theme' : ''
                        }`}
                        key={idx}
                        onClick={() => setState({ ...state, active: item })}
                      >
                        {item}
                      </div>
                    ))}
                </div>
                <label htmlFor="active">Status User</label>
                <input
                  value={state.active}
                  type="hidden"
                  name="active"
                  ref={register(rules.active)}
                  onChange={(e) =>
                    setState({ ...state, active: e.target.value })
                  }
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
                />
                <label className="input-label">Image Product</label>
              </div>
              <div className="image-preview">
                <img
                  src={
                    state.image_url !== undefined
                      ? `${config.api_host}/upload/user/${state.image_url}`
                      : imagePreview
                  }
                  alt=""
                  style={{ maxWidth: 150 }}
                />
              </div>
              <div className="input">
                {errors.role && (
                  <span className="error">*{errors.role.message}</span>
                )}
                <div className="list-colors">
                  {initRole &&
                    initRole.map((item, idx) => (
                      <div
                        className={`pill active ${
                          item === state.role ? 'pill-theme' : ''
                        }`}
                        key={idx}
                        onClick={() => setState({ ...state, role: item })}
                      >
                        {item}
                      </div>
                    ))}
                </div>
                <label htmlFor="role">Role User</label>
                <input
                  value={state.role}
                  type="hidden"
                  name="role"
                  ref={register(rules.role)}
                  onChange={(e) => setState({ ...state, role: e.target.value })}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-theme btn-lg"
            disabled={status === 'proccess'}
            ref={target}
            style={{ display: 'none' }}
          >
            Add Data
          </button>
        </form>
      </Modal>
    </>
  );
}

export default Users;
