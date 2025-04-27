let morseCode = "";
let mqttClient;
let decryptInput, decryptButton, decryptedResultP;



function preload() {  
  img = loadImage('./assets/_.jpeg')
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
  dotButton.position(20, 150);
  dotButton.mousePressed(() => morseCode += '·');
  
  
   rumButton = createButton('  (mellemrum)');
  rumButton.position(520, 150);
 rumButton.mousePressed(() => morseCode += ' ');
  
  dashButton = createButton('− (Bindestreg)');
  dashButton.position(200, 150);
  dashButton.mousePressed(() => morseCode += '−');
  
  sendButton = createButton('Send Morse');
  sendButton.position(830, 150);
  sendButton.mousePressed(sendMorse);
  

  createDiv('Din Morse-kode:').position(20, 200).id('morseDisplay');
  
  
  
    // Input til dekryptering
  decryptInput = createInput('');
  decryptInput.position(width/4, 300);
  decryptInput.size(200);
  
  decryptButton = createButton('Dekryptér (Caesar-13)');
  decryptButton.position(width/2, 300);
  decryptButton.mousePressed(decryptText);

  decryptedResultP = createP('');
  decryptedResultP.position(20, 400);
  
  
  
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
  text("morse kode: " + morseCode, 20, 80);
  
}

// Caesar-dekryptering med brugervalg
function decryptText() {
  const encrypted = decryptInput.value();
  const shift = 13;
  const decrypted = caesarDecrypt(encrypted, shift);
  decryptedResultP.html("Dekrypteret gåder: " + decrypted);
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