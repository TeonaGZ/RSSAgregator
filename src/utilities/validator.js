import * as yup from 'yup';

export default (url, initialState, i18n) => {
  yup.setLocale({
    mixed: {
      required: i18n.t('form.errors.required'),
      notOneOf: i18n.t('form.errors.notUniqueUrl'),
    },
    string: {
      url: i18n.t('form.errors.invalidUrl'),
    },
  });

  const formSchema = yup
    .string()
    .url()
    .required()
    .notOneOf(initialState.feeds)
    .trim();

  return formSchema.validate(url);
};
