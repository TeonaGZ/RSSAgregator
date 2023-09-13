import onChange from 'on-change';

const renderFeeds = (elements, state, i18n) => {
  elements.feedsContainer.innerHTML = '';

  const divEl = document.createElement('div');
  divEl.classList.add('card', 'border-0');
  elements.feedsContainer.append(divEl);

  const titleDivEl = document.createElement('div');
  titleDivEl.classList.add('card-body');
  divEl.append(titleDivEl);

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t('feeds');
  titleDivEl.append(h2);

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');

  state.feeds.forEach((feed) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3El = document.createElement('h3');
    h3El.classList.add('h6', 'm-0');
    // добавить feed.title
    h3El.textContent = `${feed}`;

    liEl.append(h3El);

    const pEl = document.createElement('p');
    pEl.classList.add('m-0', 'small', 'text-black-50');
    // добавить feed.description
    pEl.textContent = feed;

    liEl.append(pEl);
    ulEl.prepend(liEl);
  });

  divEl.append(ulEl);
};

const renderError = (elements, error, i18n) => {
  elements.feedbackContainer.textContent = '';
  if (error !== null) {
    elements.feedbackContainer.classList.remove('text-success');
    elements.feedbackContainer.classList.add('text-danger');
    elements.feedbackContainer.textContent = i18n.t(error);
  } else {
    elements.feedbackContainer.textContent = i18n.t('form.success');
  }
};

const renderStatus = (elements, status, i18n) => {
  switch (status) {
    case 'filling':
      elements.form.focus();
      break;
    case 'processing':
      elements.form.readOnly = true;
      elements.form.disabled = true;
      break;
    case 'success':
      elements.form.readOnly = false;
      elements.form.disabled = false;
      elements.form.reset();
      elements.form.focus();
      elements.feedbackContainer.classList.remove('text-danger');
      elements.feedbackContainer.classList.add('text-success');
      elements.feedbackContainer.textContent = i18n.t('form.success');
      break;
    default:
      throw new Error(`Unknown process state: ${status}`);
  }
};

export default (elements, state, i18n) => onChange(state, (path, value) => {
  switch (path) {
    case 'feeds':
      renderFeeds(elements, state, i18n);
      break;
    case 'formState.errors':
      renderError(elements, value, i18n);
      break;
    case 'formState.valid':
      if (!value) {
        elements.formInput.classList.add('is-invalid');
        return;
      }
      elements.formInput.classList.remove('is-invalid');
      break;
    case 'formState.status':
      renderStatus(elements, value, i18n);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }
});
