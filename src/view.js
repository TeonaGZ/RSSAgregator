import onChange from 'on-change';

const renderContainer = (elements, type, i18n) => {
  const { feeds, posts } = elements;
  const container = type === 'feeds' ? feeds : posts;
  container.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  card.append(cardBody);

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t(`${type}Title`);
  cardBody.append(cardTitle);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(listGroup);

  return { container, card, listGroup };
};

const renderFeeds = (elements, state, i18n) => {
  const view = renderContainer(elements, 'feeds', i18n);
  const { container, card, listGroup } = view;

  state.feeds.forEach((feed) => {
    const feedLi = document.createElement('li');
    feedLi.classList.add('list-group-item', 'border-0', 'border-end-0');
    listGroup.prepend(feedLi);

    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;
    feedLi.append(feedTitle);

    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;
    feedLi.append(feedDescription);
  });
  container.append(card);
};

const renderPosts = (elements, state, i18n) => {
  const view = renderContainer(elements, 'posts', i18n);
  const { container, card, listGroup } = view;

  state.posts.forEach((post) => {
    const postLi = document.createElement('li');
    postLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    listGroup.prepend(postLi);

    const fwClass = state.ui.visitedPosts.has(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    const postTitle = document.createElement('a');
    postTitle.setAttribute('href', post.url);
    postTitle.classList.add(...fwClass);
    postTitle.setAttribute('data-id', post.id);
    postTitle.setAttribute('target', '_blank');
    postTitle.setAttribute('rel', 'noopener noreferrer');
    postTitle.textContent = post.title;

    const postBtn = document.createElement('button');
    postBtn.setAttribute('type', 'button');
    postBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postBtn.setAttribute('data-id', post.id);
    postBtn.setAttribute('data-bs-toggle', 'modal');
    postBtn.setAttribute('data-bs-target', '#modal');
    postBtn.textContent = i18n.t('postsButton');

    postLi.append(postTitle, postBtn);
  });
  container.append(card);
};

const renderModal = (elements, state) => {
  const postsId = [...state.ui.visitedPosts];
  const currentId = postsId[postsId.length - 1];
  const currentUrl = document.querySelector(`a[data-id=${currentId}]`);

  currentUrl.classList.remove('fw-bold');
  currentUrl.classList.add('fw-normal', 'link-secondary');

  const currentPost = state.posts.find((post) => post.id === currentId);

  const { title, description, url } = currentPost;
  const { modal } = elements;

  modal.title.textContent = title;
  modal.body.textContent = description;
  modal.btn.setAttribute('href', url);
};

const renderError = (elements, value, i18n) => {
  elements.feedback.textContent = '';
  if (value !== null) {
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18n.t(`form.errors.${value}`);
    elements.formInput.classList.add('is-invalid');
  } else {
    elements.feedback.textContent = i18n.t('form.success');
    elements.formInput.classList.remove('is-invalid');
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
      elements.feedback.textContent = '';

      break;
    case 'success':
      elements.form.readOnly = false;
      elements.form.disabled = false;
      elements.form.reset();
      elements.form.focus();
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18n.t('form.success');
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
    case 'ui.visitedPosts':
      renderModal(elements, state);
      break;
    case 'formState.errors':
      renderError(elements, value, i18n);
      break;
    case 'formState.status':
      renderStatus(elements, value, i18n);
      break;
    default:
      break;
  }
});
