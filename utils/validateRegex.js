module.exports.validateRegex = (url) => {
  // eslint-disable-next-line
  const regex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/;
  if (regex.test(url)) {
    return url;
  }
  throw new Error('Не валидный url');
};
