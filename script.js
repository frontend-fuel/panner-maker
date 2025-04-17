// ThingSpeak channel configuration
const channelID = '2922864';
const apiKey = 'SNM4Q4ZQ8KHJKUVO';
const updateInterval = 15000; // Update every 15 seconds

// Initialize charts
let temperatureChart, milkLevelChart;
let temperatureData = [];
let milkLevelData = [];

// Chart configuration
const chartConfig = {
    type: 'line',
    options: {
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(37, 99, 235, 0.1)',
                    drawBorder: false
                }
            }
        },
            mode: 'index',
            intersect: false
        },
        hover: {
            mode: 'nearest',
            intersect: true,
            animationDuration: 400
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 10,
                    font: {
                        size: 12
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        },
        elements: {
            point: {
                radius: 4,
                hoverRadius: 6
            },
            line: {
                tension: 0.3
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        },
        transitions: {
            active: {
                animation: {
                    duration: 400
                }
            }
        }
    }
;

// Theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.innerHTML = `<i class="bi bi-${isDark ? 'moon-stars' : 'sun'}"></i>`;
    
    // Update chart colors based on theme
    const textColor = isDark ? '#fff' : '#2c3e50';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    [temperatureChart, milkLevelChart].forEach(chart => {
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.plugins.legend.labels.color = textColor;
        chart.update();
    });
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);
    // Temperature chart initialization
    temperatureChart = new Chart(
        document.getElementById('temperatureChart'),
        {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#2563eb',
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#2563eb',
                    pointBorderWidth: 2,
                    fill: true,
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.1
                }]
            }
        }
    );

    // Milk level chart initialization
    milkLevelChart = new Chart(
        document.getElementById('milkLevelChart'),
        {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    label: 'Milk Level (%)',
                    data: [],
                    borderColor: '#2563eb',
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#2563eb',
                    pointBorderWidth: 2,
                    fill: true,
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.1
                }]
            }
        }
    );

    // Start fetching data
    fetchData();
    setInterval(fetchData, updateInterval);
});

// Fetch data from ThingSpeak
async function fetchData() {
    try {
        const response = await fetch(`https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${apiKey}&results=10`);
        const data = await response.json();
        
        if (data.feeds && data.feeds.length > 0) {
            updateCharts(data.feeds);
            updateCurrentValues(data.feeds[data.feeds.length - 1]);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Update charts with new data
function updateCharts(feeds) {
    const labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
    const temperatures = feeds.map(feed => feed.field1);
    const milkLevels = feeds.map(feed => feed.field2);

    // Update temperature chart
    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = temperatures;
    temperatureChart.update();

    // Update milk level chart
    milkLevelChart.data.labels = labels;
    milkLevelChart.data.datasets[0].data = milkLevels;
    milkLevelChart.update();
}

// Update current values display
function updateCurrentValues(latestFeed) {
    // Update last update time
    const lastUpdate = document.getElementById('lastUpdate');
    const updateTime = new Date(latestFeed.created_at).toLocaleString();
    lastUpdate.textContent = `Last updated: ${updateTime}`;

    // Update temperature display
    const temperature = document.getElementById('temperature');
    temperature.textContent = `${parseFloat(latestFeed.field1).toFixed(1)}°C`;

    // Update milk level display
    const milkLevel = document.getElementById('milkLevel');
    milkLevel.textContent = `${parseFloat(latestFeed.field2).toFixed(1)}%`;

    // Update buzzer status
    const buzzerStatus = document.getElementById('buzzerStatus');
    const buzzerIndicator = document.getElementById('buzzerIndicator');
    const isActive = parseInt(latestFeed.field3) === 1;

    buzzerStatus.textContent = isActive ? 'Active' : 'Inactive';
    buzzerIndicator.innerHTML = isActive 
        ? '<div class="alert alert-danger">Buzzer is ON!</div>'
        : '<div class="alert alert-success">Buzzer is OFF</div>';
}