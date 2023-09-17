import i18next from 'i18next';
import _ from 'lodash';
import ru from './locales/ru.js';
import validateUrl from './utilities/validator.js';
import watch from './view.js';
import fetchData from './utilities/fetch.js';
import parseData from './utilities/parser.js';
import updatePosts from './utilities/updater.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    formInput: document.getElementById('url-input'),
    formButton: document.querySelector('.rss-form button'),
    feedbackContainer: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      btn: document.querySelector('.modal-footer > .btn-primary'),
    },
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
    uiState: {
      visitedPosts: [],
    },
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
        const { feed, posts } = parseData(data.contents);

        const newFeed = { ...feed, id: _.uniqueId(), url };
        const newPosts = posts.map((post) => ({ ...post, feedId: newFeed.id, id: _.uniqueId('post') }));

        watchedState.feeds.push(newFeed);
        watchedState.posts.push(...newPosts);
        watchedState.formState.status = 'success';
      })
      .catch((err) => {
        watchedState.formState.status = 'filling';
        watchedState.formState.errors = err.message;
        watchedState.formState.valid = false;
      });
  });

  elements.posts.addEventListener('click', ({ target }) => {
    if (target.tagName === 'A' || target.tagName === 'BUTTON') {
      const { id } = target.dataset;
      watchedState.uiState.visitedPosts.push(id);
      console.log('visited', watchedState.uiState.visitedPosts);
    }
  });

  updatePosts(watchedState);
};
