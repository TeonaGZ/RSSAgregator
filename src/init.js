import i18next from 'i18next';
import * as yup from 'yup';
import customMessages from './locales/customMessage.js';
import ru from './locales/ru.js';
import validateUrl from './utilities/validator.js';
import watch from './view.js';
import { rssDownload, rssUpdate } from './utilities/reqest.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    formInput: document.getElementById('url-input'),
    formButton: document.querySelector('.rss-form button'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      btn: document.querySelector('.modal-footer > .btn-primary'),
    },
  };

  const initialState = {
    formState: {
      status: 'filling',
      valid: true,
      errors: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      visitedPosts: new Set(),
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
  })
    .then(() => {
      yup.setLocale(customMessages);

      const watchedState = watch(elements, initialState, i18n);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.formState.status = 'filling';
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const urlList = watchedState.feeds.map((feed) => feed.url);

        validateUrl(url, urlList)
          .then((error) => {
            if (error !== null) {
              watchedState.formState.errors = error;
              watchedState.formState.valid = false;
              return;
            }
            watchedState.formState.valid = true;
            watchedState.formState.errors = null;
            rssDownload(url, watchedState);
          });
      });

      elements.posts.addEventListener('click', ({ target }) => {
        if (target.hasAttribute('data-id')) {
          const { id } = target.dataset;
          watchedState.uiState.visitedPosts.add(id);
        }
      });
      rssUpdate(watchedState);
    });
};
