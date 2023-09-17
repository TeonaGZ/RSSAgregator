export default (data) => {
  const parser = new DOMParser();
  const parsedXmlString = parser.parseFromString(data, 'application/xml');
  const errorNode = parsedXmlString.querySelector('parsererror');
  if (errorNode) {
    throw new Error('notValidRss');
  }

  const feed = {
    title: parsedXmlString.querySelector('channel > title').textContent,
    description: parsedXmlString.querySelector('channel > description').textContent,
  };
  const posts = Array.from(parsedXmlString.querySelectorAll('channel > item'))
    .map((item) => (
      {
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        url: item.querySelector('link').textContent,
      }
    ));
  return { feed, posts };
};
