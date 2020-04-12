import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, LinearProgress, Button } from "@material-ui/core";
import { Star } from "@material-ui/icons";
import EditEntryDialog from "../EditEntryDialog";
import AnimeInfoDialog from "../AnimeInfoDialog";
import Img from "react-image";
import ContentLoader from "react-content-loader";

const useStyles = makeStyles({
  container: {
    position: "relative",
    textAlign: "center",
    // maxWidth: '215px',
    color: "white",
    marginRight: 0,
  },

  infoContainer: {
    position: "absolute",
    backgroundColor: "rgb(0,0,0,0.7)",
    top: "0",
    bottom: "0",
    width: "100%",
    height: "auto",
    opacity: "0",
    overflow: "hidden",
    transition: "opacity 0.3s",
    "&:hover": {
      opacity: "1",
    },
  },

  info: {
    top: "50%",
    bottom: "50%",
    margin: "15px 20px",
  },

  image: {
    display: "block",
    height: "auto",
    width: "100%",
  },

  editButton: {
    marginTop: "10px",
  },

  title: {
    margin: "15px 0",
    bottom: "0%",
  },
});

const MyLoader = () => (
  <ContentLoader
    backgroundColor="#7d7d7d"
    foregroundColor="#cecccc"
    style={{ width: "100%", height: "300px" }}
  >
    {/* <rect x="95" y="140" rx="0" ry="0" width="0" height="0" /> 
        <rect x="99" y="115" rx="0" ry="0" width="0" height="0" />  */}
    <rect x="0" y="0" rx="0" ry="0" width="400" height="400" />
  </ContentLoader>
);

export default function LibraryItem(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  function handleEditButton() {
    setOpen(true);
  }

  function handleOpenInfo() {
    setOpenInfo(true);
  }

  function handleClose() {
    setOpen(false);
    setOpenInfo(false);
  }

  return (
    <div className={classes.container}>
      <Img
        src={props.data.posterUrl}
        loader={<MyLoader />}
        className={classes.image}
        // container={children => (
        //     <Fade in={true} timeout={2000}>{children}</Fade>
        // )}
      />

      <div className={classes.infoContainer}>
        <LinearProgress
          variant="determinate"
          value={(props.data.progress / props.data.total) * 100}
          color="secondary"
        ></LinearProgress>
        <div className={classes.info} style={{ WebkitUserSelect: "none" }}>
          <Typography variant="body1">{props.data.showType}</Typography>

          <Typography variant="caption">Progress</Typography>
          <Typography variant="h4">
            {props.data.progress}/{props.data.total}
          </Typography>

          <Typography variant="caption">Rating</Typography>
          <Typography variant="h4" gutterBottom>
            {props.data.ratingTwenty / 2}{" "}
            <span>
              <Star />
            </span>
          </Typography>

          <Button
            className={classes.editButton}
            style={{ margin: "0px 5px" }}
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleEditButton}
          >
            Edit
          </Button>
          <Button
            className={classes.editButton}
            style={{ margin: "0px 5px" }}
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleOpenInfo}
          >
            Info
          </Button>

          <Typography variant="subtitle2" className={classes.title}>
            {props.data.title}
          </Typography>
        </div>
      </div>
      <EditEntryDialog
        open={open}
        data={props.data}
        handleClose={handleClose}
      />
      <AnimeInfoDialog
        open={openInfo}
        data={props.data}
        handleClose={handleClose}
      />
    </div>
  );
}
