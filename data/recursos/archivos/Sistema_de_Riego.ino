int sensorPin = A1;
int relayPin = 8;
int umbralSeco = 700; // Ajustado para planta con 500 ml

void setup() {
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);
  Serial.begin(9600);
}

void loop() {
  int humedad = analogRead(sensorPin);
  Serial.print("Humedad actual: ");
  Serial.println(humedad);

  if (humedad > umbralSeco) {
    digitalWrite(relayPin, HIGH); // Suelo seco → activar riego
    Serial.println("Estado: Suelo seco, activando riego");
  } else {
    digitalWrite(relayPin, LOW); // Suelo húmedo → no regar
    Serial.println("Estado: Suelo húmedo, riego apagado");
  }

  delay(1000);
}