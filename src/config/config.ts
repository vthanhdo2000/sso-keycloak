// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

export const config = {
  port: process.env.PORT,
  api_key: process.env.API_KEY,
  link_api: process.env.API_LINK,
};
