const parseCookies = (req, res, next) => {
  let cookieObj = {name: null, value: null, expire: new Data()};
  if (req.cookie === undefined) {
    res.cookie(cookie1, 1234);
    cookieObj.name = res.cookie.name;
    cookieObj.value = res.cookie.value;
  }

  return req.cookies = cookieObj;
};

module.exports = parseCookies;