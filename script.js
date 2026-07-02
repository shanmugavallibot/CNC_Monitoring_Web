// ================================
// CNC Dashboard JavaScript
// ================================

// -------------------------------
// Overall Performance Gauge
// -------------------------------
function setSpeed(speed) {

    const angle = (speed / 100) * 180;

    const needle = document.querySelector('.needle');
    const speedText = document.querySelector('.speed-value');

    if (needle)
        needle.style.transform = `rotate(${angle}deg)`;

    if (speedText)
        speedText.textContent = speed + "%";
}

// -------------------------------
// Worker Status
// -------------------------------
function updateWorkerStatus(status) {

    const box = document.getElementById("workerStatus");

    if (!box) return;

    if (status === "Present") {
        box.textContent = "Present";
        box.style.background = "green";
    }
    else if (status === "Absent") {
        box.textContent = "Absent";
        box.style.background = "red";
    }
    else {
        box.textContent = "Unknown";
        box.style.background = "gray";
    }

}

// -------------------------------
// Coolant
// -------------------------------
function updateCoolantStatus(level) {

    const box = document.getElementById("coolantStatus");

    if (!box) return;

    if (level === "High") {

        box.textContent = "HIGH";
        box.style.background = "green";

    }

    else if (level === "Medium") {

        box.textContent = "MEDIUM";
        box.style.background = "orange";

    }

    else if (level === "Low") {

        box.textContent = "LOW";
        box.style.background = "red";

    }

    else {

        box.textContent = "UNKNOWN";
        box.style.background = "gray";

    }

}

// -------------------------------
// Emergency
// -------------------------------
function updateEmergencyStatus(status) {

    const card = document.getElementById("emergencyCard");
    const text = document.getElementById("emergencyText");

    if (!card || !text) return;

    if (status === "Tool Breakage") {

        card.classList.remove("normal");
        card.classList.add("emergency");

        text.textContent = "TOOL BREAKAGE";

    }

    else {

        card.classList.remove("emergency");
        card.classList.add("normal");

        text.textContent = "Normal";

    }

}

// -------------------------------
// RPM
// -------------------------------
function updateRPM(rpm) {

    const obj = document.getElementById("rpmValue");

    if(obj)
        obj.innerHTML = rpm;

}

// -------------------------------
// Current
// -------------------------------
function updateCurrent(current) {

    const obj = document.getElementById("currentValue");

    if(obj)
        obj.innerHTML = current + "A";

}

// -------------------------------
// Temperature
// -------------------------------
function updateTemp(temp) {

    const obj = document.getElementById("tempValue");

    if(obj)
        obj.innerHTML = temp + "°C";

}

// -------------------------------
// Default Values
// -------------------------------
setSpeed(75);

updateRPM(1000);

updateCurrent(10);

updateTemp(70);

updateCoolantStatus("High");

updateWorkerStatus("Present");

updateEmergencyStatus("Normal");

// -------------------------------
// Power Chart
// -------------------------------
const powerChart = new Chart(document.getElementById('powerChart'), {

    type: 'line',

    data: {

        labels: ['9 AM','11 AM','1 PM','3 PM','5 PM'],

        datasets: [{

            label: 'Power',

            data: [10,15,22,35,25],

            borderColor: '#22c55e',

            backgroundColor: '#22c55e',

            tension: 0.4

        }]

    },

    options: {

        responsive: true,

        plugins: {

            legend: {

                labels: {

                    color: 'white'

                }

            }

        },

        scales: {

            x: {

                ticks: {

                    color: 'white'

                }

            },

            y: {

                ticks: {

                    color: 'white'

                }

            }

        }

    }

});

// ================================
// MQTT Connection
// ================================

const client = mqtt.connect(

    "wss://vecde6f3.ala.asia-southeast1.emqxsl.com:8084/mqtt",

    {

        username: "CNCModel",

        password: "cnc@32"

    }

);

// -------------------------------
// Connected
// -------------------------------
client.on("connect", () => {

    console.log("Connected to EMQX Cloud");

    client.subscribe("cnc/data");

});

// -------------------------------
// Error
// -------------------------------
client.on("error", (err) => {

    console.log("MQTT Error:", err);

});

// -------------------------------
// Receive Data
// -------------------------------
client.on("message", (topic, message) => {

    console.log(message.toString());

    let data;

    try{

        data = JSON.parse(message.toString());

    }

    catch(e){

        console.log("Invalid JSON");

        return;

    }

    if(data.performance !== undefined)
        setSpeed(data.performance);

    if(data.rpm !== undefined)
        updateRPM(data.rpm);

    if(data.current !== undefined)
        updateCurrent(data.current);

    if(data.temp !== undefined)
        updateTemp(data.temp);

    if(data.coolant !== undefined)
        updateCoolantStatus(data.coolant);

    if(data.worker !== undefined)
        updateWorkerStatus(data.worker);

    if(data.emergency !== undefined)
        updateEmergencyStatus(data.emergency);

    // Update power chart if value received

    if(data.power !== undefined){

        powerChart.data.datasets[0].data.shift();

        powerChart.data.datasets[0].data.push(data.power);

        powerChart.update();

    }

});