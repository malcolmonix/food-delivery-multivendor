export const retryQuery = async <
  T extends any,
  V extends any,
>(
  queryFn: () => Promise<T>,
  retries: number,
  delayMs: number
): Promise<T> => {
  let attempt = 0;

  const retry = async (): Promise<T> => {
    try {
      return await queryFn();
    } catch (error) {
      if (attempt < retries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return retry();
      } else {
        throw error;
      }
    }
  };

  return retry();
};

export const omitExtraAttributes = <T extends object>(
  obj: Partial<T>,
  schema: T
): T => {
  const validKeys = Object.keys(schema) as Array<keyof T>;
  const filteredObj = {} as T;

  validKeys.forEach((key) => {
    if (key in obj) {
      filteredObj[key] = obj[key] as T[keyof T];
    }
  });

  return filteredObj;
};

