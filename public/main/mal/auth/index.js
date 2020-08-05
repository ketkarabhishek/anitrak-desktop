// export interface LoginData {
//   MALSESSIONID: string;
//   csrf_token: string;
// }

module.exports = function(login, password) {
  const getStartData = require("./getStartData");
  const loginWithData = require("./loginWithData");

  return new Promise((res, rej) => {
    getStartData()
      .then(startData => loginWithData(login, password, startData))
      .then(logData => res(logData))
      .catch(err => rej(err));
  });
}
