import * as yup from 'yup';
import { customMessages } from '../locales/customMessage.js';

export default (url, urlList) => {
  yup.setLocale(customMessages);

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
