import onChange from 'on-change';

const renderFeeds = (elements, state) => {
  elements.feedsContainer.innerHTML = '';

  const divEl = document.createElement('div');
  divEl.classList.add('card', 'border-0');
  elements.feedsContainer.append(divEl);

  const titleDivEl = document.createElement('div');
  titleDivEl.classList.add('card-body');
  titleDivEl.innerHTML = '<h2 class="card-title h4">Фиды</h2>';
  divEl.append(titleDivEl);

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

const renderError = (elements, error) => {
  elements.feedbackContainer.textContent = '';
  if (error !== []) {
    elements.feedbackContainer.classList.remove('text-success');
    elements.feedbackContainer.classList.add('text-danger');
    elements.feedbackContainer.textContent = `${error}`;
  } else {
    elements.feedbackContainer.textContent = 'RSS успешно загружен';
  }
};

const renderStatus = (elements, status) => {
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
      elements.feedbackContainer.textContent = 'RSS успешно загружен';
      break;
    default:
      throw new Error(`Unknown process state: ${status}`);
  }
};

export default (elements, state) => onChange(state, (path, value) => {
  switch (path) {
    case 'feeds':
      renderFeeds(elements, state);
      break;
    case 'formState.errors':
      renderError(elements, value);
      break;
    case 'formState.valid':
      if (!value) {
        elements.formInput.classList.add('is-invalid');
        return;
      }
      elements.formInput.classList.remove('is-invalid');
      break;
    case 'formState.status':
      renderStatus(elements, value);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }
});
