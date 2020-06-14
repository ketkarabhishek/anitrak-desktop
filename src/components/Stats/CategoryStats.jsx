import React, { useState, useEffect } from "react"
import { Typography, Grid, Divider, Card, CardContent } from "@material-ui/core"
import { Doughnut } from "react-chartjs-2"

import _ from "lodash"
import { getDatabase } from "db/rxdb"

export default function CategoryStats(props) {
  const [labels, setLabels] = useState([])
  const [values, setValues] = useState([])

  useEffect(() => {
    async function getData() {
      const db = await getDatabase()
      const docs = await db.library.find().exec()
      const catIds = docs.reduce(
        (total, current) => total.concat(current.categories),
        []
      )
      const catFreq = _.toPairs(_.countBy(catIds))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
      const mLabels = await Promise.all(
        catFreq.map(async (cat) => {
          const dbCat = await db.categories
            .findOne({ selector: { id: cat[0] } })
            .exec()
          return dbCat.title
        })
      )

      const mValues = catFreq.map((cat) =>
        Math.floor((cat[1] / docs.length) * 100)
      )
      setLabels(mLabels)
      setValues(mValues)
    }

    getData()
  }, [])

  const colors = [
    "#FEB700",
    "#FF9300",
    "#BC6EDA",
    "#FFCE56",
    "#4caf50",
    "#00BBED",
  ]
  const data = {
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        // hoverBackgroundColor: [
        // '#f9a825',
        // '#388e3c',
        // '#0288d1'
        // ],
        borderColor: "#424242",
        //borderWidth: 4,
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: labels,
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
          <Typography align="left" variant="h4">
            Categories
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
                style={{ margin: "10px 20px", color: colors[0] }}
              >
                {labels[0]}: {values[0]}%
              </Typography>
              <Typography
                align="left"
                variant="h5"
                style={{ margin: "10px 20px", color: colors[1] }}
              >
                {labels[1]}: {values[1]}%
              </Typography>
              <Typography
                align="left"
                variant="h5"
                style={{ margin: "10px 20px", color: colors[2] }}
              >
                {labels[2]}: {values[2]}%
              </Typography>
              <Typography
                align="left"
                variant="h5"
                style={{ margin: "10px 20px", color: colors[3] }}
              >
                {labels[3]}: {values[3]}%
              </Typography>
              <Typography
                align="left"
                variant="h5"
                style={{ margin: "10px 20px", color: colors[4] }}
              >
                {labels[4]}: {values[4]}%
              </Typography>
              {/* <Typography align="left" variant="h5" style={{margin: '10px 20px', color: colors[5]}}>{labels[5]}: {values[5]}%</Typography> */}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  )
}
