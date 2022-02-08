import axios from 'axios';
import { config } from '../config';

export async function addCategory(data) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.post(`${config.api_host}/api/categories`, data, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function getCategories(params) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.get(`${config.api_host}/api/categories`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    params,
  });
}

export async function getOneCategory(param) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.get(`${config.api_host}/api/categories/${param}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function updateOneCategory(id, data) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.put(`${config.api_host}/api/categories/${id}`, data, {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function deleteOneCategory(id) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.delete(`${config.api_host}/api/categories/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
