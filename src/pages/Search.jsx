import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  InputBase,
  Grid,
  CircularProgress,
  Fade,
} from "@material-ui/core";
import { fade, makeStyles } from "@material-ui/core/styles";
import { Search } from "@material-ui/icons";
import SearchItem from "../components/SearchItem";
import { KitsuSearch } from "../apis/kitsu/kitsu-helper";
import useDebounce from "hooks/useDebounce";

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
}));

export default function SearchPage() {
  const [isLoading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const classes = useStyles();

  async function handleInput(e) {
    setSearchTerm(e.target.value);
  }

  useEffect(
    () => {
      // Make sure we have a value (user has entered something in input)
      if (debouncedSearchTerm) {
        // Set isSearching state
        setLoading(true);
        // Fire off our API call
        KitsuSearch(debouncedSearchTerm, {})
          .then((result) => {
            setLoading(false);
            setResults(result);
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        setResults([]);
      }
    },
    // This is the useEffect input array
    // Our useEffect function will only execute if this value changes ...
    // ... and thanks to our hook it will only change if the original ...
    // value (searchTerm) hasn't changed for more than 500ms.
    [debouncedSearchTerm]
  );

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
        {isLoading ? (
          <Grid container justify="center" style={{ marginTop: "20em" }}>
            <CircularProgress size="4rem"></CircularProgress>
          </Grid>
        ) : (
          <Fade in={!isLoading} timeout={500}>
            <Grid container spacing={1}>
              {results.map((element) => (
                <Grid item lg={2} md={3} key={element.kitsuId}>
                  <SearchItem data={element}></SearchItem>
                </Grid>
              ))}
            </Grid>
          </Fade>
        )}
      </div>
    </div>
  );
}
