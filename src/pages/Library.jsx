import React, { useState, useEffect } from "react"
import {
  Typography,
  Grid,
  Divider,
  makeStyles,
  CircularProgress,
} from "@material-ui/core"
import LibraryItem from "components/LibraryItem"

import InfiniteScroll from "react-infinite-scroller"
import { getDatabase } from "db/rxdb"
import DataDisplay from "components/DataDisplay"

const useStyles = makeStyles((theme) => ({
  main: {
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(3),
    height: "100%",
    paddingRight: "15px",
  },
}))

export default function Library(props) {
  const classes = useStyles()

  const [library, setLibrary] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [status, setStatus] = useState("")
  const [hasMore, setHasMore] = useState(true)
  const [count, setCount] = useState(24)
  const [isEmpty, setEmpty] = useState(false)

  const fetchMoreData = () => {
    setCount(count + 24)
    if (count >= library.length) {
      setHasMore(false)
    }
  }

  useEffect(() => {
    setEmpty(false)
    setLoading(true)
    setHasMore(true)
    setCount(24)
    setLibrary([])

    let sub = null
    async function populatePage() {
      let st = props.match.params.status
      setStatus(st.replace(/^./, st[0].toUpperCase()))
      const db = await getDatabase()
      sub = db.library
        .find({ selector: { status: st }, sort: [{ updatedAt: "desc" }] })
        .$.subscribe((lib) => {
          console.log(lib)
          setLibrary(lib)

          if (lib.length === 0) {
            setEmpty(true)
          }

          if (lib.length <= 24) {
            setHasMore(false)
          }

          setLoading(false)
        })
    }
    populatePage()

    return () => {
      if (sub != null) {
        sub.unsubscribe()
      }
    }
  }, [props.match.params.status])

  return (
    <div className={classes.main}>
      <Typography style={{ marginTop: "10px" }} align="left" variant="h5">
        {status}
      </Typography>
      <Divider style={{ marginBottom: "5px" }}></Divider>

      <DataDisplay loading={isLoading} empty={isEmpty}>
        <InfiniteScroll
          pageStart={count}
          loadMore={fetchMoreData}
          hasMore={hasMore}
          loader={
            <Grid
              container
              justify="center"
              key="infiniteprogress"
              style={{ marginTop: 20 }}
            >
              <CircularProgress disableShrink />
            </Grid>
          }
        >
          <Grid container spacing={1}>
            {library.slice(0, count).map((element) => (
              <Grid item lg={2} md={3} key={element.kitsuId}>
                <LibraryItem data={element} />
              </Grid>
            ))}
          </Grid>
        </InfiniteScroll>
      </DataDisplay>
    </div>
  )
}
