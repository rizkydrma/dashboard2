import axios from 'axios';
import { config } from '../config';

export async function getAnalyticsTrend() {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.get(`${config.api_host}/api/analyticsTrend`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function getAnalyticsProduct(startDate, endDate) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.get(`${config.api_host}/api/analyticsProduct`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    params: {
      startDate,
      endDate,
    },
  });
}

export async function getAnalyticsOneProduct(name) {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};

  return await axios.get(`${config.api_host}/api/analyticsOneProduct`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    params: {
      name,
    },
  });
}
