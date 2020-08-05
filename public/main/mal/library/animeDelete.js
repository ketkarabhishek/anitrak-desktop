const axios = require("axios");

module.exports = function (log, sendJsonBody) {
  console.log("CSRF_TOKEN:", sendJsonBody)
  let jsonBody = {
    csrf_token: log.csrf_token
  };

  let options = {
    method: "post",
    url: `https://myanimelist.net/ownlist/anime/${sendJsonBody.anime_id}/delete`,
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      cookie: `MALSESSIONID=${log.MALSESSIONID}; is_logged_in=1;`
    },
    data: JSON.stringify(jsonBody)
  };

  return new Promise((res, rej) => {
    axios(options)
      .then(r => {
        if (r.data == null) res(r.data);
        else rej(r.data);
      })
      .catch(err => rej(`Error: ${err}`));
  });
}


// animeDelete(
//     {
//      MALSESSIONID: '2e6r2vusq8fdfmj3fkrc7itg46',
//      csrf_token: 'd38f3f6ca726d86eebb2fd40cf01047fc0278944'
//     },
//     {anime_id: 38816}
// ).then(res => console.log(res))
// .catch(err => console.error)