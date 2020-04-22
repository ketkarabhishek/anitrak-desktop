import { GetMalFromKitsu } from "./kitsu-helper";

const baseUrl = "https://kitsu.io/api/edge/users";

export async function GetAllEntries(userId, token) {
  const url =
    baseUrl +
    "/" +
    userId +
    "/library-entries?filter[kind]=anime&include=anime.categories&page[limit]=500";

  let libData = await makeRequest(url, token);
  const libraryEntries = libData.mlibEntries;

  while (libData.nextUrl !== "undefined" && libData.nextUrl != null) {
    let nextUrl = libData.nextUrl;
    libData = await makeRequest(nextUrl, token);
    libraryEntries.concat(libData.mlibEntries);
  }

  if (libData.nextUrl === "undefined" || libData.nextUrl == null) {
    return libraryEntries;
  }
}

function makeRequest(url, token) {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      headers: {
        "cache-control": "no-cache",
        Authorization: "Bearer " + token.access_token,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
    };
    console.log("Options Body: ", JSON.stringify(options));
    fetch(url, options)
      .then((res) => res.json())
      .then((resJson) => {
        var totalItemCount = resJson.meta.count;
        console.log("COUNT" + totalItemCount);
        //Get keys of all entries
        var keys = Object.keys(resJson.data);

        //Array of Library entries
        const data = extractEntryFromJson(resJson, keys);
        if (data.currentCount < totalItemCount) {
          data.nextUrl = resJson.links.next;
          resolve(data);
        } else {
          resolve(data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

async function extractEntryFromJson(resJson, keys) {
  var totalItemCount = resJson.meta.count;
  //Array of Library entries
  const mlibEntries = [];

  let c = 0;
  for (let index = 0; index < totalItemCount; index++) {
    const entry = {};
    let key = keys[index];
    entry.kitsuEntryId = resJson.data[key]["id"];
    entry.progress = parseInt(resJson.data[key]["attributes"]["progress"]);
    entry.status = resJson.data[key]["attributes"]["status"];
    entry.reconsumeCount = parseInt(
      resJson.data[key]["attributes"]["reconsumeCount"]
    );
    entry.ratingTwenty = parseInt(
      resJson.data[key]["attributes"]["ratingTwenty"]
    );
    entry.averageRating = parseInt(
      resJson.data[key]["attributes"]["averageRating"]
    );
    entry.createdAt = resJson.data[key]["attributes"]["createdAt"];
    entry.updatedAt = resJson.data[key]["attributes"]["updatedAt"];

    entry.kitsuId = resJson.included[key]["id"];
    entry.titleSlug = resJson.included[key]["attributes"]["slug"];
    entry.title = resJson.included[key]["attributes"]["canonicalTitle"];
    entry.posterUrl =
      resJson.included[key]["attributes"]["posterImage"]["small"];
    entry.total = parseInt(resJson.included[key]["attributes"]["episodeCount"]);
    entry.episodeLength = parseInt(
      resJson.included[key]["attributes"]["episodeLength"]
    );
    entry.showType = resJson.included[key]["attributes"]["showType"];
    entry.averageRating = resJson.included[key]["attributes"]["averageRating"];
    entry.synopsis = resJson.included[key]["attributes"]["synopsis"];
    entry.airDate = resJson.included[key]["attributes"]["startDate"];

    // //Get MAL id
    // entry.malId = await GetMalFromKitsu(resJson.included[key]["id"])

    entry.synced = true;

    //Categories
    entry.categories = [];

    var categories =
      resJson.included[key]["relationships"]["categories"]["data"];

    categories.forEach((element) => {
      entry.categories.push(element.id);
    });
    c++;
    mlibEntries.push(entry);
    if (c === keys.length) {
      console.log(entry.categories);
      return { mlibEntries: mlibEntries, currentCount: c };
    }
  }
}

export async function getUserId(username) {
  return new Promise((resolve, reject) => {
    const url = baseUrl + "?filter[slug]=" + username;
    fetch(url)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.data.length > 0) {
          const userId = resJson.data["0"]["id"];
          resolve(userId);
        } else {
          reject("User not found!");
        }
      });
  });
}

//Create Library Entries
export function CreateKitsuEntry(kitsuAuth, mdata) {
  return new Promise(async (resolve, reject) => {
    const body = {
      data: {
        type: "libraryEntries",
        attributes: {
          status: mdata.status,
          progress: mdata.progress,
        },
        relationships: {
          user: {
            data: {
              id: kitsuAuth.userId,
              type: "users",
            },
          },
          media: {
            data: {
              id: mdata.id,
              type: "anime",
            },
          },
        },
      },
    };

    const url = "https://kitsu.io/api/edge/library-entries/";

    const options = {
      method: "POST",
      headers: {
        "cache-control": "no-cache",
        Authorization: "Bearer " + kitsuAuth.access_token,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(body),
    };
    console.log(JSON.stringify(body));
    try {
      const response = await fetch(url, options);
      const res = await response.json();
      if (response.ok) {
        resolve(res);
      } else {
        reject(res);
      }
    } catch (error) {
      console.error("KITSU ERROR: " + error);
      reject(error);
    }
  });
}

// Update Kitsu Library entries
export function UpdateKitsuEntry(kitsuAuth, data) {
  return new Promise(async (resolve, reject) => {
    const body = {
      data: {
        type: "libraryEntries",
        id: data.id,
        attributes: {
          status: data.status,
          progress: data.progress,
          ratingTwenty: data.ratingTwenty,
        },
      },
    };
    const url = "https://kitsu.io/api/edge/library-entries/" + data.id;

    const options = {
      method: "PATCH",
      headers: {
        "cache-control": "no-cache",
        Authorization: "Bearer " + kitsuAuth.access_token,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(url, options);
      const res = await response.json();
      console.log(res);

      resolve(res);
    } catch (error) {
      console.error(error.body);
      reject(error.body);
    }
  });
}

// Delete Kitsu Library entries
export function DeleteKitsuEntry(kitsuAuth, data) {
  return new Promise(async (resolve, reject) => {
    const url = "https://kitsu.io/api/edge/library-entries/" + data.id;
    console.log("DELETE URL: " + url);
    const options = {
      method: "DELETE",
      headers: {
        "cache-control": "no-cache",
        Authorization: "Bearer " + kitsuAuth.access_token,
        // Accept: 'application/vnd.api+json',
        "Content-Type": "application/vnd.api+json",
      },
    };

    console.log("Delete Options: " + JSON.stringify(options));

    try {
      const response = await fetch(url, options);

      if (response.status === 204) {
        console.log("Delete req successful");
        resolve();
      }
    } catch (error) {
      console.error(error.body);
      reject(error.body);
    }
  });
}
