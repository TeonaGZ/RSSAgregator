import axios from 'axios';
import _ from 'lodash';
import parseData from './parser.js';

const axiosTimeout = 10000;

export const getProxy = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app');
  proxyUrl.pathname = 'get';
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', `${url}`);
  return proxyUrl.toString();
};

export const fetchData = (proxyUrl) => {
  const instance = axios.create();
  return instance.get(proxyUrl, {
    timeout: axiosTimeout,
  });
};

export const rssDownload = (url, state) => {
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
    .catch((error) => {
      state.formState.status = 'filling';
      state.formState.valid = false;
      state.formState.errors = error.message;
    });
};

export const rssUpdate = (state) => {
  const { feeds, posts } = state;
  const activeFeeds = feeds.map((feed) => fetchData(getProxy(feed.url))
    .then(({ data }) => {
      const newData = parseData(data.contents);
      const currentPosts = posts.map((post) => post.url);
      const newPosts = newData.posts
        .filter((post) => !currentPosts.includes(post.url))
        .map((post) => ({ ...post, feedId: feed.id, id: _.uniqueId('post') }));
      posts.push(...newPosts);
    }));
  Promise.all(activeFeeds).finally(() => setTimeout(rssUpdate, 5000, state));
};
