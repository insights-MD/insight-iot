#include <Wire.h>
#include "MAX30105.h"
#include <Adafruit_MLX90614.h>

MAX30105 particleSensor;
Adafruit_MLX90614 mlx = Adafruit_MLX90614();


//#define debug Serial //Uncomment this line if you're using an Uno or ESP
//#define debug SerialUSB //Uncomment this line if you're using a SAMD21

uint16_t irValue;
uint16_t redValue;

void setup()
{
  debug.begin(9600);
  debug.println("MAX30105 Basic Readings Example");

  // Initialize sensor
  if (particleSensor.begin() == false)
  {
    debug.println("MAX30105 was not found. Please check wiring/power. ");
    while (1);
  }
  if(mlx == false) {
    debug.println("Adafruit_MLX90614 was not found. Please check wiring/power. ");
    while(1);
  }

  particleSensor.setup(); //Configure sensor. Use 6.4mA for LED drive
  mlx.begin();
}

void loop()
{
  if (irValue > 20000) {
    Serial.print(F("red="));
    Serial.print(particleSensor.getRed(), DEC);
    Serial.print(F(", ir="));
    Serial.print(particleSensor.getIR(), DEC);
    Serial.print(F(", SPO2="));
    Serial.print(particleSensor.getSPO2());
    Serial.print(", Temperature=");
    Serial.print(mlx.readObjectTempF());
    Serial.print("*F, HR=");
    Serial.print(particleSensor.getHeartRate());
    Serial.print(" BPM \n");
  }
  else {
   Serial.println("Finger off");
  }
  Serial.println();
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);

  delay(500);
}
