let morseCode = "";
let mqttClient;
let riddle = "";
let encryptedRiddle = "";
//const jokeApiUrl = "https://riddles-api.vercel.app/random";
      //"";
let correctAnswer = "";
let userAnswer = "";
let answerInput; 
let resultDiv;


let dataModel
let todosDiv


function preload() {  
  img = loadImage('./assets/background.jpeg')
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(16);

  
  
  
  
   todosDiv = select('#todos')
  database.collection('gaade').doc('gaader')
    .onSnapshot( (doc) => {
      console.log('Fik dette fra databasen: ', doc.data() )
    console.log(doc.data())
    
    
  } )
  
   
  
  
  
 // Knap til at hente en ny gåde
  let riddleButton = createButton('Hent gåde')
  riddleButton.position(width/3,height/3)
  
  // mousePressed kalder en anonym funktion - som kalder getRiddle()
  // funkntion navn ()
  // Når der klikkes, kald getRiddle()
  riddleButton.mousePressed( () => getRiddle() ) 
  // en Visningsboks til krypteret gåde
    riddleDiv = createDiv('Hit the button to fetch a new riddle')
  riddleDiv.addClass('riddleDiv')
  riddleDiv.position(width/3,height/4)
  
  
  
  
  
  
  // Krypteret gåde visning
  //let encryptedDiv = createDiv('');
  //encryptedDiv.position(width/3, height/4);
  //encryptedDiv.style('font-family', 'monospace');
  //encryptedDiv.id('encryptedRiddle')
 
  
  
  
 
  
  
  
   // Inputfelt til svar
  answerInput = createInput('');
  answerInput.position(width/3, height/2+80);
  answerInput.size(300);
  
  // Knap til at tjekke om svaret er korrekt
  let checkButton = createButton('Tjek svar');
  checkButton.position(width/3, height/2+130 );
  checkButton.mousePressed(checkAnswer);
  

  // Div til visning af resultatet (korrekt/forkert svar)
  resultDiv = createDiv('');
  resultDiv.position(width/3, height/2+180);
  resultDiv.style('color', 'black');
  resultDiv.style('font-weight', 'bold');

  
  
  
  
  
// Opret MQTT-forbindelse (WebSocket-protokol)
// MQTT – Opret forbindelse til broker (gratis test-server)
  mqttClient = mqtt.connect("wss://test.mosquitto.org:8081"); // Gratis testbroker

  
  // // Når klienten er forbundet
  mqttClient.on("connect", () => {
  console.log("Spiller 1 forbundet!");
  mqttClient.subscribe("morse/svar");
});
  
// Når der modtages en besked
  mqttClient.on("message", (topic, message) => {
  const received = message.toString(); // f.eks. "·−·−"
  console.log("Modtaget:", received);
    

  // Tilføj hver morse-tegn til morseCode-strengen
  for (let char of received) {
    if (char === '·') morseCode += '·';
    else if (char === '−') morseCode += '−';
    else if (char === ' ') morseCode += ' ';
  }

});
  

  
  
}
  
  
  //Funktion til at hente en tilfældig gåde fra Firebase
 async function getRiddle() {
  // Vis loadingtekst
  riddleDiv.html('Henter gåde...');
  try {
    // Hent dokumentet fra Firebase
    const doc = await database.collection('gaade').doc('gaader').get();
    
    // Tjek om dokumentet eksisterer
    if (doc.exists) {
      const data = doc.data();
      
      // Tjek om der er nogle gåder i dokumentet
      if (data.riddles && data.riddles.length > 0) {
        // Vælg en tilfældig gåde fra arrayet
        const randomIndex = Math.floor(Math.random() * data.riddles.length);
        // Gåden man har valgt
        const selectedRiddle = data.riddles[randomIndex];
        
        riddle = selectedRiddle.riddle;
        //riddle = selectedRiddle.riddle;
        
        // svar bliver tekst i små bogstaver, Det bruges til at sikre at sammenligning af svar er uafhængig af store/små bogstaver
        correctAnswer = selectedRiddle.answer.toLowerCase();
       // correctRiddle = selectedRiddle.answer.toLowerCase()
        
        // Krypter gåden med ROT13
        // og ROT13 kun virker på store bogstaver, funktion bliver skrevet på (A-Z = ASCII 65-90)
       encryptedRiddle = caesarEncrypt(riddle.toUpperCase(),13);
      console.log(selectedRiddle.riddle.toUpperCase())
       
        riddleDiv.html(`<strong>Krypteret gåde:</strong> ${encryptedRiddle}`).position(width/7,height/7);
      } else {
        riddleDiv.html('Ingen gåder fundet i databasen');
      }
    } else {
      riddleDiv.html('Dokument ikke fundet');
    }
  } catch (error) {
    console.error('Fejl ved hentning fra Firebase:', error);
    riddleDiv.html('Fejl ved hentning');
  }
}


function checkAnswer() {
  userAnswer = answerInput.value().toLowerCase().trim();
  if (!userAnswer) {
    resultDiv.html('Indtast venligst et svar');
    resultDiv.style('color', 'red');
    return;
  }

  if (userAnswer === correctAnswer) {
    resultDiv.html('Korrekt! Godt gået! 🎉');
    resultDiv.style('color', 'green');
  } else {
    resultDiv.html(`Forkert. Prøv igen. Hint: ${correctAnswer.length} bogstaver`);
    resultDiv.style('color', 'red');
  }
}


function draw() {
  //background(220);
  background(img,windowWidth,windowHeight);
 // text("SPILLER 1: Morse-kode afsender", 20, 30);
 // text("Nuværende kode: " + morseCode, 20, 60);
 // text("Brug . (punktum) og - (bindestreg)", 20, 90);
  
 
//  text("Tryk på . eller - og ENTER for at sende", 20, 110);

  
    // Tegn en "Send"-knap
  //fill(0, 255, 0);
 // rect(20, 120, 100, 40);
 // fill(0);
//text("SEND", 50, 145);
  
  textSize(30);
text("Spiller 1: eventyr", windowWidth/7,60); 
  text("Svar fra Spiller 2: " +  morseCode, windowWidth/7, windowHeight/2);

  

}

//function keyPressed() {
  //if (key === '.') morseCode += '·';
  //if (key === '-') morseCode += '−';
  //if (key === ' ') morseCode += ' ';
 //if (key === 'Enter') {
   // mqttClient.publish("morse/spil", morseCode);
   // morseCode = ""; // Nulstil efter afsendelse
  //}
  
//}


//function mousePressed() {
  // Tjek om brugeren klikker på "Send"-knappen
 // if (mouseX > 20 && mouseX < 120 && mouseY > 120 && mouseY < 160) {
   // sendMorseCode();  // Send Morse-koden via MQTT
//  }
//}

//function sendMorseCode() {
 // if (morseCode.length > 0) {
 //   mqttClient.publish("morse/spil", morseCode);
 //   console.log("Sendt:", morseCode);
  //  morseCode = ""; // Nulstil efter afsendelse
 // }
//}


function caesarEncrypt(text, shift) {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    return char;
  }).join('');
}



