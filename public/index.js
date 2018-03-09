
/*I only had about two days to work on this because I was away, so I decided to focus more on
Javascript logic and how use can use JS to run entire applications with DOM manipulation.
It's just a pretty simple "Choose the right answer game". I kept the design as simple as possible (partially due to time constraints and partially due to a lack of fun frameworks)*/

//This Variable keeps track of the current correct answer
var answer = ''
//This Variable keeps track of the data for other functions to use after the data has been loaded to start the game
var gbldata = [];
//The Variable keeps track of the number of questions that have been completed
var questionCount = 0;

//This Function will load in the JSONData from the API using XMLHttpRequest, then parse it
function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

//Function to fade out Divs
function fadeOutEffect(target) {
    var fadeTarget = document.getElementById(target);
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity < 0.1) {
            clearInterval(fadeEffect);
            //fade elements out, then take away their display
            fadeTarget.style.display = 'none';
        } else {
            fadeTarget.style.opacity -= 0.1;
        }
    }, 50);
}

//Function to fade in Divs
function fadeInEffect(target) {
    var fadeTarget = document.getElementById(target);
    //Make elements display, then fade them in
    fadeTarget.style.display = 'block';
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 0;
        }
        if (fadeTarget.style.opacity = 1) {
            clearInterval(fadeEffect);
        } else {
            fadeTarget.style.opacity += 0.1;
        }
    }, 1000);
}


//This function will start the countdown timer
function runTimer(){
  var time = 20
  // Update the count down every 1 second
  var x = setInterval(function() {
    //hdn element that lets the timer know if the answer was correct
    if(document.getElementById("hdnCheck").innerHTML === "correct"){
       clearInterval(x);
       document.getElementById("timer").innerHTML = "<span style='color:green'>Correct</span>";
     }
        //hdn element that lets the timer know if the answer was incorrect
     else if(document.getElementById("hdnCheck").innerHTML === "incorrect"){
       clearInterval(x);
       document.getElementById("timer").innerHTML = "<span style='color:red'>Incorrect</span>";
     }
      //if there's 10 seconds left, turn red
     else if (time <= 10 && time >= 0) {
        document.getElementById("timer").innerHTML = "<span style='color:red'>"+time+"</span>";
        time--;
    }
      //If you run out of time, tell them their time is up and show them the correct answer
    else if (time <= 0) {
        clearInterval(x);
        document.getElementById("timer").innerHTML = "<span style='color:red'>TIME UP</span>";
        wrongAnswer();
    }else{
        document.getElementById("timer").innerHTML = time;
	      time--;
      }
    }, 1000);
}

//Function to set cookies. This way I can keep track of players scores/already selected 'Geniuses'
function setCook(name, value) {
    var cookie = [
        name,
        '=',
        JSON.stringify(value)
    ].join('');
    document.cookie = cookie;
}

//Clears cookies on new game
function clearCook(name){
  var cookie = [
      name,
      '=',
      '[[],0]'
  ].join('');
  document.cookie = cookie;

  var domScore = document.getElementById("score");
  domScore.innerHTML = 0;
}

//Function to get Cookies that are set
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return JSON.parse(
                c.substring(nameEQ.length, c.length)
            );
        }
    }
    return null;
}


//Random Number Generator for our 9 scientists
function randomG(){
    return Math.floor(Math.random() * 9)
}

//Fisher-Yates Shuffle Algorithm
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


//Will display the Geniuses to select from, including the correct one.
function displayGeniuses(genObj, data){
    var selectedNames = [];
    selectedNames.push(genObj.name)
    var randomNum = randomG();

    //Select 3 other Random Names and insert them into the Array
    for(var i = 0; i < 3; i++){
      while(selectedNames.includes(data[randomNum].name)){
        randomNum = randomG();
      }
      var obj = data[randomNum]
      selectedNames.push(obj.name)
    }

      console.log(selectedNames)
    //Shuffle The Names so the answer isn't always in the same location
    shuffledNames = shuffle(selectedNames);
    console.log(shuffledNames)
    var html = ""
    document.getElementById("selections").innerHTML = ""
    //display all of the options
    for(var i = 0; i < shuffledNames.length; i++){
      var shufObj = shuffledNames[i]
      html += '<div class="box '+shufObj+'" onclick="selectAnswer(\''+shufObj+'\');">'+shufObj+'</div>'
    }

    document.getElementById("selections").innerHTML += html

}

//Show the final score, and give the player a replay button, which just restarts a fresh game
function gameOver(score){
  document.getElementById("startButton").innerHTML = '<p style="color:green">Final Score: '+score+'</p><br/><btn class="btn" onclick="beginGame()">REPLAY</btn>';
  fadeOutEffect("correct");
  fadeInEffect("startButton");
}

//This Function wiill load in new questions
//
function newQuestion(gameData){
    // check to see if cookies are already set. If they aren't set them to default values
    var ob = readCookie('track')
    if( ob == null ){
        var alreadyChosen = []
        var score = 0
    } else {
        var alreadyChosen = ob[0]
        var score = ob[1]
    }

    //if you went through all of the geniuses, end game
    if(questionCount === 8){
      gameOver(score);
    } else {
    //Fade in the holder for the next question, fade out the correct answer div
    fadeInEffect("holder");
    fadeOutEffect("correct")
    questionCount++;
    document.getElementById("hdnCheck").innerHTML = ""

    var randomNum = randomG()
    //make sure that genius hasn't been repeated
    while(alreadyChosen.includes(gameData[randomNum].name)){
      randomNum = randomG();
    }
    //pick a new Genius, add them to the list of already chosen geniuses, and then update the cookies
    var selectedGenius = gameData[randomNum];
    alreadyChosen.push(selectedGenius.name)
    setCook('track', [alreadyChosen,score])
    //display quote and change the current correct answer
    document.getElementById("selected").innerHTML = '"'+selectedGenius.quote+'" ';
    answer = selectedGenius.name;
    //display the new answers and start the timer
    displayGeniuses(selectedGenius, gameData);
    runTimer();
  }
}

//take in the name they selected, if the name is correct, add to the score and run the correct answer function
function selectAnswer(name){
  var ob = readCookie('track')
  if( ob == null ){
      var alreadyChosen = [];
      var score = 0;
  } else {
      var alreadyChosen = ob[0];
      var score = ob[1];
  }


  var domScore = document.getElementById("score");

  if(name === answer){
    score++;
    //update the score in the cookies
    setCook('track', [alreadyChosen,score]);
    domScore.innerHTML = score;
    correctAnswer();
  } else {
    wrongAnswer();
  }
}

//If the answer is wrong, display the correct information with red text.
function wrongAnswer(){
  document.getElementById("hdnCheck").innerHTML = "incorrect";
  image = document.getElementById("correctImage");
  named = document.getElementById("correctName");
  birthday = document.getElementById('correctBirthday');
  quote = document.getElementById('correctQuote');
  fadeOutEffect("holder");
  for(var i = 0; i<gbldata.length; i++){
    if(gbldata[i].name === answer){
      var genius = gbldata[i]
      image.src = genius.image_url;
      named.innerHTML = "<span style='color:red'>Name: "+genius.name+"</span>"
      birthday.innerHTML = "<span style='color:red'>DOB: "+genius.birthday+"</span>"
      quote.innerHTML = "<span style='color:red'>"+genius.quote+"</span>"
    }
  }
  fadeInEffect("correct");
}

//If the answer is correct, display the correct information with green text
function correctAnswer(){
  document.getElementById("hdnCheck").innerHTML = "correct";
  image = document.getElementById("correctImage");
  named = document.getElementById("correctName");
  birthday = document.getElementById('correctBirthday');
  quote = document.getElementById('correctQuote');
  fadeOutEffect("holder");
  for(var i = 0; i<gbldata.length; i++){
    if(gbldata[i].name === answer){
      var genius = gbldata[i]
      image.src = genius.image_url;
      named.innerHTML = "<span style='color:green'>Name: "+genius.name+"</span>"
      birthday.innerHTML = "<span style='color:green'>DOB: "+genius.birthday+"</span>"
      quote.innerHTML = "<span style='color:green'>"+genius.quote+"</span>"
    }
  }
  fadeInEffect("correct");
}

//Starts the game with fresh data
function beginGame(){
clearCook('track');
questionCount = 0;
fadeOutEffect("startButton");
fadeInEffect("holder");

  loadJSON('http://127.0.0.1:3000/data',
           function(data) {
             gbldata = data
             newQuestion(data)
  ; },
           function(xhr) { console.error(xhr); }
  );
}
