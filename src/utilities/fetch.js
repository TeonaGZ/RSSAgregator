import axios from 'axios';

export default (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app');
  proxyUrl.pathname = 'get';
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', `${url}`);

  return axios.get(proxyUrl);
};
