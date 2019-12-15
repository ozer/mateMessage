export const resolveCursor = ({ id, type }) => {
  if (!type || !id) {
    return '';
  }

  const base64 = Buffer.from(`${type}:${id}`);
  return base64.toString('base64');
};
