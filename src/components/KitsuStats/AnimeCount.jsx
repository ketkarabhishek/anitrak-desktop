import React, {useState, useEffect} from 'react';
import { Typography, Grid, Divider } from '@material-ui/core';
import { Doughnut } from 'react-chartjs-2';

import {GetLibraryCount} from '../../db/linvodb/LinvodbHelper';

export default function AnimeReact(props){
    const [mdata, setData] = useState([]);

    async function getData(){
        const cur = await GetLibraryCount({status: 'current'});
        const comp = await GetLibraryCount({status: 'completed'});
        const plan = await GetLibraryCount({status: 'planned'});

        setData([cur, comp, plan]);
    }

    useEffect(() => {
        getData();
    }, [])

    const data = {
        datasets: [{
            data: mdata,
            backgroundColor: [
                '#FFCE56',
                '#4caf50',
                '#00BBED'
                ],
                hoverBackgroundColor: [
                '#f9a825',
                '#388e3c',
                '#0288d1'
                ],
                borderColor: '#424242',
                //borderWidth: 4,
        }],
    
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Current',
            'Completed',
            'Planned'
        ]
    };

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
        layout: {
            
        },
        legend: {
            display: false,
            position: 'bottom',
            labels: {
                fontColor: 'rgb(255, 255, 255)',
                fontSize: 14,
            }
        }
    };   
    
    return(
        <div>
            <div style={{margin: 30}}>
                    <Grid container>
                        <Grid item lg={6} md={6}><Doughnut data={data} options={options} width={200} height={300}>fhrhd</Doughnut></Grid>
                        <Grid item lg={6} md={6}>
                            <Typography align="left" variant="h4" style={{marginBottom: 5, marginLeft: 20}}>Anime Count</Typography>
                            <Divider></Divider>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px'}}>Total: {mdata[0] + mdata[1] + mdata[2]}</Typography>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px', color: '#FFCE56'}}>Current: {mdata[0]}</Typography>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px', color: '#4caf50'}}>Completed: {mdata[1]}</Typography>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px', color: '#00BBED'}}>Planned: {mdata[2]}</Typography>
                            {/* <Typography align="left" variant="h5" style={{margin: 20}}>Dropped: 4</Typography> */}
                        </Grid>
                    </Grid>
                    
                </div>
        </div>
    )
}