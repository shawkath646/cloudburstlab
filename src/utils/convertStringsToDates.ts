import { cache } from "react";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

const convertStringsToDates = cache((obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string' && isoDateRegex.test(obj)) {
      const date = new Date(obj);
      if (!isNaN(date.getTime())) return date;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertStringsToDates(item));
  }

  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    result[key] = convertStringsToDates(obj[key]);
  }
  return result;
});

export default convertStringsToDates;