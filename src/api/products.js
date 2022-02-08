import axios from 'axios';
import { config } from '../config';

export async function addProduct(data) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.post(`${config.api_host}/api/products`, data, {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function getProducts(params) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.get(`${config.api_host}/api/products`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    params,
  });
}

export async function getOneProduct(param) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.get(`${config.api_host}/api/products/${param}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function updateOneProduct(id, data) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.put(`${config.api_host}/api/products/${id}`, data, {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function deleteOneProduct(id) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.delete(`${config.api_host}/api/products/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
