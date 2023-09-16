import _ from 'lodash';
import fetchData from './fetch.js';
import parseData from './parser.js';

const updatePosts = (state) => {
  const { feeds, posts } = state;
  const activeFeeds = feeds.map((feed) => fetchData(feed.url)
    .then(({ data }) => {
      const newData = parseData(data.contents);
      const currentPosts = posts.map((post) => post.url);
      const newPosts = newData.posts
        .filter((post) => !currentPosts.includes(post.url))
        .map((post) => ({ ...post, feedId: feed.id, id: _.uniqueId('post') }));
      posts.push(...newPosts);
    }));

  Promise.all(activeFeeds).finally(() => setTimeout(updatePosts, 5000, state));
};

export default updatePosts;
