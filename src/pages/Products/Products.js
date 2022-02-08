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
  fetchProducts,
  setPage,
  goToNextPage,
  goToPrevPage,
} from '../../redux/Products/actions';

import Table from '../../components/table/Table';
import Badge from '../../components/badge/Badge';
import Pagination from '../../elements/Pagination/Pagination';
import Modal from '../../elements/Modal/Modal';
import StatusCard from '../../components/status-card/StatusCard';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { getCategories } from '../../api/categories';
import {
  deleteOneProduct,
  getOneProduct,
  updateOneProduct,
} from '../../api/products';

import ImageDefault from '../../assets/images/image_default.png';
import { rules } from '../../validation/productValidation';
import { config } from '../../config';
const statusList = {
  idle: 'idle',
  proccess: 'proccess',
  success: 'success',
  error: 'error',
};

const initialState = {
  _id: '',
  name: '',
  price: 0,
  stock: '',
  description: '',
  image: ImageDefault,
  category: '',
};

const Products = () => {
  const dispatch = useDispatch();
  const target = useRef();
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState(statusList.idle);
  const [show, setShow] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(ImageDefault);
  const [state, setState] = useState(initialState);
  const MySwal = withReactContent(Swal);
  let products = useSelector((state) => state.products);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  let productsData = useMemo(
    () => [
      ...products.data.map((product, idx) => {
        return { ...product, no: idx + 1 };
      }),
    ],
    [products],
  );

  const productsColumns = useMemo(
    () => [
      { Header: 'No', accessor: 'no' },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Price',
        accessor: 'price',
      },
      {
        Header: 'Description',
        accessor: 'description',
        className: 'table-image',
        Cell: ({ value }) => (
          <p>{value.split(' ').slice(0, 15).join(' ') + `... `}</p>
        ),
      },
      {
        Header: 'Stock',
        accessor: 'stock',
      },
      {
        Header: 'Category',
        accessor: 'category',
        Cell: ({ value }) => (
          <div className={`pill pill-${value.color} active`}>{value.name}</div>
        ),
      },
      {
        Header: 'Image',
        accessor: 'image_url',
        Cell: ({ value }) => (
          <img
            src={
              value !== undefined
                ? `${config.api_host}/upload/${value}`
                : ImageDefault
            }
            style={{ maxWidth: 70 }}
            alt={value}
          />
        ),
      },
    ],
    [],
  );

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
          let data = await deleteOneProduct(id);
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

  const fetchOneProduct = async (id) => {
    setShow(true);

    let { data } = await getOneProduct(id);

    if (data.error) {
      console.log(data.error);
      return;
    }
    setState({ ...data, category: data.category.name });
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
              type="success"
              content="edit"
              onClick={() => fetchOneProduct(row.original._id)}
            />{' '}
            <Badge
              type="danger"
              content="delete"
              onClick={() => onDelete(row.original._id)}
            />
          </>
        ),
      },
    ]);
  };

  const onSubmit = async (data) => {
    setStatus(statusList.proccess);
    const formData = new FormData();
    const { id, type, image, ...restData } = data;
    const keys = Object.keys(restData);
    const values = Object.values(restData);

    type === 'true'
      ? formData.append('type', true)
      : formData.append('type', false);

    formData.append('image', image[0]);
    keys.forEach((item, idx) => {
      formData.append(item, values[idx]);
    });

    const product = await updateOneProduct(id, formData);

    if (product.error) {
      setError('name', {
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
        setState({ ...state, image_url: null });
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const fetchCategory = useCallback(async () => {
    let { data } = await getCategories();
    if (data.error) {
      console.log(data.message);
      return;
    }

    setCategories(data.data);
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
    fetchCategory();
    setSuccess(false);
    return () => setSuccess(false);
  }, [dispatch, products.currentPage, success, fetchCategory]);

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Products</h1>
      {products.fullData && (
        <div className="row">
          <div className="col-3 col-md-6 col-sm-12">
            <StatusCard
              icon="bx bx-cart"
              count={products.totalItems}
              title="Total Products"
            />
          </div>
          <div className="col-3 col-md-6 col-sm-12">
            <StatusCard
              icon="bx bx-cart"
              count={
                products.fullData.filter((data) => data.stock === 'in stock')
                  .length
              }
              title="In Stock"
              color="blue"
            />
          </div>
          <div className="col-3 col-md-6 col-sm-12">
            <StatusCard
              icon="bx bx-cart"
              count={
                products.fullData.filter(
                  (data) => data.stock === 'out of stock',
                ).length
              }
              title="Out of Stock"
              color="orange"
            />
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__body">
          <Table
            columns={productsColumns}
            data={productsData}
            tableHooks={tableHooks}
            addData="/products/add"
            withFeature
          />
        </div>
        <div className="card__footer">
          <Pagination
            totalItems={products.totalItems}
            page={products.currentPage}
            perPage={products.perPage}
            onChange={(page) => dispatch(setPage(page))}
            onNext={(_) => dispatch(goToNextPage())}
            onPrev={(_) => dispatch(goToPrevPage())}
          />
        </div>
      </div>
      <Modal
        show={show}
        onClose={() => setShow(false)}
        title="Edit Data Product"
        onSave={() => target.current.click()}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" name="id" value={state._id} ref={register()} />
          <div className="row">
            <div className="col-7">
              <div className="input">
                {errors.name && (
                  <span className="error">*{errors.name.message}</span>
                )}
                <input
                  type="text"
                  className="input-field"
                  ref={register(rules.name)}
                  name="name"
                  value={state.name}
                  onChange={(e) => setState({ ...state, name: e.target.value })}
                />
                <label className="input-label">Product Name</label>
              </div>
              <div className="input input-price">
                {errors.price && (
                  <span className="error">*{errors.price.message}</span>
                )}
                <input
                  type="text"
                  className="input-field"
                  ref={register(rules.price)}
                  name="price"
                  value={state.price}
                  onChange={(e) =>
                    setState({ ...state, price: e.target.value })
                  }
                />
                <label className="input-label">Price</label>
              </div>
              <div className="input">
                {errors.stock && (
                  <span className="error">*{errors.stock.message}</span>
                )}
                <div className="list-colors">
                  <div
                    className={`pill pill-stock  ${
                      state.stock === 'in stock' ? 'active' : ''
                    }`}
                    key="in stock"
                    onClick={() => setState({ ...state, stock: 'in stock' })}
                  >
                    in stock
                  </div>
                  <div
                    className={`pill pill-stock  ${
                      state.stock === 'out of stock' ? 'active' : ''
                    }`}
                    key="out of stock"
                    onClick={() =>
                      setState({ ...state, stock: 'out of stock' })
                    }
                  >
                    out of stock
                  </div>
                </div>

                <label htmlFor="stock">Stock Product</label>
                <input
                  value={state.stock}
                  type="hidden"
                  name="stock"
                  ref={register(rules.stock)}
                />
              </div>
              <div className="input">
                {errors.description && (
                  <span className="error">*{errors.description.message}</span>
                )}
                <textarea
                  type="text"
                  ref={register(rules.description)}
                  className="input-field"
                  name="description"
                  value={state.description}
                  onChange={(e) =>
                    setState({ ...state, description: e.target.value })
                  }
                />
                <label className="input-label">Description</label>
              </div>
            </div>
            <div className="col-5">
              <div className="input">
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
                      ? `${config.api_host}/upload/${state.image_url}`
                      : imagePreview
                  }
                  alt=""
                  style={{ maxWidth: 150 }}
                />
              </div>
              <div className="input input-price">
                <input
                  type="text"
                  className="input-field"
                  ref={register()}
                  name="rating"
                  value={state.rating}
                  onChange={(e) =>
                    setState({ ...state, rating: e.target.value })
                  }
                />
                <label className="input-label">Rating</label>
              </div>
              <div className="input">
                {errors.category && (
                  <span className="error">*{errors.category.message}</span>
                )}
                <div className="list-colors">
                  {categories &&
                    categories.map((item, idx) => (
                      <div
                        className={`pill pill-${item.color} active ${
                          item.name === state.category ? 'focus' : ''
                        }`}
                        key={idx}
                        onClick={() =>
                          setState({ ...state, category: item.name })
                        }
                      >
                        {item.name}
                      </div>
                    ))}
                </div>
                {(state.category === 'coffe' || state.category === 'tea') && (
                  <>
                    <label className="input-label">Variant Hot or Ice</label>
                    <div style={{ display: 'flex', width: '30%' }}>
                      <label
                        htmlFor="type"
                        style={{
                          flex: '1 0 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <input
                          type="radio"
                          name="type"
                          id="type"
                          value="true"
                          ref={register()}
                          checked={state.type === true ? true : false}
                          onClick={() => {
                            setState({ ...state, type: true });
                          }}
                        />
                        Ya
                      </label>
                      <label
                        htmlFor="type"
                        style={{
                          flex: '1 0 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <input
                          type="radio"
                          name="type"
                          id="type"
                          value="false"
                          ref={register()}
                          checked={state.type === false ? true : false}
                          onClick={() => {
                            setState({ ...state, type: false });
                          }}
                        />
                        Tidak
                      </label>
                    </div>
                  </>
                )}
                <label htmlFor="category">Category</label>
                <input
                  value={state.category}
                  type="hidden"
                  name="category"
                  ref={register(rules.category)}
                  onChange={(e) =>
                    setState({ ...state, category: e.target.value })
                  }
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
};

export default Products;
