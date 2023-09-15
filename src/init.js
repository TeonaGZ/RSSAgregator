import i18next from 'i18next';
import _ from 'lodash';
import ru from './locales/ru.js';
import validateUrl from './utilities/validator.js';
import watch from './view.js';
import fetchData from './utilities/fetch.js';
import parsedData from './utilities/parser.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    formInput: document.getElementById('url-input'),
    formButton: document.querySelector('.rss-form button'),
    feedbackContainer: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources: {
      ru,
    },
  });

  const initialState = {
    formState: {
      status: 'filling',
      valid: true,
      errors: null,
    },
    feeds: [],
    posts: [],
  };

  const watchedState = watch(elements, initialState, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.formState.status = 'filling';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urlList = watchedState.feeds.map((feed) => feed.url);

    validateUrl(url, urlList, i18n)
      .then(() => {
        watchedState.formState.status = 'processing';
        watchedState.formState.errors = null;

        return fetchData(url);
      })
      .then(({ data }) => {
        const { feed, posts } = parsedData(data.contents);

        const newFeed = { ...feed, id: _.uniqueId(), url };
        const newPosts = posts.map((post) => ({ ...post, feedId: newFeed.id, id: _.uniqueId('post') }));

        watchedState.feeds.unshift(newFeed);
        watchedState.posts.unshift(...newPosts);
        watchedState.formState.status = 'success';
      })
      .catch((err) => {
        watchedState.formState.status = 'filling';
        watchedState.formState.errors = err.message;
        watchedState.formState.valid = false;
      });
  });
};
