#include <Servo.h>

Servo servo1;
Servo servo2;

int joystickX = A0;  // Pin del eje X del joystick
int joystickY = A1;  // Pin del eje Y del joystick
int servo1Pin = 9;   // Pin del servo 1
int servo2Pin = 10;  // Pin del servo 2

void setup() {
  servo1.attach(servo1Pin);  // Asignar el pin al servo 1
  servo2.attach(servo2Pin);  // Asignar el pin al servo 2
  servo1.write(90);  // Posición inicial del servo 1
  servo2.write(90);  // Posición inicial del servo 2
}

void loop() {
  int xValue = analogRead(joystickX);  // Leer el valor del eje X
  int yValue = analogRead(joystickY);  // Leer el valor del eje Y

  // Mapear los valores del joystick a los rangos del servo (0-180 grados)
  int servo1Angle = map(xValue, 0, 1023, 0, 180);
  int servo2Angle = map(yValue, 0, 1023, 0, 180);

  servo1.write(servo1Angle);  // Mover el servo 1
  servo2.write(servo2Angle);  // Mover el servo 2

  delay(15);  // Pequeña pausa para evitar movimientos bruscos
}
