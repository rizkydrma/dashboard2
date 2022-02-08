import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import ImageDefault from '../../assets/images/image_default.png';

import { addProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import { rules } from '../../validation/productValidation';

const statusList = {
  idle: 'idle',
  proccess: 'proccess',
  success: 'success',
  error: 'error',
};

function AddProducts() {
  const history = useHistory();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState(statusList.idle);
  const [imagePreview, setImagePreview] = useState(ImageDefault);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const MySwal = withReactContent(Swal);

  const imageHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const onSubmit = async (data) => {
    setStatus(statusList.proccess);
    const formData = new FormData();
    const { image, type, ...restData } = data;
    const keys = Object.keys(restData);
    const values = Object.values(restData);

    type === 'true'
      ? formData.append('type', true)
      : formData.append('type', false);

    formData.append('image', image[0]);
    keys.forEach((item, idx) => {
      formData.append(item, values[idx]);
    });

    const product = await addProduct(formData);

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
        history.push('/products');
      }
    });
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
    fetchCategory();
    setStatus(statusList.idle);
    return function cleanup() {
      setStatus(statusList.idle);
    };
  }, [fetchCategory]);

  return (
    <div>
      <h2>Add Products</h2>
      <div className="card">
        <div className="card__body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
              <div className="col-5">
                <div className="input">
                  {errors.name && (
                    <span className="error">*{errors.name.message}</span>
                  )}
                  <input
                    type="text"
                    className="input-field"
                    ref={register(rules.name)}
                    name="name"
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
                        stock === 'in stock' ? 'active' : ''
                      }`}
                      key="in stock"
                      onClick={() => setStock('in stock')}
                    >
                      in stock
                    </div>
                    <div
                      className={`pill pill-stock  ${
                        stock === 'out of stock' ? 'active' : ''
                      }`}
                      key="out of stock"
                      onClick={() => setStock('out of stock')}
                    >
                      out of stock
                    </div>
                  </div>

                  <label htmlFor="stock">Stock Product</label>
                  <input
                    value={stock}
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
                  />
                  <label className="input-label">Description</label>
                </div>
              </div>
              <div className="col-7">
                <div className="input">
                  {errors.image && (
                    <span className="error">*{errors.image.message}</span>
                  )}
                  <input
                    type="file"
                    name="image"
                    onChange={(e) => imageHandler(e)}
                    ref={register(rules.image)}
                  />
                  <label className="input-label">Image Product</label>
                </div>
                <div className="image-preview">
                  <img src={imagePreview} alt="" style={{ maxWidth: 150 }} />
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
                            item.name === category ? 'focus' : ''
                          }`}
                          key={idx}
                          onClick={() => setCategory(item.name)}
                        >
                          {item.name}
                        </div>
                      ))}
                  </div>

                  <label htmlFor="category">Category</label>
                  <input
                    value={category}
                    type="hidden"
                    name="category"
                    ref={register(rules.category)}
                  />
                </div>
                {(category === 'coffe' || category === 'tea') && (
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
                        />
                        Tidak
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-theme btn-lg"
              disabled={status === 'proccess'}
            >
              Add Data
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProducts;
