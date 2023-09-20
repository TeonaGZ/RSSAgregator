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

    validateUrl(url, urlList)
      .then((error) => {
        // if (error) срабатывает некорректно, когда валидация проходит без ошибок
        if (error !== null) {
          watchedState.formState.errors = error.message;
          console.log('state', watchedState);
          return;
        }
        watchedState.formState.errors = null;
        console.log('fetchData', fetchData(url));
        fetchData(url);
      })
      .then(({ data }) => {
        console.log('data', { data });

        const { feed, posts } = parseData(data.contents);

        const newFeed = { ...feed, id: _.uniqueId(), url };
        const newPosts = posts.map((post) => ({ ...post, feedId: newFeed.id, id: _.uniqueId('post') }));

        watchedState.feeds.push(newFeed);
        watchedState.posts.push(...newPosts);
        watchedState.formState.status = 'success';
      })
      .catch(() => {
        watchedState.formState.status = 'filling';
        watchedState.formState.valid = false;
      });
  });

  elements.posts.addEventListener('click', ({ target }) => {
    if (target.tagName === 'A' || target.tagName === 'BUTTON') {
      const { id } = target.dataset;
      watchedState.uiState.visitedPosts.push(id);
    }
  });

  updatePosts(watchedState);
};
