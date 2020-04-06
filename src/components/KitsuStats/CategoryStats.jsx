import React, {useState, useEffect} from 'react';
import { Typography, Grid, Divider } from '@material-ui/core';
import { Doughnut } from 'react-chartjs-2';

import {GetTopGenres} from '../../db/linvodb/LinvodbHelper';

export default function CategoryStats(props){
    const[labels, setLabels] = useState([]);
    const[values, setValues] = useState([]);

    async function getData(){
        var stats = await GetTopGenres();
        setLabels(Object.keys(stats));
        setValues(Object.values(stats));   
    }
    
    useEffect(() => {
        getData();
    }, []);

    const colors = [
        '#FEB700',
        '#FF9300',
        '#BC6EDA',
        '#FFCE56',
        '#4caf50',
        '#00BBED',
        ];
    const data = {
        datasets: [{
            data: values,
            backgroundColor: colors,
                // hoverBackgroundColor: [
                // '#f9a825',
                // '#388e3c',
                // '#0288d1'
                // ],
                borderColor: '#424242',
                //borderWidth: 4,
        }],
    
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: labels,
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
                            <Typography align="left" variant="h4" style={{marginBottom: 5, marginLeft: 20}}>Categories</Typography>
                            <Divider></Divider>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px', color: colors[0]}}>{labels[0]}: {values[0]}%</Typography>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px', color: colors[1]}}>{labels[1]}: {values[1]}%</Typography>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px', color: colors[2]}}>{labels[2]}: {values[2]}%</Typography>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px', color: colors[3]}}>{labels[3]}: {values[3]}%</Typography>
                            <Typography align="left" variant="h5" style={{margin: '10px 20px', color: colors[4]}}>{labels[4]}: {values[4]}%</Typography>
                            {/* <Typography align="left" variant="h5" style={{margin: '10px 20px', color: colors[5]}}>{labels[5]}: {values[5]}%</Typography> */}
                            
                        </Grid>
                    </Grid>
                    
                </div>
        </div>
    )
}