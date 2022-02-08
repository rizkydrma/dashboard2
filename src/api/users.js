import axios from 'axios';
import { config } from '../config';

export async function addUsers(data) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.post(`${config.api_host}/api/users`, data, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function getUsers(params) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.get(`${config.api_host}/api/users`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    params,
  });
}

export async function getOneUser(param) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.get(`${config.api_host}/api/users/${param}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function updateOneUser(id, data) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.put(`${config.api_host}/api/users/${id}`, data, {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function deleteOneUser(id) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.delete(`${config.api_host}/api/users/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
