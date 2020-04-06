import React, {useState, useEffect} from 'react';
import {Link as Router} from 'react-router-dom';
import {Typography, Grid, Divider, Link, Button, makeStyles, CircularProgress} from '@material-ui/core';
import {GetLibrary} from '../db/linvodb/LinvodbHelper';
import LibraryItem from '../components/LibraryItem';

import InfiniteScroll from 'react-infinite-scroller';

const useStyles = makeStyles(theme => ({
    main: {
        marginLeft: theme.spacing(3),
        marginBottom: theme.spacing(3),
        height: '100%', 
        paddingRight: '15px',
    }
}))

export default function Library (props){

    const classes = useStyles();

    const[library, setLibrary] = useState([]);
    const[isLoading, setLoading] = useState(true);
    const[status, setStatus] = useState("");
    const[hasMore, setHasMore] = useState(true);
    const[count, setCount] = useState(24);
    const[isEmpty, setEmpty] = useState(false);

    const fetchMoreData = () => {
        setCount(count + 24);
        console.log("LIBlen: " + library.length)
        if(count >= library.length){
            setHasMore(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        async function populatePage(){
            let st = props.match.params.status;
            setStatus(st.replace(/^./, st[0].toUpperCase()));
            const lib = await GetLibrary({status: st});
            setLibrary(lib);
            
            
            if(lib.length === 0){
                setEmpty(true);
            }

            if(lib.length <= 24){
                setHasMore(false);
            }
           
            setLoading(false);

        }
        populatePage();
    }, [props.match.params.status])

    const DataDisplay = ({empty}) => empty ?
            (
                <div style={{marginTop: "10em"}}>
                    <Typography align="center" variant="h4" gutterBottom>You haven't watched anything yet.</Typography>
                    <Typography align="center"><Link underline="none" component={Router} to="/search"><Button color="secondary" variant="contained">Search Here</Button></Link></Typography>
                </div>
            )
            :(
                <InfiniteScroll
                    pageStart={count}
                    loadMore={fetchMoreData}
                    hasMore={hasMore}
                    loader={<Grid container justify="center" style={{marginTop: 20}}><CircularProgress disableShrink/></Grid>}
                >
                        <Grid container spacing={1}>
                        {
                            library.slice(0, count).map((element) => (
                                <Grid item lg={2} md={3} key={element.kitsuId}>
                                <LibraryItem data={element}></LibraryItem>
                            </Grid> 
                            ))
                        }
                        </Grid>
                    </InfiniteScroll>
            )
          
    return(
        <div className={classes.main}>
            <Typography style={{marginTop: '10px'}} align="left" variant="h5">{status}</Typography>
            <Divider style={{marginBottom: '5px'}}></Divider>
            {isLoading ? (
                
                <Grid container justify="center" style={{marginTop: '20em'}}><CircularProgress size="5rem" disableShrink /></Grid>
                
            ) : (
                    //<Fade in={!isLoading} timeout={1000}>
                        <DataDisplay empty={isEmpty}></DataDisplay>
                    //</Fade>
                    
                
            )}
            
        </div>
    )
    
}

