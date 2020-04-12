const clientId =
  "dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd";
const clientSecret =
  "54d7307928f63414defd96399fc31ba847961ceaecef3a5fd93144e960c0e151";
const tokenURL = "https://kitsu.io/api/oauth/token";

export function KitsuLogin(username, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(tokenURL, {
        method: "POST",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
        body: JSON.stringify({
          grant_type: "password",
          client_id: clientId,
          client_secret: clientSecret,
          username: username,
          password: password,
        }),
      });
      if (response.status === 200) {
        resolve(response.json());
      } else {
        reject("Kitsu Login Error. Status Code: " + response.status);
      }
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
