import dotenv from 'dotenv';

dotenv.config();

const config = {
  api_host: process.env.REACT_APP_API_HOST,
};

export { config };
