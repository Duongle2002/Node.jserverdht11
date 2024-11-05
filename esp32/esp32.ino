#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>  // Thêm thư viện ArduinoJson để phân tích JSON

#define DHTPIN 13        // Chân kết nối DHT11
#define DHTTYPE DHT11     // Loại cảm biến là DHT11

// Chân kết nối các thiết bị
#define DEVICE_1_PIN 15
#define DEVICE_2_PIN 2
#define DEVICE_3_PIN 4

DHT dht(DHTPIN, DHTTYPE);

// Thông tin Wi-Fi
const char* ssid = "VIETTEL_AP_E651A8";
const char* password = "1234567890a";

// URL của server Node.js
String serverURL = "https://node-jserverdht11.onrender.com";

// Ngưỡng cảnh báo
float tempThreshold = 30.0; // Nhiệt độ
float humidityThreshold = 70.0; // Độ ẩm

void setup() {
  Serial.begin(115200);
  
  // Kết nối Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to Wi-Fi!");

  // Khởi động DHT
  dht.begin();

  // Thiết lập chế độ cho các chân thiết bị
  pinMode(DEVICE_1_PIN, OUTPUT);
  pinMode(DEVICE_2_PIN, OUTPUT);
  pinMode(DEVICE_3_PIN, OUTPUT);
}

unsigned long previousMillis = 0;  // Biến lưu thời gian trước đó
const long interval = 1800000;        // Thời gian trì hoãn (30 phút)

void loop() {
  // Lấy thời gian hiện tại
  unsigned long currentMillis = millis();

  // Kiểm tra xem đã đến thời gian cập nhật chưa
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis; // Cập nhật thời gian trước đó

    // Đọc dữ liệu từ DHT11
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    // Kiểm tra giá trị hợp lệ
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print(" °C, Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

    // Gửi dữ liệu đến server
    sendDataToServer(temperature, humidity);

    // Kiểm tra ngưỡng và bật/tắt thiết bị nếu vượt ngưỡng
    if (temperature > tempThreshold || humidity > humidityThreshold) {
      Serial.println("Warning: Temperature or Humidity threshold exceeded!");
      // Có thể thêm code gửi thông báo tại đây
    }
  }

  // Nhận lệnh từ server để điều khiển thiết bị
  controlDevices();
}
void sendDataToServer(float temperature, float humidity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String postData = "temperature=" + String(temperature) + "&humidity=" + String(humidity);

    http.begin(serverURL + "/updateData");  // URL server nhận dữ liệu
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    int httpResponseCode = http.POST(postData);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.print("Error sending data: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Wi-Fi not connected");
  }
}

void controlDevices() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL + "/getDeviceStatus");  // URL server cung cấp trạng thái thiết bị
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Device control response: " + response);

      // Sử dụng ArduinoJson để phân tích phản hồi JSON
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, response);

      if (!error) {
        // Kiểm tra và bật/tắt thiết bị dựa vào trạng thái từ server
        if (doc["DEVICE1"] == "ON") digitalWrite(DEVICE_1_PIN, HIGH);
        else digitalWrite(DEVICE_1_PIN, LOW);

        if (doc["DEVICE2"] == "ON") digitalWrite(DEVICE_2_PIN, HIGH);
        else digitalWrite(DEVICE_2_PIN, LOW);

        if (doc["DEVICE3"] == "ON") digitalWrite(DEVICE_3_PIN, HIGH);
        else digitalWrite(DEVICE_3_PIN, LOW);
      } else {
        Serial.println("Failed to parse JSON response");
      }
    } else {
      Serial.print("Error getting device status: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Wi-Fi not connected");
  }
}
