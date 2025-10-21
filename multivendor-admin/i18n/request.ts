import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = 'en'; // Default to English for now

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});

