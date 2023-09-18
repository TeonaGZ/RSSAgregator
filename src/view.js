import onChange from 'on-change';

const renderContainer = (elements, type, i18n) => {
  const { feeds, posts } = elements;
  const container = type === 'feeds' ? feeds : posts;
  container.innerHTML = '';

  const divEl = document.createElement('div');
  divEl.classList.add('card', 'border-0');
  container.append(divEl);

  const titleDivEl = document.createElement('div');
  titleDivEl.classList.add('card-body');
  divEl.append(titleDivEl);

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t(`${type}Title`);
  titleDivEl.append(h2);

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  divEl.append(ulEl);

  return container;
};

const renderFeeds = (elements, state, i18n) => {
  const feedsContainer = renderContainer(elements, 'feeds', i18n);
  const ulEl = feedsContainer.querySelector('.list-group');

  state.feeds.forEach((feed) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    ulEl.prepend(liEl);

    const h3El = document.createElement('h3');
    h3El.classList.add('h6', 'm-0');
    h3El.textContent = feed.title;
    liEl.append(h3El);

    const pEl = document.createElement('p');
    pEl.classList.add('m-0', 'small', 'text-black-50');
    pEl.textContent = feed.description;
    liEl.append(pEl);
  });
};

const renderPosts = (elements, state, i18n) => {
  const postsContainer = renderContainer(elements, 'posts', i18n);
  const ulEl = postsContainer.querySelector('.list-group');

  state.posts.forEach((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    ulEl.prepend(liEl);

    const fwClass = state.uiState.visitedPosts.includes(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    const aEl = document.createElement('a');
    aEl.setAttribute('href', post.url);
    aEl.classList.add(...fwClass);
    aEl.setAttribute('data-id', post.id);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = post.title;

    const btnEl = document.createElement('button');
    btnEl.setAttribute('type', 'button');
    btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btnEl.setAttribute('data-id', post.id);
    btnEl.setAttribute('data-bs-toggle', 'modal');
    btnEl.setAttribute('data-bs-target', '#modal');
    btnEl.textContent = i18n.t('postsButton');

    liEl.append(aEl, btnEl);
  });
};

const renderVisitedPosts = (elements, state) => {
  const postsId = [...state.uiState.visitedPosts];
  const currentId = postsId[postsId.length - 1];
  const currentUrl = document.querySelector(`a[data-id=${currentId}]`);

  currentUrl.classList.remove('fw-bold');
  currentUrl.classList.add('fw-normal');

  const currentPost = state.posts.find((post) => post.id === currentId);

  const { title, description, url } = currentPost;
  const { modal } = elements;

  modal.title.textContent = title;
  modal.body.textContent = description;
  modal.btn.setAttribute('href', url);
};

const renderError = (elements, value, i18n) => {
  elements.feedbackContainer.textContent = '';
  if (value !== null) {
    elements.feedbackContainer.classList.remove('text-success');
    elements.feedbackContainer.classList.add('text-danger');
    elements.feedbackContainer.textContent = i18n.t(`form.errors.${value}`);
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
    case 'posts':
      renderPosts(elements, state, i18n);
      break;
    case 'uiState.visitedPosts':
      renderVisitedPosts(elements, state);
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
