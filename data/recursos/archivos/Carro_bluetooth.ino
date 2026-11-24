///////////////////Declaracion de Variables////////////////////
int MA1=8;  //Pin A1 Driver
int MA2=9;  //Pin A2 Driver
int MB1=10; //Pin B1 Driver
int MB2=11; //Pin B2 Driver
int Faros=13; //Variable de Faros bluetooth
int Frenos=7; //Variable de Frenos Bluetooth
int Claxon=6; //Variable de Claxon Bluetooth
char valor;   //Variable que se recibe del bluetooth

///////////////Configuracion inicial del Arduino//////////////////
void setup() {
  // put your setup code here, to run once:
Serial.begin(9600);         //Inicio de la comunicacion Serial del Arduino


//Declaracion de pines de Entradas y Salidas del arduino
pinMode(MA1, OUTPUT);       
pinMode(MA2,OUTPUT);
pinMode(MB1,OUTPUT);
pinMode(MB2,OUTPUT);
pinMode(Faros,OUTPUT);
pinMode(Frenos,OUTPUT);
pinMode(Claxon,OUTPUT);
}

////////////////////////Inicio del ciclo del programa////////////////////
void loop() {

  if(Serial.available()){            //Espera a que se reciba un valor del bluetooth
  valor=Serial.read();               //Guarda el Valor recibido en la variable "Valor"
  Serial.println(valor);             //Imprime en el monitor Serie "Valor"
  }
if(valor=='S'){                      // Si "Valor" es 'S' Ejecuta la funcion ALTO
  alto();
}
else if(valor=='F'){                // Si "Valor" es 'S' Ejecuta la funcion FRENTE
  frente();
}
else if(valor=='B'){                // Si "Valor" es 'S' Ejecuta la funcion ATRAS
  atras();
}
else if(valor=='L'){                // Si "Valor" es 'S' Ejecuta la funcion IZQUIERDA
  izquierda();
}
    else if(valor=='R'){            // Si "Valor" es 'S' Ejecuta la funcion DERECHA
      derecha();
}
if (valor=='w'){
  digitalWrite(Faros,LOW);          // Si "Valor" es 'S' APAGA FAROS
}
if (valor=='W'){                    // Si "Valor" es 'S' ENCIENDE FAROS
  digitalWrite(Faros,HIGH);
}
if (valor=='u'){                    // Si "Valor" es 'S' ENCIENDE FRENOS
  digitalWrite(Frenos,LOW);
}
if (valor=='U'){                    // Si "Valor" es 'S' APAGA FRENOS
  digitalWrite(Frenos,HIGH);
  
}if (valor=='v'){                   // Si "Valor" es 'S' APAGA CLAXON
    digitalWrite(Claxon,LOW);
}
if (valor=='V'){                    // Si "Valor" es 'S' ENCIENDE CLAXON
  digitalWrite(Claxon,HIGH);
}
delay(10);                          //Retraso de 10 milisegundos
}

void frente(){                    //MOVER CARRO HACIA ENFRENTE
  digitalWrite(MA1,HIGH);
  digitalWrite(MA2,LOW);
  digitalWrite(MB1,HIGH);
  digitalWrite(MB2,LOW);

}

void atras(){                   //MOVER CARRO HACIA ATRAS
  digitalWrite(MA1,LOW);
  digitalWrite(MA2,HIGH);
  digitalWrite(MB1,LOW);
  digitalWrite(MB2,HIGH);
 
}
void derecha(){                 //MOVER CARRO HACIA DERECHA
  digitalWrite(MA1,HIGH);
  digitalWrite(MA2,LOW);
  digitalWrite(MB1,LOW);
  digitalWrite(MB2,HIGH);
  
}
void izquierda(){              //MOVER CARRO HACIA IZQUIERDA
  digitalWrite(MA1,LOW);
  digitalWrite(MA2,HIGH);
  digitalWrite(MB1,HIGH);
  digitalWrite(MB2,LOW);
  
}
void alto(){                    //DETENER CARRO
  digitalWrite(MA1,LOW);
  digitalWrite(MA2,LOW);
  digitalWrite(MB1,LOW);
  digitalWrite(MB2,LOW);
  
}
