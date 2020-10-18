const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const fetch = require('node-fetch');
// const port = new SerialPort('/dev/ttyACM0', { baudRate: 115200 });
const port = new SerialPort('COM3', { baudRate: 115200 });
const parser = new Readline(); // make a new parser to read ASCII lines
port.pipe(parser); // pipe the serial stream to the parser



// To see if the serial port is open
SerialPort.list().then((value)=>{
  console.log(value);
})

let i = 0;
let storedData = [];

const LIMIT = 30;
#include <Wire.h>
#include <Adafruit_MLX90614.h>

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

void setup() {
  Serial.begin(9600);

  Serial.println("Adafruit MLX90614 test");  

  mlx.begin();  
}

void loop() {
  Serial.print("Ambient = "); Serial.print(mlx.readAmbientTempC()); 
  Serial.print("*C\tObject = "); Serial.print(mlx.readObjectTempC()); Serial.println("*C");
  Serial.print("Ambient = "); Serial.print(mlx.readAmbientTempF()); 
  Serial.print("*F\tObject = "); Serial.print(mlx.readObjectTempF()); Serial.println("*F");

  Serial.println();
  delay(500);
}
// Function receives serial data and delegate to each function
parser.on('data', (input)=>{
    // Trims all spaces from the beginning and end
    const data = input.trim();
    // Checks when the sensor is going to start
    if(data == 'Attach sensor to finger with rubber band. Press any key to start conversion') {
      port.write('a');
      return;
    }
    // checks if the limit is reached for each entry. If it is, call endpoint and empty data json
    if(i === LIMIT) {
      // Insert endpoint calling here. prob make this async but im lazy
      console.log(storedData);
      sendData(storedData);
      storedData = [];
      i = 0;
    } else {
      // Checks if the user has their hands put in the sensor, and if it is, it will parse and increment counter
      if (data != 'Finger off') {
        console.log(`${i}: ${data} \n`);
        addData(i, parseSerialData(input));
        i++;
      }
    }
});
// Database Endpoint
const URL = 'https://us-central1-gene-pool-hack-the-u.cloudfunctions.net/upload_biometrics';
// Functions compiles the data and send it to the database
function sendData(data) {
  // Creates a new JObject to follow protocol
  const body = {
    "userId": "test_id",
    "data": data
  };
  // Post request in to the link
  fetch(URL, { method: 'POST',headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
    .then((res)=>{
      // Returns result
      console.log(res);
  });
}

function addData(idx, input) {
  storedData[idx] = input;
}

// Function splits the serial input received
function parseSerialData(input) {
  const dataSplit = input.split(', ');
  const dataKey = dataSplit.map((val,idx)=> val.split('='));
  
  //Parse Temperature
  const temp = dataKey[3][1];
  const tempSplit = temp.split('*');
  dataKey[3][1] = tempSplit;
  dataKey[3][0] = 'temperature';
  //Remove BPM
  const heartrate = dataKey[4][1];
  dataKey[4][1] = heartrate.slice(0, heartrate.length - 5);

  let data = {};
  dataKey.forEach(element => {
    data[element[0]] = element[1];
  });
  return data;
}
