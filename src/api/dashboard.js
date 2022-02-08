import axios from 'axios';
import { config } from '../config';

export async function getDataDashboard() {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : {};
  return await axios.get(`${config.api_host}/api/dashboard`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
