import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Button,
  Dialog,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
} from "@material-ui/core";
import { useSnackbar } from "notistack";

import {
  GetLibraryFindOne,
  AddNewEntry,
  EditLibEntry,
} from "../../db/linvodb/LinvodbHelper";
import AnimeInfoDialog from "../AnimeInfoDialog";
import Img from "react-image";
import ContentLoader from "react-content-loader";

//import ContentLoader from 'react-content-loader';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },

  container: {
    position: "relative",
    textAlign: "center",
    width: "100%",
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
    transition: "opacity 0.3s",
    "&:hover": {
      opacity: "1",
    },
  },

  info: {
    top: "50%",
    bottom: "50%",
    margin: "30px 20px",
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
}));

export default function SearchItem(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Add");
  const [exists, setExists] = useState(false);
  const [data, setData] = useState(props.data);
  const [openInfo, setOpenInfo] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const statusList = [
    {
      value: "current",
      label: "Current",
    },
    {
      value: "completed",
      label: "Completed",
    },
    {
      value: "planned",
      label: "Planned",
    },
  ];

  const handleClick = (event) => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setOpenInfo(false);
  };

  function handleOpenInfo() {
    setOpenInfo(true);
  }

  const handleListClick = (i) => {
    const newData = data;
    newData.status = statusList[i].value;

    if (exists) {
      EditLibEntry(newData).then(() => {
        enqueueSnackbar("Edited " + newData.title, { variant: "success" });
      });
    } else {
      AddNewEntry(newData).then(() => {
        enqueueSnackbar("Added " + newData.title, { variant: "success" });
      });
    }

    setOpen(false);
    setStatus(statusList[i].value);
  };

  useEffect(() => {
    let cancel = false;
    const helper = async () => {
      setStatus("Add");
      const entry = await GetLibraryFindOne({ kitsuId: props.data.kitsuId });
      if (entry != null && cancel === false) {
        entry.rating = data.rating;
        setStatus(entry.status);
        setExists(true);
        setData(entry);
        //console.log(entry.status + entry.title)
      }
    };
    helper();
    return () => {
      cancel = true;
    };
  }, []);

  const MyLoader = () => (
    <ContentLoader
      // height={350}
      // width={130}
      backgroundColor="#7d7d7d"
      foregroundColor="#cecccc"
      style={{ width: "100%", height: "300px", display: "block" }}
    >
      {/* <rect x="95" y="140" rx="0" ry="0" width="0" height="0" /> 
            <rect x="99" y="115" rx="0" ry="0" width="0" height="0" />  */}
      <rect x="0" y="0" rx="0" ry="0" width="400" height="400" />
    </ContentLoader>
  );
  return (
    <div>
      <Card variant="outlined">
        <div className={classes.container}>
          {/* <img src={data.posterUrl} alt={data.title} className={classes.image} title={data.title}/> */}

          <Img
            src={data.posterUrl}
            loader={<MyLoader />}
            className={classes.image}
          />

          <div className={classes.infoContainer}>
            <div className={classes.info} style={{ WebkitUserSelect: "none" }}>
              <Typography variant="body1">{data.showType}</Typography>

              <Typography variant="caption">Progress</Typography>
              <Typography variant="h4">
                {data.progress}/{data.total}
              </Typography>

              <Typography variant="caption">Average Rating</Typography>
              <Typography variant="h4">
                {data.averageRating} <span>%</span>
              </Typography>

              <Button
                className={classes.editButton}
                style={{ margin: "5px" }}
                fullWidth
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleClick}
              >
                {status}
              </Button>
              <Button
                className={classes.editButton}
                style={{ margin: "5px" }}
                fullWidth
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleOpenInfo}
              >
                Info
              </Button>
              {/* <Typography variant="subtitle2" className={classes.title}>{data.title}</Typography> */}
            </div>
          </div>

          <Dialog open={open} onClose={handleClose} maxWidth="xs">
            {/* <DialogTitle>Add to List</DialogTitle> */}
            <Divider />
            <List style={{ width: "20em" }}>
              {statusList.map((item, i) => (
                <ListItem
                  button
                  key={item.value}
                  onClick={() => handleListClick(i)}
                >
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Dialog>

          {openInfo && (
            <AnimeInfoDialog
              open={openInfo}
              data={props.data}
              handleClose={handleClose}
            />
          )}
        </div>
      </Card>
      <Typography align="center" variant="subtitle2" className={classes.title}>
        {data.title}
      </Typography>
    </div>
  );
}
