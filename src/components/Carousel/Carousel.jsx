import React, { useState, useEffect } from "react"
import { Typography, Grid, CircularProgress } from "@material-ui/core"
import CarouselItem from "./CarouselItem"
import { default as MyCarousel } from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import { getDatabase } from "db/rxdb"

export default function Carousel() {
  const [isLoading, setLoading] = useState(true)
  const [carouselItems, setCarouselItems] = useState([])
  const [isEmpty, setEmpty] = useState(false)

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1270 },
      items: 6,
    },
    tablet: {
      breakpoint: { max: 1270, min: 464 },
      items: 4,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  }

  const preventDragHandler = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    let sub = null
    async function getData() {
      console.log("Get Carousel")
      const db = await getDatabase()
      sub = db.library
        .find({
          selector: { status: "current" },
          sort: [{ updatedAt: "desc" }],
        })
        .$.subscribe((libEntries) => {
          if (libEntries.length > 0) {
            setCarouselItems(libEntries)
            setLoading(false)
          } else {
            setEmpty(true)
          }
        })
    }

    getData()

    return () => {
      if (sub != null) {
        sub.unsubscribe()
      }
    }
  }, [])

  const DataDisplay = ({ empty }) =>
    empty > 0 ? (
      <div style={{ padding: "90px 0" }}>
        <Typography align="center" variant="h4" gutterBottom>
          You haven't watched anything yet.
        </Typography>
      </div>
    ) : (
      <div>
        {isLoading ? (
          <Grid
            container
            justify="center"
            alignItems="center"
            style={{ height: 390 }}
          >
            <CircularProgress size="4rem" disableShrink />
          </Grid>
        ) : (
          <MyCarousel
            responsive={responsive}
            centerMode={true}
            slidesToSlide={2}
            draggable={true}
            swipeable={false}
            itemClass="carousel-cell"
            containerClass="carousel-container"
          >
            {carouselItems.map((entry) => (
              <CarouselItem data={entry} key={entry.kitsuId} />
            ))}
          </MyCarousel>
        )}
      </div>
    )

  return (
    <div onDragStart={preventDragHandler}>
      <DataDisplay empty={isEmpty} />

      <style global="true" jsx="true">{`
        .carousel-cell {
          margin-right: 5px;
          margin-bottom: 5px;
        }

        .carousel-container {
        }
      `}</style>
    </div>
  )
}
