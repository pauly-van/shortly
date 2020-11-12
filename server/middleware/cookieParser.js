const parseCookies = (req, res, next) => {
  if (req.headers.cookie !== undefined) {
    let headerCookie = req.headers.cookie;
    let cookieArray = headerCookie.split('; ');
    let cookieObj = {};
    for (let i = 0; i < cookieArray.length; i++) {
      let splitCookie = cookieArray[i].split('=');
      cookieObj[splitCookie[0]] = splitCookie[1];
    }
    req.cookies = cookieObj;
  }
  next();
};

module.exports = parseCookies;
