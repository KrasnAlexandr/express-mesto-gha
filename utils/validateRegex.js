module.exports.validateRegex = (url) => {
  // eslint-disable-next-line
  const regex = /^(https?:\/\/)?([\w\.]+)\.([a-z]{2,6}\.?)(\/[\w\.]*)*\/?$/;
  if (regex.test(url)) {
    return url;
  }
  throw new Error('Не валидный url');
};
