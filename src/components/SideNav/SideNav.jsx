import React, { useEffect, useState } from "react"
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
  Collapse,
  CssBaseline,
  Drawer,
  Divider,
  Chip,
} from "@material-ui/core"
import {
  Dashboard,
  Search,
  ViewList,
  Airplay,
  WatchLater,
  PlaylistAddCheck,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@material-ui/icons"
import { makeStyles } from "@material-ui/core/styles"

import anitraklogo from "../../images/anitraklogo.png"
import { Link as Router } from "react-router-dom"
import Sync from "components/Sync"
import { getDatabase } from "db/rxdb"
// import TitleBar from "frameless-titlebar"

const drawerWidth = 250

const useStyles = makeStyles((theme) => ({
  root: {
    // display: 'flex',
    // flexWrap: 'wrap',
  },

  appBar: {
    zIndex: 99,
    position: "sticky",
    width: "100%",
    top: 0,
    left: 0,
  },

  drawer: {
    width: drawerWidth,
    //flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    // top: "auto"
  },
  toolbar: {
    marginTop: theme.spacing(2),
  },
  content: {
    //flexShrink: 1,
    backgroundColor: theme.palette.background.default,
    //paddingRight: theme.spacing(2),
    marginLeft: theme.spacing(30),
  },

  logo: {
    margin: theme.spacing(2, 1, 2, 1),
  },
}))

export default function SideNav(props) {
  const [open, setOpen] = useState(true)
  const [current, setCurrent] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [planned, setPlanned] = useState(0)
  const [selectedIndex, setSelected] = useState(1)

  useEffect(() => {
    let cur,
      comp,
      plan = null
    async function getCount() {
      const db = await getDatabase()

      cur = db.library
        .find({ selector: { status: "current" } })
        .$.subscribe((res) => {
          setCurrent(res.length)
        })
      comp = db.library
        .find({ selector: { status: "completed" } })
        .$.subscribe((res) => {
          setCompleted(res.length)
        })
      plan = db.library
        .find({ selector: { status: "planned" } })
        .$.subscribe((res) => {
          setPlanned(res.length)
        })
    }
    getCount()

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
  })

  function handleClick() {
    setOpen(!open)
  }

  function handleListClick(i) {
    setSelected(i)
  }

  const classes = useStyles()
  return (
    <div className={classes.root}>
      <CssBaseline />
      {/* <div className={classes.appBar}><TitleBar title="AniTrak" iconSrc="/electron/icon.png" ></TitleBar></div> */}
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        ModalProps={{ disablePortal: true }}
        anchor="left"
      >
        <div className={classes.toolbar}></div>
        {/* <Typography gutterBottom variant="h3" align="center">Anitrak</Typography> */}
        <img src={anitraklogo} alt="Anitrak" className={classes.logo} />

        <Divider />
        <List>
          <Link
            color="textPrimary"
            underline="none"
            component={Router}
            to="/"
            onClick={(e) => handleListClick(1)}
          >
            <ListItem selected={selectedIndex === 1} button key="Dashboard">
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
          </Link>

          <ListItem button key="Library" onClick={handleClick}>
            <ListItemIcon>
              <ViewList />
            </ListItemIcon>
            <ListItemText color="inherit" primary="Library" />
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </ListItem>

          <Collapse in={open}>
            <List component="div" disablePadding>
              <Link
                color="textPrimary"
                underline="none"
                component={Router}
                to="/library/current"
                onClick={(e) => handleListClick(11)}
              >
                <ListItem
                  selected={selectedIndex === 11}
                  button
                  style={{ paddingLeft: "2em" }}
                >
                  <ListItemIcon>
                    <Airplay />
                  </ListItemIcon>
                  <ListItemText primary="Current"></ListItemText>
                  <Chip label={current} size="small" color="primary"></Chip>
                </ListItem>
              </Link>
              <Link
                color="textPrimary"
                underline="none"
                component={Router}
                to="/library/completed"
                onClick={(e) => handleListClick(22)}
              >
                <ListItem
                  selected={selectedIndex === 22}
                  button
                  style={{ paddingLeft: "2em" }}
                >
                  <ListItemIcon>
                    <PlaylistAddCheck />
                  </ListItemIcon>
                  <ListItemText primary="Completed"></ListItemText>
                  <Chip label={completed} size="small" color="primary"></Chip>
                </ListItem>
              </Link>
              <Link
                color="textPrimary"
                underline="none"
                component={Router}
                to="/library/planned"
                onClick={(e) => handleListClick(33)}
              >
                <ListItem
                  selected={selectedIndex === 33}
                  button
                  style={{ paddingLeft: "2em" }}
                >
                  <ListItemIcon>
                    <WatchLater />
                  </ListItemIcon>
                  <ListItemText primary="Planned"></ListItemText>
                  <Chip label={planned} size="small" color="primary"></Chip>
                </ListItem>
              </Link>
            </List>
          </Collapse>
          <Link
            color="textPrimary"
            underline="none"
            component={Router}
            to="/search"
            onClick={(e) => handleListClick(5)}
          >
            <ListItem selected={selectedIndex === 5} button key="Search">
              <ListItemIcon>
                <Search />
              </ListItemIcon>
              <ListItemText primary="Search" />
            </ListItem>
          </Link>
        </List>

        <Divider />
        <Sync />
      </Drawer>
      <main className={classes.content}>{props.children}</main>
    </div>
  )
}
