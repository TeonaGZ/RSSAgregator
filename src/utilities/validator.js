import * as yup from 'yup';

export default (url, urlList) => {
  const formSchema = yup
    .string()
    .url()
    .required()
    .notOneOf(urlList)
    .trim();

  return formSchema
    .validate(url)
    .then(() => null)
    .catch((error) => error.message);
};
