var hyperdecklib = require("hyperdeck-js-lib");
import "../styles/app.css";

let template = `
<head>
<meta charset="UTF-8" />
<title>Hyperdeck UI</title>
<script src="https://kit.fontawesome.com/da3f06ce15.js" crossorigin="anonymous"></script>
</head>
<body>
<div class="monitor">
  <h1>All decks</h1>
  <div class="controls">
    <span id="all_previous"><i class="fas fa-step-backward"></i></span>
    <span id="all_rw"><i class="fas fa-backward"></i></span>
    <span id="all_play"><i class="fas fa-play"></i></span>
    <span id="all_stop"><i class="fas fa-stop"></i></span>
    <span id="all_ff"><i class="fas fa-forward"></i></span>
    <span id="all_next"><i class="fas fa-step-forward"></i></span>
    <span id="all_record"><i class="fas fa-circle"></i></i></span>
  </div>
</div>
<div class="monitor">
  <h1>HyperDeck 1<span class='ip'>192.168.1.1</span></h1>
  <div class="controls">
    <span class="previous" data-deck="0"><i class="fas fa-step-backward"></i></span>
    <span class="rw" data-deck="0"><i class="fas fa-backward"></i></span>
    <span class="play" data-deck="0"><i class="fas fa-play"></i></span>
    <span class="stop" data-deck="0"><i class="fas fa-stop"></i></span>
    <span class="ff" data-deck="0"><i class="fas fa-forward"></i></span>
    <span class="next" data-deck="0"><i class="fas fa-step-forward"></i></span>
    <span class="record" data-deck="0"><i class="fas fa-circle"></i></i></span>
  </div>
</div>
<div class="monitor">
  <h1>HyperDeck 2<span class='ip'>192.168.1.2</span></h1>
  <div class="controls">
    <span class="previous" data-deck="1"><i class="fas fa-step-backward"></i></span>
    <span class="rw" data-deck="1"><i class="fas fa-backward"></i></span>
    <span class="play" data-deck="1"><i class="fas fa-play"></i></span>
    <span class="stop" data-deck="1"><i class="fas fa-stop"></i></span>
    <span class="ff" data-deck="1"><i class="fas fa-forward"></i></span>
    <span class="next" data-deck="1"><i class="fas fa-step-forward"></i></span>
    <span class="record" data-deck="1"><i class="fas fa-circle"></i></i></span>
  </div>
</div>
<div class="monitor">
  <h1>HyperDeck 3<span class='ip'>192.168.1.3</span></h1>
  <div class="controls">
    <span class="previous" data-deck="2"><i class="fas fa-step-backward"></i></span>
    <span class="rw" data-deck="2"><i class="fas fa-backward"></i></span>
    <span class="play" data-deck="2"><i class="fas fa-play"></i></span>
    <span class="stop" data-deck="2"><i class="fas fa-stop"></i></span>
    <span class="ff" data-deck="2"><i class="fas fa-forward"></i></span>
    <span class="next" data-deck="2"><i class="fas fa-step-forward"></i></span>
    <span class="record" data-deck="2"><i class="fas fa-circle"></i></i></span>
  </div>
</div>
<div class="monitor">
  <h1>Master<span class='ip'>192.168.1.3</span></h1>
  <div class="controls">
    <span class="previous" data-deck="2"><i class="fas fa-step-backward"></i></span>
    <span class="rw" data-deck="2"><i class="fas fa-backward"></i></span>
    <span class="play" data-deck="2"><i class="fas fa-play"></i></span>
    <span class="stop" data-deck="2"><i class="fas fa-stop"></i></span>
    <span class="ff" data-deck="2"><i class="fas fa-forward"></i></span>
    <span class="next" data-deck="2"><i class="fas fa-step-forward"></i></span>
    <span class="record" data-deck="2"><i class="fas fa-circle"></i></i></span>
  </div>
</div>
</body>
`;
document.write(template);

var decks = new Array();
var ips = ["192.168.100.101","192.168.100.102","192.168.100.103","192.168.100.104"]

ips.forEach(function(item){
  decks.push(new hyperdecklib.Hyperdeck(item));
});


document.addEventListener("DOMContentLoaded", function() {

  decks[0].makeRequest("slot info: slot id: 1").then(function(response) {
	  console.log("Got response with code "+response.code+".");
	  console.log("Hyperdeck unique id: "+ JSON.stringify(response.params));
	}).catch(function(errResponse) {
	  if (!errResponse) {
	    console.error("The request failed because the hyperdeck connection was lost.");
	  }
	  else {
	    console.error("The hyperdeck returned an error with status code "+errResponse.code+".");
	  }
	});


  var ip_spans = document.getElementsByClassName('ip');
  for (var i = 0; i < ip_spans.length; ++i) {
    ip_spans[i].textContent = ips[i];
  }

  var plays = document.getElementsByClassName('play');
  for (var i = 0; i < plays.length; ++i) {
    plays[i].addEventListener("click", function(event){
      var deck = this.dataset.deck;
      decks[deck].play();
    });
  }

  var rewinds = document.getElementsByClassName('rw');
  for (var i = 0; i < plays.length; ++i) {
    rewinds[i].addEventListener("click", function(event){
      var deck = this.dataset.deck;
      decks[deck].goTo("00:00:00:00");
    });
  }

  var stops = document.getElementsByClassName('stop');
  for (var i = 0; i < plays.length; ++i) {
    stops[i].addEventListener("click", function(event){
      var deck = this.dataset.deck;
      decks[deck].stop();
    });
  }

  var previouses = document.getElementsByClassName('previous');
  for (var i = 0; i < plays.length; ++i) {
    previouses[i].addEventListener("click", function(event){
      var deck = this.dataset.deck;
      decks[deck].prevClip();
    });
  }

  var nexts = document.getElementsByClassName('next');
  for (var i = 0; i < plays.length; ++i) {
    previouses[i].addEventListener("click", function(event){
      var deck = this.dataset.deck;
      decks[deck].nextClip();
    });
  }

  document.getElementById('all_play').addEventListener("click", function(event){
    for (var i = 0; i < decks.length; ++i) {
      decks[i].play();
    }
  });

  document.getElementById('all_stop').addEventListener("click", function(event){
    for (var i = 0; i < decks.length; ++i) {
      decks[i].stop();
    }
  });

  document.getElementById('all_record').addEventListener("click", function(event){
    for (var i = 0; i < decks.length; ++i) {
      decks[i].record();
    }
  });
});


