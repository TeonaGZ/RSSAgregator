import * as yup from 'yup';
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

  // const defaultLang = 'ru';

  const initialState = {
    formState: {
      status: 'filling',
      valid: true,
      errors: [],
    },
    feeds: [],
    posts: [],
  };

  const watchedState = watch(elements, initialState);

  const formSchema = (state) => yup.string()
    .url('url should be a valid url')
    .required('the field should be filled')
    .notOneOf(state.feeds, 'url already exist')
    .trim();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.formState.status = 'filling';
    const formData = new FormData(e.target);
    const url = formData.get('url');

    formSchema(watchedState).validate(url)
      .then(() => {
        watchedState.formState.status = 'processing';
        watchedState.formState.errors = [];
        watchedState.feeds.push(url);
        watchedState.formState.status = 'success';
      })
      .catch((err) => {
        watchedState.formState.status = 'filling';
        watchedState.formState.errors.push(err.message);
      });
  });
};
