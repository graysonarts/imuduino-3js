/**  ..... FreeIMU library ....
 * Example program for using the FreeIMU connected to an Arduino Leonardo.
 * The program reads sensor data from the FreeIMU, computes the yaw, pitch
 * and roll using the FreeIMU library sensor fusion and use them to move the
 * mouse cursor. The mouse is emulated by the Arduino Leonardo using the Mouse
 * library.
 * 
 * @author Fabio Varesano - fvaresano@yahoo.it
*/

//   ..... Adafruit nRF8001 libary ....
/*********************************************************************
This is an example for our nRF8001 Bluetooth Low Energy Breakout

  Pick one up today in the adafruit shop!
  ------> http://www.adafruit.com/products/1697

Adafruit invests time and resources providing this open source code, 
please support Adafruit and open-source hardware by purchasing 
products from Adafruit!

Written by Kevin Townsend/KTOWN  for Adafruit Industries.
MIT license, check LICENSE for more information
All text above, and the splash screen below must be included in any redistribution
*********************************************************************/

#include <HMC58X3.h>
#include <MS561101BA.h>
#include <I2Cdev.h>
#include <MPU60X0.h>
#include <EEPROM.h>

//#define DEBUG
#include "DebugUtils.h"
#include "IMUduino.h"
#include <Wire.h>
#include <SPI.h>

// Adafruit nRF8001 Library
#include "Adafruit_BLE_UART.h"

// Connect CLK/MISO/MOSI to hardware SPI
// e.g. On UNO & compatible: CLK = 13, MISO = 12, MOSI = 11
//      On Leo & compatible: CLK = 15, MISO = 14, MOSI = 16
#define ADAFRUITBLE_REQ 10
#define ADAFRUITBLE_RDY 7     // This should be an interrupt pin, on Uno thats #2 or #3
#define ADAFRUITBLE_RST 9
typedef enum {
  POSITION = 'P',
  ATMOSPHERE = 'A'
} packet_type_enum;
#define POSITION_START 0
#define POSITION_LENGTH 9
#define ATMO_START 9
#define ATMO_LENGTH 2

Adafruit_BLE_UART BTLEserial = Adafruit_BLE_UART(ADAFRUITBLE_REQ, ADAFRUITBLE_RDY, ADAFRUITBLE_RST);

aci_evt_opcode_t laststatus = ACI_EVT_DISCONNECTED;
aci_evt_opcode_t status = laststatus;

int raw_values[11];
float val[9];

int i = 0;
char sendbuffersize;
byte sendbuffer[20];
byte crc = 0;

// Set the FreeIMU object
IMUduino my3IMU = IMUduino();


void setup() {
  Wire.begin();
  Serial.begin(19200);
    
  delay(500);
  my3IMU.init(true);
  BTLEserial.begin();
}


void loop() {
  
  btleLoop();
  if (status == ACI_EVT_CONNECTED) {
    
    my3IMU.getRawValues(raw_values);
    
    // Our btleWrite() method handles spliting chars into 20-byte chunks
    btleWriteRawValues();
    delay(150);
  }
}

/**************************************************************************/
/*!
    Constantly checks for new events on the nRF8001
*/
/**************************************************************************/

void btleLoop() {
  // Tell the nRF8001 to do whatever it should be working on.
  BTLEserial.pollACI();

  // Ask what is our current status
  status = BTLEserial.getState();
  // If the status changed....
  if (status != laststatus) {
    // print it out!
    if (status == ACI_EVT_DEVICE_STARTED) {
        // Advertising Started
    }
    if (status == ACI_EVT_CONNECTED) {
      // connected

    }
    if (status == ACI_EVT_DISCONNECTED) {
      // disconnected

    }
    // OK set the last status change to this one
    laststatus = status;
  }

  if (status == ACI_EVT_CONNECTED) {
    // Lets see if there's any data for us!
    // OK while we still have something to read, get a character and print it out
    while (BTLEserial.available()) {
      char c = BTLEserial.read();
      // If we need to do something with it, nows the time
    }
  }
}

void btleWriteRawValues() {
  // We need to convert the line to bytes, no more than 20 at this time
    writePacket(POSITION, &(raw_values[POSITION_START]), POSITION_LENGTH);
    btleLoop();
    writePacket(ATMOSPHERE, &(raw_values[ATMO_START]), ATMO_LENGTH);
}

void writePacket(byte packet_type, int* data, byte len) {
  crc = 0;
  sendbuffer[0] = packet_type;
  for(i = 0; i< len; i++) {
    crc ^= sendbuffer[i*2+1] = lowByte(data[i]);
    crc ^= sendbuffer[i*2+2] = highByte(data[i]);
  }
  sendbuffer[i*2+1] = crc;
  BTLEserial.write(sendbuffer, i*2+2);
}
