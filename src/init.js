import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/ru.js';
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

  yup.setLocale({
    mixed: {
      required: i18n.t('form.errors.required'),
      notOneOf: i18n.t('form.errors.notUniqueUrl'),
    },
    string: {
      url: i18n.t('form.errors.invalidUrl'),
    },
  });

  const formSchema = (state) => yup.string()
    .url()
    .required()
    .notOneOf(state.feeds)
    .trim();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.formState.status = 'filling';
    const formData = new FormData(e.target);
    const url = formData.get('url');

    formSchema(watchedState).validate(url)
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
