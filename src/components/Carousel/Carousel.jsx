import React, { useState, useEffect } from "react";
import { Typography, Grid, CircularProgress } from "@material-ui/core";
import { GetLibrary } from "../../db/linvodb/LinvodbHelper";
import CarouselItem from "./CarouselItem";
import { default as MyCarousel } from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default function Carousel() {
  const [isLoading, setLoading] = useState(true);
  const [carouselItems, setCarouselItems] = useState([]);
  const [isEmpty, setEmpty] = useState(false);

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
  };

  const preventDragHandler = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    async function getData() {
      const libEntries = await GetLibrary({ status: "current" });
      //console.log("Carousel" + libEntries[0].categories)
      if (libEntries.length > 0) {
        let mcarouselItems = [];
        libEntries.map((entry) =>
          mcarouselItems.push(<CarouselItem data={entry} key={entry.kitsuId} />)
        );
        setCarouselItems(mcarouselItems);
        setLoading(false);
      } else {
        setEmpty(true);
      }
    }

    getData();
  }, []);

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
            {carouselItems}
          </MyCarousel>
        )}
      </div>
    );

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
  );
}
