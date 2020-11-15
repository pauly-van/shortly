const parseCookies = (req, res, next) => {
  let cookieObj = {};
  if (req.headers.cookie) {
    let headerCookie = req.headers.cookie;
    let cookieArray = headerCookie.split('; ');
    for (let i = 0; i < cookieArray.length; i++) {
      let splitCookie = cookieArray[i].split('=');
      cookieObj[splitCookie[0]] = splitCookie[1];
    }
  }
  req.cookies = cookieObj;
  next();
};

module.exports = parseCookies;
