import axios from 'axios';
import _ from 'lodash';

export const getProxy = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app');
  proxyUrl.pathname = 'get';
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', `${url}`);
  return proxyUrl;
};

export const parseData = (data) => {
  const parser = new DOMParser();
  const parsedXmlString = parser.parseFromString(data, 'application/xml');
  const errorNode = parsedXmlString.querySelector('parsererror');
  if (errorNode) {
    throw new Error('notValidRss');
  }

  const feed = {
    title: parsedXmlString.querySelector('channel > title').textContent,
    description: parsedXmlString.querySelector('channel > description').textContent,
  };
  const posts = Array.from(parsedXmlString.querySelectorAll('channel > item'))
    .map((item) => (
      {
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        url: item.querySelector('link').textContent,
      }
    ));
  return { feed, posts };
};

export const fetchData = (proxyUrl) => axios.get(proxyUrl);

const rssDownload = (url, state) => {
  const proxyUrl = getProxy(url);
  fetchData(proxyUrl)
    .then(({ data }) => {
      const { feed, posts } = parseData(data.contents);

      const newFeed = { ...feed, id: _.uniqueId(), url };
      const newPosts = posts.map((post) => ({ ...post, feedId: newFeed.id, id: _.uniqueId('post') }));

      state.feeds.push(newFeed);
      state.posts.push(...newPosts);
      state.formState.status = 'success';
    })
    .catch((err) => {
      state.formState.status = 'filling';
      state.formState.valid = false;
      state.formState.errors = err;
    });
};

export default rssDownload;
