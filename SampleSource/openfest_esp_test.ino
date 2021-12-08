#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <Adafruit_MPU6050.h>
#include <Wire.h>
#include <max86150.h>

#define I2C_SDA 19
#define I2C_SCL 18


TwoWire I2C6050 = TwoWire(0);
Adafruit_MPU6050 mpu;
MAX86150 max86150Sensor;
uint16_t ppgunsigned16;

#include <driver/adc.h>
#define EKG_BUFFER_MAX 1000

uint8_t ekgBuffer [EKG_BUFFER_MAX ] = {0};
uint8_t filterBuffer[EKG_BUFFER_MAX ] = {0};


uint8_t ppgBuffer[EKG_BUFFER_MAX ];
uint8_t accelBuffer[EKG_BUFFER_MAX ];


uint8_t transmitBuffer[EKG_BUFFER_MAX ];

uint32_t bufferPointer = 0;

const char* ssid     = "ladore-lte-demo";
const char* password = "d3m0d3m0";

WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(8080);

int filterValues[14] = {0};

String header;

const char* host     = "192.168.8.103";
WiFiClient client;
bool transmitNow = false;

hw_timer_t * timer = NULL; // our timer
portMUX_TYPE timerMutex = portMUX_INITIALIZER_UNLOCKED; 

static int idx(int i, int n)
{
 return ((i % n) + n) % n;
}

void IRAM_ATTR onTimer() {
  portENTER_CRITICAL_ISR(&timerMutex); // critical code
/*
CH0 - ECG
CH3 - microphone
CH4 - acetone
CH5 - battery monitor
CH6 - impedance
CH7 - temperature
*/
  int adcVal = adc1_get_raw(ADC1_CHANNEL_0); // reads the ADC //was 3 microphone
  uint8_t value = map(adcVal, 0 , 4096, 0, 255);  // converts the value to 0..255 (8bit)
  ekgBuffer [bufferPointer] = value; // stores the value
  
  bufferPointer++;
 
  if (bufferPointer == EKG_BUFFER_MAX ) { // buffer is full
    bufferPointer = 0;
    transmitNow = true;
  }
  portEXIT_CRITICAL_ISR(&timerMutex); // critical end
}



//using namespace websockets;

//WebsocketsServer wsserver;
unsigned long currentTime = millis();
// Previous time
unsigned long previousTime = 0; 
// Define timeout time in milliseconds (example: 2000ms = 2s)
const long timeoutTime = 2000;


void setup() {
pinMode (I2C_SDA,OUTPUT);
pinMode (I2C_SCL,OUTPUT);

Serial.begin(115200);
delay(10);
WiFi.mode(WIFI_STA);
WiFi.begin(ssid, password);

bool status = false;
status = I2C6050.begin(I2C_SDA,I2C_SCL, 10000);
if(!status)
{
  Serial.println("unable to establish i2c");
}

delay(10);

Serial.println("scanning i2c");
delay(10);

for (byte i = 8; i < 120; i++)
{ 
I2C6050.beginTransmission (i);
if (I2C6050.endTransmission () == 0)
{
  Serial.print ("Found address: ");
  Serial.print (i, DEC);
  Serial.print (" (0x");
  Serial.print (i, HEX);
  Serial.print (")");
  delay (1);
} // end of good response
} // end of for loop
delay(10);
Serial.println("scanning i2c end ");
delay(10);

//0x5e 94
//if (max86150Sensor.begin(I2C6050, I2C_SPEED_STANDARD ,0x5e) == false)
if (max86150Sensor.begin(I2C6050, 10000,0x5e) == false)
{
  Serial.println("MAX86150 was not found. Please check wiring/power. ");
}

Serial.println("partid is:" + max86150Sensor.readPartID());
max86150Sensor.setup();

//status = mpu.begin(0x68,&I2C6050,1);
if(!status)
{
  Serial.println("unable to begin communication with mpu");
}

/*
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  Serial.println(mpu.getAccelerometerRange());
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  Serial.println(mpu.getGyroRange());
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  Serial.println(mpu.getFilterBandwidth());
*/
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("x");
  }

  Serial.println("");
  Serial.println("wifi connected");
  Serial.println("ip addr: ");
  Serial.println(WiFi.localIP());

  adc1_config_width(ADC_WIDTH_12Bit);

  adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);

  const int port = 4444;


 webSocket.begin();
 webSocket.onEvent(webSocketEvent);
  
 server.on("/", handle_OnConnect);
 server.onNotFound(handle_NotFound);

 server.begin();
 Serial.println("HTTP server started");
 
 Serial.print("Is server live? ");
 //Serial.println(server.available());


 timer = timerBegin(0, 80, true); // 80 Prescaler
 timerAttachInterrupt(timer, &onTimer, true); // bind handler
 timerAlarmWrite(timer, 4000, true);//4000 is 250/second
 timerAlarmEnable(timer);





  
}

void hexdump(const void *mem, uint32_t len, uint8_t cols = 16) {
  const uint8_t* src = (const uint8_t*) mem;
  Serial.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
  for(uint32_t i = 0; i < len; i++) {
    if(i % cols == 0) {
      Serial.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
    }
    Serial.printf("%02X ", *src);
    src++;
  }
  Serial.printf("\n");
}


void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED:
            {
                IPAddress ip = webSocket.remoteIP(num);
                Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
                webSocket.sendTXT(num, "{\"connected\":true}");
            }
            break;
        case WStype_TEXT:
            Serial.printf("[%u] get Text: %s\n", num, payload);
            break;
        case WStype_BIN:
            Serial.printf("[%u] get binary length: %u\n", num, length);
            hexdump(payload, length);
            break;
    case WStype_ERROR:
          Serial.printf("WS_ERROR");
            break;
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
    }

}



String SendHTML(){
  String ptr = "<!DOCTYPE html> <html>\n";
  ptr +="<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">\n";
  ptr +="<title>MED Control</title>\n";
  ptr +="<style>html {background-color:#000000; font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;},canvas { border: 1px solid green;}\n";
  ptr +="body{margin-top: 20px;} h1 {color: #444444;margin: 50px auto 30px;} h3 {color: #444444;margin-bottom: 50px;}\n";
  ptr +="div#ppg {color: #ffffff;margin: 5px auto 5px;font-size: 40px;}";
  ptr +=".button {display: block;width: 80px;background-color: #3498db;border: none;color: white;padding: 13px 30px;text-decoration: none;font-size: 25px;margin: 0px auto 35px;cursor: pointer;border-radius: 4px;}\n";
  ptr +=".button-on {background-color: #3498db;}\n";
  ptr +=".button-on:active {background-color: #2980b9;}\n";
  ptr +=".button-off {background-color: #34495e;}\n";
  ptr +=".button-off:active {background-color: #2c3e50;}\n";
  ptr +="p {font-size: 14px;color: #888;margin-bottom: 10px;}\n";
  ptr +="</style>\n";
  ptr +="</head>\n";
  ptr +="<body>\n";
  ptr +="<canvas id='eeg' width='1000' height='255'></canvas>";
  ptr +="<script>";
  ptr +="var connection = new WebSocket('ws://' + location.hostname + ':8080/', ['arduino']);";
  ptr +="connection.onopen = function () {";
  ptr +="connection.send('Connect ' + new Date());";
  ptr +="};";
  ptr +="connection.onerror = function (error) {";
  ptr +="console.log('WebSocket Error ', error);";
  ptr +="};";
  ptr +="connection.onmessage = function (e) {";
  ptr +="var msg = JSON.parse(e.data);";
  ptr +="console.log(msg.type);";
  ptr +="if(msg.type == \"ppg\") { document.getElementById(\"ppg\").innerHTML = msg.data + '%' ;};";
  ptr +="if(msg.type == \"ecg\") {";
  ptr += "data = msg.data.split(',');";
  ptr += "var canvas = document.getElementById('eeg');";
  ptr += "var ctx = canvas.getContext('2d');";
  ptr += "ctx.fillStyle = 'rgba(0, 0, 0, 1)';";
  ptr += "ctx.fillRect(0, 0, 1000, 255);";
  ptr += "ctx.strokeStyle = 'rgba(0, 255, 0, 1)';";
  ptr += "ctx.beginPath();"; 
 
  ptr += "var davg = 0; for(i=0;i<data.length;i++) { davg += data[i]; if (data[i] > 255) { data[i] = 255}; }";
  ptr += "davg /= (data.length); for(i=0;i<data.length ;i++) { data[i] -= 75; data[i] *= 3.5;};";
  
  ptr += "for(i=0;i<data.length - 1;i++) {";
  ptr += "ctx.lineTo(i,data[i]);";
  ptr += "ctx.stroke();";

  ptr += "};";
  ptr +="}};";//closing if
  ptr +="connection.onclose = function () {";
  ptr +="  console.log('WebSocket connection closed');";
  ptr +="};";
  ptr +="</script>";
  ptr +="<h1>ECG</h1>\n";
  ptr +="<div id='ppg'></div>";
  ptr +="\n";
  
  ptr +="</body>\n";
  ptr +="</html>\n";
  return ptr;
}


void handle_NotFound(){
  server.send(404, "text/plain", "Not found");
}

void handle_OnConnect() {
  Serial.println("handle on connect routine");
  server.send(200, "text/html", SendHTML()); 
}


void loop() {

  server.handleClient();
  webSocket.loop();
  

  if(1 == 1)
  {
  if(max86150Sensor.check()>0)
    {
      ppgunsigned16 = (uint16_t) (max86150Sensor.getFIFORed()>>2);
      //Serial.print("PPG:");
      //Serial.println(ppgunsigned16);
      float percent = ppgunsigned16;
            percent /= 65535.0f;
            percent *= 100.0f;
      Serial.print(percent);
      Serial.println("%");
      String ppgload = "{\"type\":\"ppg\",\"data\":\"";
      char buff[6] = {0};
      snprintf(buff,sizeof(buff),"%02.2f",percent);
      ppgload += buff;
      ppgload +="\"";
      ppgload += "}";
      webSocket.broadcastTXT(ppgload);
    }
  }
    
    if(1 == 2)
    {
      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);
     
      
      Serial.print("Acceleration X: ");
      Serial.print(a.acceleration.x);
      Serial.print(", Y: ");
      Serial.print(a.acceleration.y);
      Serial.print(", Z: ");
      Serial.print(a.acceleration.z);
      Serial.println(" m/s^2");
     
      Serial.print("Rotation X: ");
      Serial.print(g.gyro.x);
      Serial.print(", Y: ");
      Serial.print(g.gyro.y);
      Serial.print(", Z: ");
      Serial.print(g.gyro.z);
      Serial.println(" rad/s");
     
      Serial.print("Temperature: ");
      Serial.print(temp.temperature);
      Serial.println(" degC");
     
      Serial.println("");
    }



    if (transmitNow) { // checks if the buffer is full
    unsigned long currentDuration = millis(); 

    Serial.printf("[tx before filter:%ul]\n",currentDuration);


 
    for(int i = 0; i < EKG_BUFFER_MAX ; i++)
    {
      filterBuffer[i] = 255 - 128 + (ekgBuffer [i] - 
      (
        ekgBuffer [idx(i - 40,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i - 35,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i - 30,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i - 25,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i - 20,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i - 15,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i - 10,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i -  5,EKG_BUFFER_MAX )] 
      + ekgBuffer [i] 
      + ekgBuffer [idx(i +  5,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i + 10,EKG_BUFFER_MAX )]
      + ekgBuffer [idx(i - 15,EKG_BUFFER_MAX )] 
      + ekgBuffer [idx(i + 20,EKG_BUFFER_MAX )]
      + ekgBuffer [idx(i + 25,EKG_BUFFER_MAX )]
      + ekgBuffer [idx(i + 30,EKG_BUFFER_MAX )]
      + ekgBuffer [idx(i + 35,EKG_BUFFER_MAX )]
      + ekgBuffer [idx(i + 40,EKG_BUFFER_MAX )]
      )/17);    
    }

    for(int i = 0; i < EKG_BUFFER_MAX  - 5; i++)
    {
      int avg = 0;
      for(int j = i; j < i + 5; j++)
      {
        avg += filterBuffer[j];
      }
      avg /= 5;
      filterBuffer[i] = avg;
    }
    
    for(int i = EKG_BUFFER_MAX  - 5; i < EKG_BUFFER_MAX ; i++)
    {  
      filterBuffer[i] = 128;
    }
   
    //memcpy(transmitBuffer, filterBuffer, _MAX); // copy buffer into a second buffer

    String payload = "{\"type\":\"ecg\",\"data\":\"";

    for(int i = 0; i < sizeof(filterBuffer); i++)
    {
      payload += filterBuffer[i];
      if(i < EKG_BUFFER_MAX )
        payload += ',';  
    }

    payload += "\"}";

    currentDuration = millis(); 

    Serial.printf("[tx after filter:%ul]\n",currentDuration);

    webSocket.broadcastTXT(payload);
    transmitNow = false;
    currentDuration = millis(); 
    Serial.printf("[tx after broadcast:%ul]\n",currentDuration);
    
  }
}
