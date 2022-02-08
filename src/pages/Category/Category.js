import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

import {
  fetchCategories,
  setPage,
  goToNextPage,
  goToPrevPage,
} from '../../redux/Category/actions';

import Badge from '../../components/badge/Badge';
import Table from '../../components/table/Table';
import Pagination from '../../elements/Pagination/Pagination';
import Modal from '../../elements/Modal/Modal';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import Colors from '../../assets/JsonData/colors.json';
import { rules } from '../../validation/CategoryValidation';
import {
  deleteOneCategory,
  getOneCategory,
  updateOneCategory,
} from '../../api/categories';

const initialState = {
  _id: '',
  name: '',
  color: '',
};

const statusList = {
  idle: 'idle',
  proccess: 'proccess',
  success: 'success',
  error: 'error',
};

function Category() {
  const dispatch = useDispatch();
  const target = useRef();
  const [state, setState] = useState(initialState);
  const [status, setStatus] = useState(statusList.idle);
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState(false);
  const MySwal = withReactContent(Swal);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const categories = useSelector((state) => state.categories);

  const categoriesData = useMemo(
    () => [
      ...categories.data.map((category, idx) => {
        return { ...category, no: idx + 1 };
      }),
    ],
    [categories],
  );

  const categoriesColumns = useMemo(
    () => [
      { Header: 'No', accessor: 'no' },
      { Header: 'Name', accessor: 'name' },
      {
        Header: 'Color',
        accessor: 'color',
        Cell: ({ value }) => <Badge type={value} content={value} />,
      },
    ],
    [],
  );

  const fetchOneCategory = async (id) => {
    setShow(true);

    let { data } = await getOneCategory(id);

    if (data.error) {
      console.log(data.error);
      return;
    }
    setState(data);
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
          let data = await deleteOneCategory(id);
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

  const onSubmit = async ({ id, name, color }) => {
    setStatus(statusList.proccess);

    const data = { name, color };
    let category = await updateOneCategory(id, data);

    if (category.error) {
      setError('name', {
        message: category.message,
      });

      setStatus(statusList.error);
    } else {
      onSubmitSuccess('Berhasil Mengubah Data');
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

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: 'Action',
        Header: 'Action',
        Cell: ({ row }) => (
          <>
            <Badge
              onClick={() => fetchOneCategory(row.original._id)}
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

  useEffect(() => {
    dispatch(fetchCategories());
    setSuccess(false);
  }, [dispatch, categories.currentPage, success]);

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Categories</h1>
      <div className="card">
        <div className="card__body">
          <Table
            columns={categoriesColumns}
            data={categoriesData}
            tableHooks={tableHooks}
            addData="/categories/add"
            withFeature
          />
        </div>
        <div className="card__footer">
          <Pagination
            totalItems={categories.totalItems}
            page={categories.currentPage}
            perPage={categories.perPage}
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
          <input
            type="hidden"
            name="id"
            id="id"
            value={state._id}
            ref={register()}
          />
          <div className="row">
            <div className="col-sm-12 col-md-6 col-4">
              <div className="input">
                {errors.name && (
                  <span className="error">*{errors.name.message}</span>
                )}
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="input-field"
                  value={state.name}
                  onChange={(e) => setState({ ...state, name: e.target.value })}
                  ref={register(rules.name)}
                />
                <label className="input-label">Category</label>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12 col-md-8 col-8">
              <h4>Select Color</h4>
              <div className="list-colors">
                {Colors.map((color, idx) => (
                  <div
                    className={`pill pill-${color.color} ${
                      color.color === state.color ? 'active' : ''
                    }`}
                    key={idx}
                    onClick={() => setState({ ...state, color: color.color })}
                  >
                    {color.color}
                  </div>
                ))}

                <input
                  value={state.color}
                  type="hidden"
                  name="color"
                  id="color"
                  ref={register(rules.color)}
                />
                {errors.color && (
                  <span className="error">*{errors.color.message}</span>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-theme"
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

export default Category;
