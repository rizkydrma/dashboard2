import axios from 'axios';
import { config } from '../config';

export async function getOrders(params) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.get(`${config.api_host}/api/allOrders`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    params,
  });
}

export async function getOrdersByID(params) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.get(`${config.api_host}/api/getOrdersByID/${params}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function getOneOrder(param) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.get(`${config.api_host}/api/orders/${param}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function updateOneOrder(id, data) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.put(`${config.api_host}/api/orders/${id}`, data, {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function updateStatusPaymentsByID(id) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.get(`${config.api_host}/api/ordersPayment/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteOneOrder(id) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.delete(`${config.api_host}/api/orders/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
