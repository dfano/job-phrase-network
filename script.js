function processData(data) {
    let nodes = [];
    let links = [];

    // Add the job title as the central node
    nodes.push({
        id: data.job.title,
        marker: {
            radius: 20,
            fillColor: '#0000ff'  // Blue color for the job title
        },
        dataLabels: {
            enabled: true
        }
    });

    data.job.keyPhrases.forEach(phrase => {
        nodes.push({
            id: phrase.phrase,
            marker: {
                radius: 10,
                fillColor: phrase.priority === 'HIGH' ? '#ff0000' : 
                           phrase.priority === 'MEDIUM' ? '#ffa500' : '#00ff00'
            },
            dataLabels: {
                enabled: true
            }
        });

        // Link the key phrase to the job title
        links.push([data.job.title, phrase.phrase]);

        phrase.keywords.forEach(keyword => {
            nodes.push({
                id: keyword.word,
                marker: {
                    radius: keyword.score / 2
                }
            });
            links.push([phrase.phrase, keyword.word]);
        });
    });

    return { nodes, links };
}

function createChart(data) {
    const { nodes, links } = processData(data);

    console.log('Nodes:', nodes);
    console.log('Links:', links);

    const chart = Highcharts.chart('container', {
        chart: {
            type: 'networkgraph',
            plotBorderWidth: 1,
            zoomType: 'xy'
        },
        title: {
            text: 'Job Skills Network'
        },
        plotOptions: {
            networkgraph: {
                keys: ['from', 'to'],
                layoutAlgorithm: {
                    enableSimulation: true,
                    friction: -0.9
                }
            },
            series: {
                point: {
                    events: {
                        click: function() {
                            toggleHighlight(this);
                        }
                    }
                },
                marker: {
                    states: {
                        select: {
                            lineWidth: 3
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true,
            title: {
                text: 'Priority Levels'
            },
            align: 'right',
            verticalAlign: 'middle',
            layout: 'vertical',
            itemStyle: {
                fontWeight: 'normal'
            }
        },
        xAxis: {
            visible: false,
            minRange: 1
        },
        yAxis: {
            visible: false,
            minRange: 1
        },
        tooltip: {
            formatter: function () {
                return this.point.id;
            }
        },
        series: [{
            dataLabels: {
                enabled: true,
                linkFormat: ''
            },
            data: links,
            nodes: nodes,
            name: 'Job Skills',
            draggable: true,
            cursor: 'pointer'
        }, {
            name: 'High Priority',
            color: '#ff0000',
            marker: {
                symbol: 'circle'
            },
            dataLabels: {
                enabled: false
            },
            data: []
        }, {
            name: 'Medium Priority',
            color: '#ffa500',
            marker: {
                symbol: 'circle'
            },
            dataLabels: {
                enabled: false
            },
            data: []
        }, {
            name: 'Low Priority',
            color: '#00ff00',
            marker: {
                symbol: 'circle'
            },
            dataLabels: {
                enabled: false
            },
            data: []
        }, {
            name: 'Job Title',
            color: '#0000ff',
            marker: {
                symbol: 'circle'
            },
            dataLabels: {
                enabled: false
            },
            data: []
        }]
    });

    function toggleHighlight(point) {
        if (point.selected) {
            point.select(false);
            resetConnectedPoints(point);
        } else {
            chart.series[0].points.forEach(p => {
                if (p.selected) {
                    p.select(false);
                    resetConnectedPoints(p);
                }
            });
            point.select(true);
            highlightConnectedPoints(point);
        }
    }

    function highlightConnectedPoints(point) {
        chart.series[0].data.forEach(link => {
            if (link.from === point.id || link.to === point.id) {
                link.setState('select');
                let connectedPoint = link.from === point.id ? link.toNode : link.fromNode;
                connectedPoint.setState('select');
            }
        });
    }

    function resetConnectedPoints(point) {
        chart.series[0].data.forEach(link => {
            if (link.from === point.id || link.to === point.id) {
                link.setState('');
                let connectedPoint = link.from === point.id ? link.toNode : link.fromNode;
                connectedPoint.setState('');
            }
        });
    }
}

// Fetch the data from data.json and create the chart
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        console.log('Fetched data:', data);
        createChart(data);
    })
    .catch(error => {
        console.error('Error loading the data:', error);
        document.getElementById('error').textContent = 'Error loading data: ' + error.message;
    });