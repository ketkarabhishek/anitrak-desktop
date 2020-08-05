import React, { useState, useEffect } from "react"
import { AppBar, Toolbar, InputBase, Grid, Fade } from "@material-ui/core"
import { fade, makeStyles } from "@material-ui/core/styles"
import { Search } from "@material-ui/icons"
import SearchItem from "../components/SearchItem"
import useDebounce from "hooks/useDebounce"
import KitsuApi from "kitsu-api-wrapper"
import { GetMalIdFromKitsuId, KitsuParseAnime } from "apis/kitsu/utils"
import DataDisplay from "components/DataDisplay"

const useStyles = makeStyles((theme) => ({
  main: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(3),
    height: "100%",
    paddingRight: "15px",
  },

  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },

    width: "75%",
    // [theme.breakpoints.up('md')]: {
    //   marginLeft: theme.spacing(1),
    //   width: '100%',
    // },
  },

  searchIcon: {
    width: theme.spacing(7),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    // transition: theme.transitions.create('width'),
    width: "100%",
    // '&:focus': {
    //   color: theme.palette.primary.main
    // },
    // [theme.breakpoints.up('sm')]: {
    //   width: '100%',
    // //   '&:focus': {
    // //     width: 600,
    // //   },
    // },
  },
}))

export default function SearchPage() {
  const [isLoading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState([])

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const classes = useStyles()

  async function handleInput(e) {
    setSearchTerm(e.target.value)
  }

  async function extractDataFromResult(result) {
    const data = {
      kitsuId: result["id"],
      posterUrl: result["attributes"]["posterImage"]["small"],
      title: result["attributes"]["canonicalTitle"],
      showType: result["attributes"]["subtype"],
      synopsis: result["attributes"]["synopsis"],
      airDate: result["attributes"]["startDate"],
      progress: 0,
      totalEpisodes:
        result["attributes"]["episodeCount"] == null
          ? -1
          : parseInt(result["attributes"]["episodeCount"]),
      episodeLength:
        result["attributes"]["episodeLength"] == null
          ? 20
          : parseInt(result["attributes"]["episodeLength"]),
      averageRating:
        result["attributes"]["averageRating"] == null
          ? "N/A"
          : result["attributes"]["averageRating"],
      ratingTwenty: 0,
      status: "Add",
    }
    data.categories = result["relationships"]["categories"]["data"].map(
      (citem) => citem.id
    )
    return Promise.resolve(data)
  }

  useEffect(
    () => {
      const kitsuApi = new KitsuApi()
      async function getData() {
        const query = kitsuApi.anime.fetch({
          filter: { text: debouncedSearchTerm },
          page: { limit: 12 },
          include: "categories",
        })
        try {
          const res = await query.exec()
          const pres = res.data.map(async (item) => {
            const data = await KitsuParseAnime(item)
            data.progress = 0
            // data.malId = await GetMalIdFromKitsuId(data.kitsuId)
            return data
          })
          const results = await Promise.all(pres)
          setLoading(false)
          setResults(results)
        } catch (error) {
          console.error(error)
          setResults([])
        }
      }
      // Make sure we have a value (user has entered something in input)
      if (debouncedSearchTerm) {
        // Set isSearching state
        setLoading(true)
        getData()
      } else {
        setResults([])
      }
    },
    // This is the useEffect input array
    // Our useEffect function will only execute if this value changes ...
    // ... and thanks to our hook it will only change if the original ...
    // value (searchTerm) hasn't changed for more than 500ms.
    [debouncedSearchTerm]
  )

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const kitsuApi = new KitsuApi()
      const query = kitsuApi.anime.fetch({
        page: { limit: 12 },
        include: "categories",
        sort: "popularityRank",
      })
      try {
        const res = await query.exec()
        console.log(query.nextUrl)
        const pres = res.data.map(async (item) => {
          const data = await KitsuParseAnime(item)
          data.progress = 0
          // data.malId = await GetMalIdFromKitsuId(data.kitsuId)
          return data
        })
        const results = await Promise.all(pres)
        setLoading(false)
        setResults(results)
      } catch (error) {
        console.error(error)
        setResults([])
      }
    }

    getData()
  }, [])

  return (
    <div>
      <AppBar color="inherit" position="sticky">
        <Toolbar>
          <Grid
            container
            justify="center"
            style={{ margin: "10px 0", position: "relative" }}
          >
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <Search />
              </div>
              <InputBase
                placeholder="Search..."
                color="primary"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                onChange={handleInput}
              ></InputBase>
            </div>
          </Grid>
        </Toolbar>
      </AppBar>

      <div className={classes.main}>
        <DataDisplay loading={isLoading}>
          <Fade in={!isLoading} timeout={500}>
            <Grid container spacing={1}>
              {results.map((element) => (
                <Grid item lg={2} md={3} key={element.kitsuId}>
                  <SearchItem data={element}></SearchItem>
                </Grid>
              ))}
            </Grid>
          </Fade>
        </DataDisplay>
      </div>
    </div>
  )
}
