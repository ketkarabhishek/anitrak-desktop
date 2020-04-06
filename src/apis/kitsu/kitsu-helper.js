const baseUrl = "https://kitsu.io/api/edge/";

export function GetAllGenres(){
    return new Promise((resolve, reject) => {
        const url = baseUrl + "genres?page[limit]=500";
        fetch(url).then((res) => res.json()).then((resJson) => {
            const genres = []
            //Get keys of all entries
            var keys = Object.keys(resJson.data);

            let c = 0;
            for(var i = 0; i < keys.length; i++){
                let key = keys[i]
                let genre = {};
                genre.id = resJson.data[key]['id'];
                genre.title = resJson.data[key]['attributes']['name'];
                genre.slug = resJson.data[key]['attributes']['slug'];
                genre.site = "kitsu";
                genres.push(genre);
                c++;

                if(c === keys.length){
                    console.log(genre)
                    resolve(genres);
                }
        
            }
        }).catch((error) => {console.error(error);
        })
    })
}

export function KitsuSearch(key , filters){
    return new Promise(async(resolve, reject) => {
        const url = baseUrl + "anime?page[limit]=20&filter[text]=" + key + "&include=categories";

        const result = await fetch(url);
        const resJson = await result.json();
        let res = [];
        resJson.data.forEach((item, index) => {
            const data = {
                kitsuId: item['id'],
                posterUrl: item['attributes']['posterImage']['small'],
                title: item['attributes']['canonicalTitle'],
                titleSlug: item['attributes']['slug'],
                showType: item['attributes']['subtype'],
                synopsis: item['attributes']['synopsis'],
                airDate: item['attributes']['startDate'],
                progress: 0,
                total: item['attributes']['episodeCount'],
                episodeLength: item['attributes']['episodeLength'],
                averageRating: item['attributes']['averageRating'],
                ratingTwenty: 0,
                status: "Add",
                categories: [],
            }
            let x = item['relationships']['categories']['data'];
            x.forEach((element) => {
                data.categories.push(element.id);
            })
            res.push(data);
        })
        
        resolve(res);
    })
}