// definer variables
//starter med en tom strenge, hvor morseCode (, . mellemrum) bliver gemt
let morseCode = "";
//varibelen gemmer forbindelse til MQTT-serveren
let mqttClient;
//gemme den oprindelige gåde uden kryptering, som hentes fra Firebase
let riddle = "";
// gemme den krypterede gåde
let encryptedRiddle = "";
//gemmer det rigtige svar af gåden fra Firebase
let correctAnswer = "";
//gemmer spillerne indstastede svar
let userAnswer = "";
// lave en variabel til inputfelt, hvor brugere kan skrive svar
let answerInput; 
// en tekstboks hvor viser svar er rigtigt eller forkert
let resultDiv;



// Indlæser et baggrundsbillede før setup() starter
function preload() {  
  img = loadImage('./assets/background.jpeg')
}

function setup() {
  // tegner et canvas i hele vinduets størrelse
  createCanvas(windowWidth, windowHeight);
  // tekststørrelse
  textSize(16);

  
  
  
   // gå ind i datebasen og kig samlingen gaade, finde dokumentet med navnet gaader
  database.collection('gaade').doc('gaader')
  // hold øje med ændringer i dokumentet
  // hvis der sker noget i dokumentet, så kør funktionen herunder:
    .onSnapshot( (doc) => {
      // vis indholdet fra databasen i konsollen
      // så man kan se hvad der er blevet hentet
      console.log('Fik dette fra databasen: ', doc.data() )
    console.log(doc.data())
    
    
  } )
  
   
  
  
  
 // Knap til at hente en ny gåde
  let riddleButton = createButton('Hent gåde')
  // positionering af knappen
  riddleButton.position(width/3,height/3)

  // Når der klikkes for mousepressed, kald getRiddle(), som henter en ny gåde fra Firebase
  // () => getRiddle() er en anonym funktion( pil-funktion) uden navn, som bare klader getRiddle()
  // Arrow-funktion er en kortere måde at skrive det på:
  // annonym funktion er den navnløse kode der bruges kun en gang
  // her som callback når knappen bliver trykket
  riddleButton.mousePressed( () => getRiddle() ) 

  
  // skaber en ny boks på skærmen, hvor teksten står som standard :" hit the button..."
  //boksen bruges til at vise den krtyperede gåde senere
    riddleDiv = createDiv('Hit the button to fetch a new riddle')
    // giv boksen en css-klasse med navnet riddleDiv, så den kan styles i .css-filen
    // i .css-fil il at style boksens baggrundsfarve, skrifttype, kant og størrelse...
  riddleDiv.addClass('riddleDiv')
  //placerer boksen på canvas/skærmen
  // 1/3 fra venstre kant af skærmen
  // 1/4 nede fra toppen af skærmen
  riddleDiv.position(width/3,height/4)
  
  
  
   // Inputfelt til svar
   // laver et tomt inputfelt, hvor brugeren kan skrive sit svat til gåden
  answerInput = createInput('');
  // placerer inputfeltet på skærmen
  answerInput.position(width/3, height/2+80);
  //giver inputfeltet 300 pixels i bredde
  answerInput.size(300);
  
  // Knap til at tjekke svar
  let checkButton = createButton('Tjek svar');
  // placerer knappen lidt under inputfeltet
  checkButton.position(width/3, height/2+130 );
  // når knappen bliver trykket, klades funktoinen checkAnswer()
  // som tjekker om svaret er korrekt
  checkButton.mousePressed(checkAnswer);
  

  
  // visning af resultatet (rigtigt/forkert)
  // opretter en ny tom boks/div, hvor man snerer vil se om svaret er korrekt eller forkert
  resultDiv = createDiv('');
  // placerer den lidt under knappen
  resultDiv.position(width/3, height/2+180);
  //tekst i boksen bliver sort og fed skrift
  resultDiv.style('color', 'black');
  resultDiv.style('font-weight', 'bold');

  
  
  
  
  

// opret forbindelse til en gratis MQTT-testserver via Websocket-protokol
// som bruges til at kommunikere med en anden enhed, spiller 2 tænker
  mqttClient = mqtt.connect("wss://test.mosquitto.org:8081"); 
 
  // når forbindelse er forbundet, vises besked i konsollen
  // abonner på beskeder fra MQTT-kanalen"morse/svar"
  mqttClient.on("connect", () => {
  console.log("Spiller 1 forbundet!");
  mqttClient.subscribe("morse/svar");
});
  
// Når der modtages en besked:
//laves den om til tekst
/// f.eks. "·−·−"
// morseCode vises senere på skærmen i draw()
  mqttClient.on("message", (topic, message) => {
  const received = message.toString(); 
  console.log("Modtaget:", received);
    

  // Tilføj hver morse-tegn (., - og mellemrum) til morseCode-strengen
  for (let char of received) {
    if (char === '·') morseCode += '·';
    else if (char === '−') morseCode += '−';
    else if (char === ' ') morseCode += ' ';
  }

});
  

  
  
}
  
  
  //Funktion til at hente en tilfældig gåde fra Firebase
  // starter en asynkron funktion, så den kan vente på svar fra databasen(Firebase)
  // funktionen kaldes, når man trykker på knappen Hent gåde
 async function getRiddle() {
  // Vis loadingtekst i boksen, for at vise, at programmet er i gang
  riddleDiv.html('Henter gåde...');
  // starter et try/catch blok for at fange fejl hvis noget går galt
  try {
    // Hent dokumentet "gaader" fra samlingen "gaade" i Firebase
    // await betyder vent på at få data fra firebase
    const doc = await database.collection('gaade').doc('gaader').get();
    
    // Tjek om dokumentet faktisk eksisterer i dateabasen
    if (doc.exists) {
      // henter selv data indholdet fra dokumentet og gemmer det i variablen data
      const data = doc.data();
      
      // tjek om der findes et array af gåde riddles, og det er ikke tomt
      if (data.riddles && data.riddles.length > 0) {
        // Vælg en tilfældig tal i arrayet, hvis der er 5 gåder - så et tal fra 0 til 3
        const randomIndex = Math.floor(Math.random() * data.riddles.length);
        // Henter den tilfældige gåde man har valgt fra arrayet
        const selectedRiddle = data.riddles[randomIndex];
        // gemmer selv gåden i variablen riddle
        riddle = selectedRiddle.riddle;
       // gemmer det korrekte svar i variablen correctAnswer og  
        // lave svar om til små bogstaver (toLowerCase()), så det er lettere at sammenligne med brugerens svar
        //Det bruges til at sikre at sammenligning af svar er uafhængig af store/små bogstaver
        correctAnswer = selectedRiddle.answer.toLowerCase();
       
        // Krypter gåden med ROT13
        // lav gåden om til store bogstaver(toUpperCase())
        // da ROT13 kun virker på store bogstaver, funktion bliver skrevet på (A-Z = ASCII 65-90)
        // bruges funktion caesarEncrypt med forskydning 13
       encryptedRiddle = caesarEncrypt(riddle.toUpperCase(),13);
      console.log(selectedRiddle.riddle.toUpperCase())
       // viser den krypterede gåde i boksen på skærmen
        riddleDiv.html(`<strong>Krypteret gåde:</strong> ${encryptedRiddle}`).position(width/7,height/7);
      } else {
        // hvis der findes ingen gåder i databasen(der findes dokumentet, men det indeholder ente), 
        //vises denne fejlbesked til brugeren
        riddleDiv.html('Ingen gåder fundet i databasen');
      }
    } else {
      // eller dokumentet gaader findes ikke i samlingen gaade, der er ikke noget at hente
      riddleDiv.html('Dokument ikke fundet');
    }
    // hvis der sker fejl under hentning af data fra firebase, står der er fejl i konsollen
    // og viser besked til brugern
  } catch (error) {
    console.error('Fejl ved hentning fra Firebase:', error);
    riddleDiv.html('Fejl ved hentning');
  }
}

// starter funktionen som bliver kaldt når brugeren trykker på knappen - Tjek svar
function checkAnswer() {
  //Henter brugerens svar fra inputfeltet
  // toLowerCase() gør at det ikke betyder noget om brugeren skriver med store eller små bogstaver
  // det vil sige laver det hele til små bogstaver
  // trim() fjerner mellemrum før og efter svaret, i starten og slutningen
  userAnswer = answerInput.value().toLowerCase().trim();
  // Hvis feltet er tomt, brugerne skrev intet men trykke på knappen tjek svat
  if (!userAnswer) {
    // vises denne fejlbesked
    resultDiv.html('Indtast venligst et svar');
    // og gør teksten rød
    resultDiv.style('color', 'red');
    // og stop funktionen med return
    return;
  }

  // Hvis brugerens svar er korrekt (matcher rigtige svar som begge i små bogstaver)
  if (userAnswer === correctAnswer) {
    //vises denne succes-besked
    resultDiv.html('Korrekt! Godt gået! 🎉');
    // og teksten bliver grøn
    resultDiv.style('color', 'green');
  } else {
    // Hvis svaret er forkert
    // vis denne fejlbesked
    // og gør teksten rød
    resultDiv.html(`Forkert. Prøv igen. Hint: ${correctAnswer.length} bogstaver`);
    resultDiv.style('color', 'red');
  }
}

// draw() er en p5.ks funktion som automatiske klades igen og igen (60 gange i sekundet som standard)) frameRate (60)
function draw() {
  // baggrunden sættes til et billeder (img), der gylder hele  vinduets bredde og højde. 
  background(img,windowWidth,windowHeight);
  // tekststørrelse til 30 pixels
  textSize(30);
  // viser en overskrift med windowWidth/7 x-position og 60 pixels y-position
text("Spiller 1: eventyr", windowWidth/7,60); 
//viser tekst "svar fra Spiller 2" efterfulgt af det der er modtaget i morseCode
  text("Svar fra Spiller 2: " +  morseCode, windowWidth/7, windowHeight/2);

  

}

// Dette definerer en tekstfunktion til at kryptere teksten ved hjælp af Caesar-kryptering
//klader funktionen caesarEncrypt med to input text og shift (teksten og forskydning)
// text: en streng, der skal krypteres: gåder
// shift: hvor mange bogstaver man skal rykke frem i alfabetet (13 i ROT 13)
function caesarEncrypt(text, shift) {
  // text.spilt('') laver strengen om til at array af enkeltbogstaver
  // map() bruges til at ændre hvert bogstav i arrayet
  //map(char => {}) betyder: for hvert bogstav i arrayet, gør noget med det (en såkladt arrowfunktion)
  return text.split('').map(char => {
    // char.charCodeAt(0) giver ASCII-koden for bogstavet
    // f.eks. A = 65, B = 66, C = 67 osv.
    const code = char.charCodeAt(0);
    // tjekke om bogstavet er stor bogstac (A-Z) (fra 65 til 90)
    if (code >= 65 && code <= 90) {
      // beregn den nye kode ved at tilføje forskydningen
      // det laver caesar-kryptering
      //f.ek.: code -65 gøre A til 0, B til 1 osv. Z til 25
      // + shift tilføjer forskydningen, rykker bogstavet f.eks.(13 her) frem
      // % 26 gør at det bliver til 0-25 igen, så det ikke går ud over alfabetet
      // + 65 gør at det bliver til ASCII-koden igen
      // string.fromCharCode() laver koden om til et bogstav igen
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    // hvis det ikke er et stort bogstav, return det som det er(f.ek. mellemrum, tal, punktum, tegn osv.)
    return char;
    // .join('') bruges til at samler alle de krpterede bogstaver i arrayet til en enkelt tekststreng
  }).join('');
}



