import { CREATE, UPDATE, DELETE } from "constants/QueueConstants";

const { GetAllEntries, getUserId } = require("../../apis/kitsu/Library");
const { GetAllGenres } = require("../../apis/kitsu/kitsu-helper");

const LinvoDB = require("linvodb3");
LinvoDB.defaults.store = { db: require("level-js") };
LinvoDB.dbPath = __dirname + "/database.db";

const Library = new LinvoDB("library", {}, {});
const Website = new LinvoDB("website", {}, {});
const Genres = new LinvoDB("genres", {}, {});

export const Queue = new LinvoDB("queue", {}, {});

//Website Functions

export function EditWebsite(siteName, userName, password) {
  return new Promise(async (resolve, reject) => {
    if (siteName === "kitsu") {
      try {
        const userId = await getUserId(userName);
        Website.findOne({ siteName: siteName }, (err, site) => {
          if (err) {
            console.error(err);
          } else if (site) {
            site.userId = userId;
            site.userName = userName;
            site.password = password;
            // site.isAuth = true;
            // site.auth = auth;
            // site.sync = sync;
            site.save((err) => {
              if (err) {
                console.error(err);
              } else {
                resolve(site);
              }
            });
          } else {
            Website.insert(
              {
                siteName: siteName,
                userId: userId,
                userName: userName,
                password: password,
                sync: true,
              },
              (err, newSite) => {
                if (err) {
                  console.error(err);
                } else {
                  resolve(newSite);
                }
              }
            );
          }
        });
      } catch (err) {
        reject(err);
      }
    }
  });
}

export function ToggleSiteSync(siteName, sync) {
  return new Promise((resolve, reject) => {
    Website.findOne({ siteName: siteName }, (err, doc) => {
      if (err) {
        console.error(err);
        reject();
      } else if (doc) {
        doc.sync = sync;
        doc.save();
        resolve();
      }
    });
  });
}

export function GetPrimarySite() {
  return new Promise((resolve, reject) => {
    Website.findOne({ siteName: "kitsu" }, (err, doc) => {
      if (err) {
        console.error("Kitsu" + err);
      } else if (doc != null) {
        resolve(doc);
      } else {
        resolve({
          siteName: "kitsu",
          userId: "",
          userName: "",
          password: "",
          sync: false,
        });
      }
    });
  });
}

export function GetSites(query) {
  return new Promise((resolve, reject) => {
    Website.find(query, (err, doc) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
}

//Library Functions

export function replaceLibrary(auth) {
  return new Promise((resolve, reject) => {
    Library.remove({}, { multi: true }, async (err, numRemoved) => {
      if (err) {
        console.log(err);
      } else {
        var defSite = await GetPrimarySite();
        var libraryEntries = await GetAllEntries(defSite.userId, auth);
        console.log("LIBLEN: " + libraryEntries.length);
        Library.insert(libraryEntries, (err, newDocs) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Library inserted! " + newDocs.length);
            resolve(newDocs.length);
          }
        });
      }
    });
  });
}

export function GetLibrary(query) {
  return new Promise((resolve, reject) => {
    Library.find(query)
      .sort({ updatedAt: -1 })
      .exec((err, entries) => {
        if (err) {
          console.log(err);
        } else {
          //console.log(entries)
          resolve(entries);
        }
      });
  });
}

export function GetLibraryFindOne(query) {
  return new Promise((resolve, reject) => {
    Library.findOne(query, (err, entries) => {
      if (err) {
        console.error(err);
      } else {
        //console.log(entries)
        resolve(entries);
      }
    });
  });
}

export function GetLibraryCount(query) {
  return new Promise((resolve, reject) => {
    Library.count(query, (err, count) => {
      if (err) {
        console.log(err);
      } else {
        resolve(count);
      }
    });
  });
}

export function AddNewEntry(entry) {
  return new Promise((resolve, reject) => {
    entry.createdAt = new Date().toISOString();
    entry.updatedAt = new Date().toISOString();
    Library.insert(entry, (err, newEntry) => {
      if (err) {
        console.log(err);
      } else {
        const queueItem = {
          type: CREATE,
          id: newEntry.kitsuId,
          data: {
            id: newEntry.kitsuId,
            progress: newEntry.progress,
            status: newEntry.status,
          },
          isSynced: false,
        };
        Queue.insert(queueItem, (err, newDoc) => {
          if (err) {
            console.error(err);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

//Add Kitsu details to new entry
export function AddKitsuDetails(id, response) {
  Library.findOne({ kitsuId: id }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      doc.kitsuEntryId = response.data["id"];
      doc.createdAt = response.data["attributes"]["createdAt"];
      doc.updatedAt = response.data["attributes"]["updatedAt"];
      console.log(response.data["id"]);
      doc.save((err, newDoc) => {
        console.log(JSON.stringify(newDoc));
      });
    }
  });
}

export function EditLibEntry(updatedEntry) {
  return new Promise((resolve, reject) => {
    updatedEntry.updatedAt = new Date().toISOString();
    Library.findById(updatedEntry._id, (entry) => {
      // console.log("IDDDDDD ", updatedEntry.progress)
      Library.save(updatedEntry);
      const queueItem = {
        type: UPDATE,
        id: updatedEntry.kitsuId,
        data: {
          id: updatedEntry.kitsuEntryId,
          progress: updatedEntry.progress,
          status: updatedEntry.status,
          ratingTwenty: updatedEntry.ratingTwenty || null,
        },
        isSynced: false,
      };

      console.log(
        "Updated db entry: " + updatedEntry.title + "-" + updatedEntry.progress
      );
      AddToQueue(queueItem);
      resolve();
    });
  });
}

export function DeleteLibEntry(kitsuEntryId) {
  return new Promise((resolve, reject) => {
    Library.remove({ kitsuEntryId: kitsuEntryId }, {}, (err, removed) => {
      if (err) {
        console.error(err);
      } else {
        const queueItem = {
          type: DELETE,
          id: removed.kitsuEntryId,
          data: {
            id: kitsuEntryId,
          },
          isSynced: false,
        };

        AddToQueue(queueItem);
        resolve();
      }
    });
  });
}

export function EmptyLibrary() {
  Library.remove({}, { multi: true }, (err, num) => {
    console.log("Library Cleared.");
  });
}

//Categories or Genres
export function InsertKitsuGenres() {
  Genres.remove({ site: "kitsu" }, { multi: true }, async (err, numremoved) => {
    if (err) {
      console.log(err);
      return;
    } else {
      const genres = await GetAllGenres();
      Genres.insert(genres, (err, inserted) => {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
  });
}

export function GetGenres(categories) {
  return new Promise((resolve, reject) => {
    Genres.find({ id: { $in: categories } }, (err, docs) => {
      resolve(docs);
    });
  });
}

export function GetGenreCount() {
  return new Promise((resolve, reject) => {
    Genres.count({}, (err, count) => {
      if (err) {
        console.log(err);
      } else {
        resolve(count);
      }
    });
  });
}

// Stats
export function GetTopGenres() {
  return new Promise(async (resolve, reject) => {
    const total = await GetLibraryCount({});
    if (total > 0) {
      Library.find(
        { status: { $in: ["completed", "current"] } },
        async (err, docs) => {
          var ar = [];
          docs.forEach((item) => {
            ar = ar.concat(item.categories);
          });
          ar.sort();
          var freq = getFrequencies(ar);
          freq.sort(function (a, b) {
            return b[1] - a[1];
          });
          let top = [];
          if (freq.length >= 5) {
            top = freq.slice(0, 5);
          } else {
            top = freq.slice(0, freq.length);
          }

          var data = {};

          let c = 0;
          for (let i = 0; i < top.length; i++) {
            // eslint-disable-next-line no-loop-func
            Genres.findOne({ id: top[i][0] }, (_err, doc) => {
              if (_err) {
                console.log(_err);
              } else {
                var x = doc.title;
                data[x] = Math.floor((top[i][1] / total) * 100);
                c++;
                if (c >= top.length) {
                  resolve(data);
                  //console.log(JSON.stringify(data))
                }
              }
            });
          }
        }
      );
    }
  });
}

function getFrequencies(arr) {
  var a = [],
    b = [],
    prev;
  var res = [];
  arr.sort();
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] !== prev) {
      a.push(arr[i]);
      b.push(1);
    } else {
      b[b.length - 1]++;
    }
    prev = arr[i];
  }

  a.forEach((value, i) => {
    res.push([value, b[i]]);
  });

  return res; //{keys: a, values: b};
}

export function GetTotalWatchTime() {
  return new Promise((resolve, reject) => {
    Library.find({ status: { $in: ["completed"] } }, (err, docs) => {
      let totalMin = 0;
      let totalEp = 0;
      docs.forEach((doc) => {
        totalEp = totalEp + doc.total;
        totalMin = totalMin + doc.episodeLength * doc.total;
      });
      let years = Math.floor(totalMin / (60 * 24 * 365));
      let months = Math.floor((totalMin % (60 * 24 * 365)) / 43800.048);
      let days = Math.floor(
        ((totalMin % (60 * 24 * 365)) % 43800.048) / (60 * 24)
      );

      let totalTime = months + " Months " + days + " Days";
      if (years > 0) {
        totalTime = years + " Years " + totalTime;
      }
      resolve({ totalTime, totalEp });
      console.log("MINS " + totalTime);
    });
  });
}

// Queues
function AddToQueue(item) {
  Queue.findOne({ id: item.id }, (err, doc) => {
    if (err) {
      console.log(err);
    } else if (doc) {
      doc.type = item.type;
      doc.data = item.data;
      doc.isSynced = false;
      doc.save();
      console.log("Updated in queue");
    } else {
      Queue.insert(item, (err, newDoc) => {
        if (err) {
          console.error(err);
        }
        console.log("Inserted in queue");
      });
    }
  });
}

export function EmptyQueue() {
  Queue.remove({}, { multi: true });
}

export function ToggleQueueItemStatus(id) {
  Queue.findById(id, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      doc.isSynced = true;
      doc.save((err) => {
        if (err) console.error(err);
      });
    }
  });
}
