import React from "react";
import { Typography, Divider, makeStyles, Fade } from "@material-ui/core";
import Carousel from "../components/Carousel";
import KitsuStats from "../components/KitsuStats";

const useStyles = makeStyles((theme) => ({
  main: {
    marginLeft: theme.spacing(3),
  },
}));

export default function Dashboard() {
  const classes = useStyles();
  return (
    <div className={classes.main}>
      <Typography style={{ marginTop: "10px" }} align="left" variant="h5">
        Quick Update
      </Typography>
      <Divider style={{ marginBottom: "5px" }}></Divider>
      <Fade in={true} timeout={5000}>
        <Carousel />
      </Fade>
      <Typography style={{ margin: "5px" }} align="left" variant="h5">
        Stats
      </Typography>
      <Divider />
      <KitsuStats />
    </div>
  );
}
