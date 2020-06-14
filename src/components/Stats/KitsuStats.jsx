import React, { useState, useEffect } from "react"
import AnimeCount from "./AnimeCount"
import CategoryStats from "./CategoryStats"
import { Grid, Typography, Card } from "@material-ui/core"
import { getDatabase } from "db/rxdb"

export default function KitsuStats() {
  const [episodes, setEpisodes] = useState(0)
  const [time, setTime] = useState("")

  useEffect(() => {
    async function getData() {
      const db = await getDatabase()
      const entries = await db.library.find().exec()
      const totalMinutes = entries.reduce((total, current) => {
        return total + current.progress * current.episodeLength
      }, 0)
      const dayjs = require("dayjs")
      dayjs.extend(require("dayjs/plugin/duration"))
      const totalTime = dayjs.duration(totalMinutes * 60 * 1000)
      setTime(`${totalTime.months()} Months ${totalTime.days()} Days`)

      const totalEpisodes = entries.reduce((total, current) => {
        return total + current.progress
      }, 0)
      setEpisodes(totalEpisodes)
    }
    getData()
  }, [])

  return (
    <div>
      <Grid container>
        <Grid item lg={6} md={6}>
          <div style={{ marginTop: 10, marginRight: 10 }}>
            <AnimeCount />
          </div>
        </Grid>
        <Grid item lg={6} md={6}>
          <div style={{ marginTop: 10, marginRight: 10 }}>
            <CategoryStats />
          </div>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item lg={6} md={6}>
          <Card
            style={{
              marginTop: 10,
              marginRight: 10,
              marginBottom: 10,
              padding: 10,
            }}
          >
            <Typography variant="h5" align="center">
              Watchtime
            </Typography>
            <Typography variant="h3" color="primary" align="center">
              {time}
            </Typography>
          </Card>
        </Grid>
        <Grid item lg={6} md={6}>
          <Card
            style={{
              marginTop: 10,
              marginRight: 10,
              marginBottom: 10,
              padding: 10,
            }}
          >
            <Typography variant="h5" align="center">
              Episodes
            </Typography>
            <Typography variant="h3" color="primary" align="center">
              {episodes}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
