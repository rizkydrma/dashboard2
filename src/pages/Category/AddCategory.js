import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { addCategory } from '../../api/categories';

import Colors from '../../assets/JsonData/colors.json';
import { rules } from '../../validation/CategoryValidation';

const initialState = {
  name: '',
  color: '',
};

const statusList = {
  idle: 'idle',
  proccess: 'proccess',
  success: 'success',
  error: 'error',
};

function AddCategory() {
  const history = useHistory();
  const [state, setState] = useState(initialState);
  const [status, setStatus] = useState(statusList.idle);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const MySwal = withReactContent(Swal);

  const onSubmit = async ({ name, color }) => {
    setStatus(statusList.proccess);

    const data = { name, color };
    let category = await addCategory(data);

    if (category.error) {
      setError('name', {
        message: category.message,
      });

      setStatus(statusList.error);
    } else {
      onSubmitSuccess('Berhasil Menambah Data');
      setStatus(statusList.success);
      setState(initialState);
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
        history.push('/categories');
      }
    });
  };

  useEffect(() => {
    setStatus(statusList.idle);
    return () => setStatus(statusList.idle);
  }, []);

  return (
    <div>
      <h2>Add Data Category</h2>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
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
                    onChange={(e) =>
                      setState({ ...state, name: e.target.value })
                    }
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
            >
              Add Data
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCategory;
