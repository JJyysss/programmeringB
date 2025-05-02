let morseCode = "";
let mqttClient;
let decryptInput, decryptButton, decryptedResultP;



function preload() {  
  img = loadImage('./assets/backgr.jpeg')
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(16);
  
  
  
  
  // MQTT-forbindelse
  mqttClient = mqtt.connect("wss://test.mosquitto.org:8081");
  
  mqttClient.on("connect", () => {
    console.log("Spiller 2 forbundet!");
    mqttClient.subscribe("morse/spil");
  });
  
  mqttClient.on("message", (topic, message) => {
    morseCode = message.toString();
    console.log("Modtaget:", morseCode);
  });
  
  
  dotButton = createButton('· (Prik)');
  dotButton.position(20, 350);
  dotButton.mousePressed(() => morseCode += '·');
  
  
   rumButton = createButton('  (mellemrum)');
  rumButton.position(520, 350);
 rumButton.mousePressed(() => morseCode += ' ');
  
  dashButton = createButton('− (Bindestreg)');
  dashButton.position(200, 350);
  dashButton.mousePressed(() => morseCode += '−');


  
  // Slet-knapper
  deleteButton = createButton('Slet sidste');
  deleteButton.position(200, 450);
  deleteButton.mousePressed(deleteLastCharacter);
  
  sendButton = createButton('Send Morse');
  sendButton.position(530, 450);
  sendButton.mousePressed(sendMorse);
  

  createDiv('Din Morse-kode:').position(20, 550).id('morseDisplay');
  
  
  
    // Input til dekryptering
  decryptInput = createInput('');
  decryptInput.position(width/4, 150);
  decryptInput.size(200);
  
  decryptButton = createButton('Dekryptér (Caesar-13)');
  decryptButton.position(width/2, 150);
  decryptButton.mousePressed(decryptText);

  decryptedP = createP('');
  decryptedP.position(20, 200);
  
  
  
}

// Slet den sidste karakter
function deleteLastCharacter() {
  if (morseCode.length > 0) {
    morseCode = morseCode.substring(0, morseCode.length - 1);
  }
}


function sendMorse() {
  if (morseCode.length > 0) {
    mqttClient.publish("morse/svar", morseCode);
    select('#morseDisplay').html(`Morse sendt: ${morseCode}`);
    morseCode = "";
  }
}





function draw() {
  background(img,windowWidth,windowHeight);
  textSize(30);
  text("SPILLER 2: Morse-modtager", 20, 30);
  text("morse kode: " + morseCode, 80, 320);
  
}

// Caesar-dekryptering med brugervalg
function decryptText() {
  const encrypted = decryptInput.value();
  const shift = 13;
  const decrypted = caesarDecrypt(encrypted, shift);
  decryptedP.html("Dekrypteret gåder: " + decrypted);
}

function caesarDecrypt(text, shift) {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // A-Z
      return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    } else if (code >= 97 && code <= 122) { // a-z
      return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    }
    return char; // Bevar mellemrum/symboler
  }).join('');
}