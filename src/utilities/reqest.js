import axios from 'axios';
import _ from 'lodash';
import parseData from './parser.js';

const axiosTimeout = 10000;
const updatePostsTimeout = 5000;

export const getProxy = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app');
  proxyUrl.pathname = 'get';
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', `${url}`);
  return proxyUrl.toString();
};

export const fetchData = (proxyUrl, state) => {
  state.formState.status = 'processing';
  const instance = axios.create();
  return instance.get(proxyUrl, {
    timeout: axiosTimeout,
  });
};

export const rssDownload = (url, state) => {
  const proxyUrl = getProxy(url);
  fetchData(proxyUrl, state)
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
      if (axios.isAxiosError(error)) {
        state.formState.errors = 'Network Error';
      } else if (error.isParseError) {
        state.formState.errors = 'notValidRss';
      } else {
        state.formState.errors = 'unknownError';
      }
    });
};

export const rssUpdate = (state) => {
  const { feeds } = state;
  const activeFeeds = feeds.map((feed) => fetchData(getProxy(feed.url), state)
    .then(({ data }) => {
      const { posts } = parseData(data.contents);
      const currentUrls = posts.map((post) => post.url);
      const newPosts = posts
        .filter((post) => !currentUrls.includes(post.url))
        .map((post) => ({ ...post, feedId: feed.id, id: _.uniqueId('post') }));
      posts.push(...newPosts);
    }));
  Promise.all(activeFeeds).finally(() => setTimeout(rssUpdate, updatePostsTimeout, state));
};
