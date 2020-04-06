import React, {useState} from 'react';
import { makeStyles} from '@material-ui/core/styles';
import { Typography, LinearProgress, Button, Card, CardMedia, CardContent, CardActionArea, CardActions, IconButton } from '@material-ui/core';
import {QueuePlayNext} from '@material-ui/icons';
import {EditLibEntry} from '../../db/linvodb/LinvodbHelper';
// import ContentLoader from 'react-content-loader';
import EditEntryDialog from '../EditEntryDialog';
import ContentLoader from 'react-content-loader';
import Img from 'react-image';
import { useSnackbar } from 'notistack';


const useStyles = makeStyles({
    image: {
        height: 'auto',
        width: '100%',
        margin: 0,
    },
})


export default function CarouselItem(props){
    const[progress, setProgress] = useState(props.data.progress);
    const[open, setOpen] = useState(false);

    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

    async function handleNextClick(){
        var mEntry = props.data;
        mEntry.progress = progress + 1;
        await EditLibEntry(mEntry);
        setProgress(progress + 1);
        enqueueSnackbar("Updated " + mEntry.title, {variant: "success"})
        console.log("TYPE: " + typeof progress)
    }

    const MyLoader = () => (
        <ContentLoader 
        // height={350}
        // width={130}
        backgroundColor="#7d7d7d"
        foregroundColor="#cecccc"
        style={{ width: '100%', height: '250px' }}
        >
            {/* <rect x="95" y="140" rx="0" ry="0" width="0" height="0" /> 
            <rect x="99" y="115" rx="0" ry="0" width="0" height="0" />  */}
            <rect x="0" y="0" rx="0" ry="0" width="400" height="400" />
        </ContentLoader>
      )

    
    function handleEditButton(){
        setOpen(true);
    }

    function handleClose(){
        setOpen(false);
    }
    
    return(
        <div>
            <Card variant="outlined">
                <CardActionArea>
                    <CardMedia>
                        {/* <img src={props.data.posterUrl} alt={props.data.title} className={classes.image} title={props.data.title} /> */}
                        <Img loader={<MyLoader/>} src={props.data.posterUrl} alt={props.data.title} className={classes.image} />
                    </CardMedia>
                    <CardContent>
                        <Typography noWrap={true}>{props.data.title}</Typography>
                        <Typography>{props.data.progress} / {props.data.total}</Typography>
                        <LinearProgress variant="determinate" value={progress/props.data.total * 100} ></LinearProgress>
                    </CardContent>
                </CardActionArea>
                <CardActions style={{padding: '2px 8px'}}>
                    <IconButton onClick={handleNextClick}><QueuePlayNext/></IconButton>
                    <Button onClick={handleEditButton}>Edit</Button>
                </CardActions>
            </Card>

            {open && <EditEntryDialog open={open} data={props.data} handleClose={handleClose} />}
            
        </div>
        
    )
}