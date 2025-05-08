//laver variabler som skal bruges i programmet
// morsecode: her gemmer morese-tegnene
let morseCode = "";
//bruges til at lave forbindelse til MQTT netværket
let mqttClient;
// bruges til at lave inputfelt, knap og resultatvisning til dekryptering
let decryptInput, decryptButton, decryptedResultP;


// preload henter billeder inden setup() starter
function preload() {  
  // img indholder billedet fra assets
  img = loadImage('./assets/backgr.jpeg')
}


// setup() kører én gang, når programmet starter
// det er startfunktoin i p5.js
function setup() {
  // starter canvas på hele skærmen
  createCanvas(windowWidth, windowHeight);
  // sætter tekststørrelse til 16 pixler
  textSize(16);
  
  
  
  
  //opret forbindelse til en gratis MQTT-testserver via Websocket-protokol
  mqttClient = mqtt.connect("wss://test.mosquitto.org:8081");
  // når det er forbundet, vise tekst i konsole
  mqttClient.on("connect", () => {
    console.log("Spiller 2 forbundet!");
  
  });
  
  // laver en knap for prik . 
  // der tilføjer . til morseCode når brugeren trykker på knappen
  dotButton = createButton('· (Prik)');
  dotButton.position(20, 350);
  dotButton.mousePressed(() => morseCode += '·');
  
  // laver en knap for mellemrum 
  // der tilføjer mellemrum til morseCode når brugeren trykker på knappen
   rumButton = createButton('  (mellemrum)');
  rumButton.position(520, 350);
 rumButton.mousePressed(() => morseCode += ' ');

 // laver en knap for bindesteg - 
  // der tilføjer - til morseCode når brugeren trykker på knappen 
  dashButton = createButton('− (Bindestreg)');
  dashButton.position(200, 350);
  dashButton.mousePressed(() => morseCode += '−');


  
  // en knap til at slette den sidste karakter i morseCode
  deleteButton = createButton('Slet sidste');
  deleteButton.position(200, 450);
  // når knappen trykkes, kaldes deleteLastCharacter-funktionen
  deleteButton.mousePressed(deleteLastCharacter);
  
  // en knap til at sende morseCode til MQTT-serveren
  sendButton = createButton('Send Morse');
  sendButton.position(530, 450);
  sendButton.mousePressed(sendMorse);
  
// lave en boksen i HTML-elementet med id "morseDisplay"til at vise morseCode 
  createDiv('Din Morse-kode:').position(20, 550).id('morseDisplay');
  
  
  
    // lave en inputfelt og en knap til at skrive dekrypteret tekst med casecar-13
  decryptInput = createInput('');
  decryptInput.position(width/4, 150);
  decryptInput.size(200);
  
  decryptButton = createButton('Dekryptér (Caesar-13)');
  decryptButton.position(width/2, 150);
  // når knappet trykkes, kaldes decryptText-funktionen
  decryptButton.mousePressed(decryptText);

  // laver et ny tekstfelt på side (en paragraf <p>)), som starter med tom tekst ''
  // gemmer det i variablen decryptedP, som kan ændre teksten senere
  decryptedP = createP('');
  // flytter det tesktfelt hen til x=20, y=200 på skærmen
  decryptedP.position(20, 200);
  // dette felt viser den dekrypterede tekst, når brugeren trykker på knappen
  
  
  
}

// lave en funktion som bruges til at slette den sidste karakter
function deleteLastCharacter() {
  // hvis der er mindst en karakter i morseCode
  if (morseCode.length > 0) {
    // fjerne den sidste karakter
    morseCode = morseCode.substring(0, morseCode.length - 1);
  }
}

// lave en funktion som bruges til at sende morseCode til MQTT-serveren
function sendMorse() {
  if (morseCode.length > 0) {
    //send morseCode til kanaplen "morse/svar" på MQTT-serveren
    // og spiller 1 eventyr kan få det mordeCode
    mqttClient.publish("morse/svar", morseCode);
    // viser en besked i HTML-elementet med id "morseDisplay"
    select('#morseDisplay').html(`Morse sendt: ${morseCode}`);
    // nulstiller morseCode til en tom streng
    morseCode = "";
  }
}





function draw() {
  // tegner baggrunden med billedet img og sætter det til at fylde hele vinduet
  background(img,windowWidth,windowHeight);
  // sætter tekststørrelse til 30 pixler
  textSize(30);
  // viser titel
  text("SPILLER 2: Morse-modtager", 20, 30);
  // viser den aktuelle morseCode på skærmen
  text("morse kode: " + morseCode, 80, 320);
  
}

// funktion til når brugeren trykker på knappen "Dekryptér"
function decryptText() {
  // Henter den krypterede tekst fra inputfeltet, som brugeren har indtastet
 //og dekrypterer den ved hjælp af Caesar-algoritmen
  const encrypted = decryptInput.value();
  // bruger en fast forskydning på 13 tegn (caesar-13 dekryptering)
  const shift = 13;
  // klader funktion caesarDecrypt() med den krypterede tekst og forskydning 13
  const decrypted = caesarDecrypt(encrypted, shift);
  // viser den dekrypterede tekst i HTML-elementet decryptedP
  // og brugern kan læse den dekrypterede tekst
  decryptedP.html("Dekrypteret gåder: " + decrypted);
}

// Caesar-dekrypteringsfunktion
function caesarDecrypt(text, shift) {
  // først deler teksten op i bogstaver med .spilt('')
  return text.split('').map(char => {
    // kigger på ASII-koden for hvert bogstav
    //bruge til at finde nummeret ASCII-kode for det bogstav
    const code = char.charCodeAt(0);

    // Hvis tegnet er sen stor bogstav (A-Z)
    if (code >= 65 && code <= 90) { 
      // minus 65 for at få det til at starte fra 0
      // -shift, beregner den dekrypterede bogstav ved at trække forskydningen fra
      // også tilføje 26 for at sikre, at det ikke bliver negativt
      // og derefter tage modulus 26 for at holde det inden for A-Z i alfabetet
      // plus 65 for at få det tilbage til det rigtige ASCII-område
      // String.fromCharCode: lave det tal om til en ny bogstav
      return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
      // hvis det er lille bogstav (a-z)
    } else if (code >= 97 && code <= 122) { 
      // samme idé men bruger 97 i stedet for 65 for a er 97 i ASCII
      return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    }
    // Hvis tegnet ikke er et bogstav (f.eks. mellemrum eller symboler)
    // så returnere det uændret
    return char; 
    //samles alle bogstaverne i en ny tekststreng
  }).join('');
}