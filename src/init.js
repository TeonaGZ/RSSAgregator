import i18next from 'i18next';
import ru from './locales/ru.js';
import validateUrl from './utilities/validator.js';
import axios from 'axios';
import watch from './view.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    formInput: document.getElementById('url-input'),
    formButton: document.querySelector('.rss-form button'),
    feedbackContainer: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
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

    validateUrl(url, watchedState, i18n)
      .then(() => {
        watchedState.formState.status = 'processing';
        watchedState.formState.errors = null;
        console.log('!!', watchedState.formState);

        console.log('url', url);
        watchedState.feeds.push(url);
        watchedState.formState.status = 'success';
      })
      .catch((err) => {
        watchedState.formState.status = 'filling';
        console.log('errrrr', err.message);
        watchedState.formState.errors = err.message;
        watchedState.formState.valid = false;
      });
  });
};
