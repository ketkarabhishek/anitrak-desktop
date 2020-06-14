import React, { useState, useEffect } from "react"
import { Typography, Grid, Divider, Card, CardContent } from "@material-ui/core"
import { Doughnut } from "react-chartjs-2"

import { getDatabase } from "db/rxdb"

export default function AnimeReact() {
  const [currentCount, setCurrentCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [plannedCount, setPlannedCount] = useState(0)

  useEffect(() => {
    let cur,
      comp,
      plan = null
    async function getData() {
      const db = await getDatabase()
      cur = db.library
        .find({ selector: { status: "current" } })
        .$.subscribe((res) => {
          setCurrentCount(res.length)
        })
      comp = db.library
        .find({ selector: { status: "completed" } })
        .$.subscribe((res) => {
          setCompletedCount(res.length)
        })
      plan = db.library
        .find({ selector: { status: "planned" } })
        .$.subscribe((res) => {
          setPlannedCount(res.length)
        })
      // const cur = await GetLibraryCount({ status: "current" });
      // const comp = await GetLibraryCount({ status: "completed" });
      // const plan = await GetLibraryCount({ status: "planned" });

      // setData([cur, comp, plan]);
    }

    getData()

    return () => {
      if (cur != null) {
        cur.unsubscribe()
      }
      if (comp != null) {
        comp.unsubscribe()
      }
      if (plan != null) {
        plan.unsubscribe()
      }
    }
  }, [])

  const data = {
    datasets: [
      {
        data: [currentCount, completedCount, plannedCount],
        backgroundColor: ["#FFCE56", "#4caf50", "#00BBED"],
        hoverBackgroundColor: ["#f9a825", "#388e3c", "#0288d1"],
        borderColor: "#424242",
        //borderWidth: 4,
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["Current", "Completed", "Planned"],
  }

  const options = {
    cutoutPercentage: 65,
    //circumference: 1 * Math.PI,

    maintainAspectRatio: false,
    // title: {
    //     display: true,
    //     text: 'Example',
    //     fontColor: 'rgb(255, 255, 255)',
    //     fontSize: 20,
    // },
    layout: {},
    legend: {
      display: false,
      position: "bottom",
      labels: {
        fontColor: "rgb(255, 255, 255)",
        fontSize: 14,
      },
    },
  }

  return (
    <div>
      <Card>
        <CardContent>
          <Typography
            align="left"
            variant="h4"
            // style={{ marginBottom: 5, marginLeft: 20 }}
            noWrap
          >
            Anime Count
          </Typography>
          <Divider style={{ marginBottom: 16 }} />
          <Grid container alignItems="center">
            <Grid item lg={6} md={6}>
              <Doughnut
                data={data}
                options={options}
                width={200}
                height={300}
              />
            </Grid>
            <Grid item lg={6} md={6}>
              <Typography
                align="left"
                variant="h5"
                style={{ margin: "10px 20px" }}
              >
                Total: {currentCount + completedCount + plannedCount}
              </Typography>
              <Typography
                align="left"
                variant="h5"
                style={{ margin: "10px 20px", color: "#FFCE56" }}
              >
                Current: {currentCount}
              </Typography>
              <Typography
                align="left"
                variant="h5"
                style={{ margin: "10px 20px", color: "#4caf50" }}
              >
                Completed: {completedCount}
              </Typography>
              <Typography
                align="left"
                variant="h5"
                style={{ margin: "10px 20px", color: "#00BBED" }}
              >
                Planned: {plannedCount}
              </Typography>
              {/* <Typography align="left" variant="h5" style={{margin: 20}}>Dropped: 4</Typography> */}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  )
}
