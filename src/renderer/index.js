var hyperdecklib = require("hyperdeck-js-lib");
const Store = require('electron-store');
const store = new Store();
const { ipcRenderer } = require('electron');

var ips = store.get('ips');
var names = store.get('names');

import "../styles/app.css";
import "../font/css/all.css";

document.getElementById('app').innerHTML = `
<div class="top_monitor">
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
<div id="decks"></div>
`;


var decks = new Array();
var ips = store.get('ips');

let monitorTemplate = (name, ip, deckid) => `
<div class="monitor" data-deck="${deckid}">
  <h1>${name}
  <span class='ip'>${ip}</span>
  <span class="timecode">00:00:00:00</span>
  <span class="format">1080p25</span>
  <span class="recordingTime">00000</span>
  </h1>
  
  <div class="controls">
    <span class="previous" ><i class="fas fa-step-backward"></i></span>
    <span class="rw"><i class="fas fa-backward"></i></span>
    <span class="play"><i class="fas fa-play"></i></span>
    <span class="stop"><i class="fas fa-stop"></i></span>
    <span class="ff"><i class="fas fa-forward"></i></span>
    <span class="next"><i class="fas fa-step-forward"></i></span>
    <span class="record"><i class="fas fa-circle"></i></i></span>
  </div>
  <div class="options">
    <span class="move-up"><i class="fas fa-chevron-up"></i></span>
    <span class="remove"><i class="fas fa-trash-alt"></i></span>
    <span class="move-down"><i class="fas fa-chevron-down"></i></i></span>
  </div>
</div>`

function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

function loadDeck(ip) {
  var monitors = document.getElementsByClassName('monitor');
  var lastMonitor = monitors[monitors.length-1];

  var index = ips.indexOf(ip);

  document.getElementById('decks').insertAdjacentElement("beforeend", htmlToElement(monitorTemplate(names[index], ip, index)));

}

require('electron').ipcRenderer.on('manage-decks', (event, message) => {
  var form = `
  <div id="newDeviceFields">
    <label for="name">Label</label>
    <input type="text" name="name" id="name" autofocus/>
    
    <label for="ip">IP</label>
    <input type="text" name="ip" id="ip"/>
    
    <button id="addDevice">Add Device</button>
    <button id="clearDevices">Remove all decks</button>
    <button id="closeNewFields" onclick="this.parentNode.parentNode.removeChild(this.parentNode)"><i class="fas fa-times-circle"></i></button>
  </div>
  `;


  document.getElementById('app').insertAdjacentElement("beforeend", htmlToElement(form));

  document.getElementById('addDevice').addEventListener('click', addDevice);
  document.getElementById('clearDevices').addEventListener('click', clearDevices);

  document.getElementById('newDeviceFields').scrollIntoView(true);
  
})

document.addEventListener("DOMContentLoaded", function() {

  if (ips){
    ips.forEach(function(item, index){
      decks.push(new hyperdecklib.Hyperdeck(item));
      loadDeck(item);

      setInterval(function(){displayTimecode(index)}, 1000);
      setInterval(function(){slotInfo(index)}, 10000);
    });
  }


  function displayTimecode(index) {
    decks[index].transportInfo().then(function(response) {
      document.querySelectorAll(`[data-deck="${index}"]`)[0].getElementsByClassName('timecode')[0].textContent = response["params"]["timecode"];
      document.querySelectorAll(`[data-deck="${index}"]`)[0].getElementsByClassName('format')[0].textContent = response["params"]["video format"];

      //console.log("DECK " + index + response["params"]["video format"]);
    }).catch(function(errResponse){
      console.log('Error getting timecode information from hyperdeck');
    });
  }

  function slotInfo(index) {
    decks[index].slotInfo().then(function(response) {
      var recordingTime = response["params"]["recording time"];
      var time = new Date(parseInt(recordingTime) * 1000).toISOString().substr(11, 8);
      document.querySelectorAll(`[data-deck="${index}"]`)[0].getElementsByClassName('recordingTime')[0].textContent = time;

      //console.log("Recording time " + index + response["params"]["recording time"]);
    }).catch(function(errResponse){
      console.log('Error getting slot information from hyperdeck');
    });
  }

  var ip_elements = document.getElementsByClassName('ip');
  for (var i = 0; i < ip_elements.length; ++i) {
    ip_elements[i].textContent = ips[i];
    console.log(ips);
    console.log(i);
    console.log(ips[i]);

    ip_elements[i].addEventListener("click", function(){ipcRenderer.send('open-ftp', "ftp://" + ips[i])});

    
  }

  var plays = document.getElementsByClassName('play');
  for (var i = 0; i < plays.length; ++i) {
    plays[i].addEventListener("click", function(event){
      var deck = this.parentNode.parentNode.dataset.deck;
      console.log(deck);
      decks[deck].play();
    });
  }

  var stops = document.getElementsByClassName('stop');
  for (var i = 0; i < plays.length; ++i) {
    stops[i].addEventListener("click", function(event){
      var deck = this.parentNode.parentNode.dataset.deck;
      decks[deck].stop();
    });
  }

  var previouses = document.getElementsByClassName('previous');
  for (var i = 0; i < plays.length; ++i) {
    previouses[i].addEventListener("click", function(event){
      var deck = this.parentNode.parentNode.dataset.deck;
      decks[deck].prevClip();
    });
  }

  var nexts = document.getElementsByClassName('next');
  for (var i = 0; i < plays.length; ++i) {
    previouses[i].addEventListener("click", function(event){
      var deck = this.parentNode.parentNode.dataset.deck;
      decks[deck].nextClip();
    });
  }

  var records = document.getElementsByClassName('record');
  for (var i = 0; i < plays.length; ++i) {
    records[i].addEventListener("click", function(event){
      var deck = this.parentNode.parentNode.dataset.deck;
      decks[deck].record();
    });
  }

  var ffs = document.getElementsByClassName('ff');
  for (var i = 0; i < ffs.length; ++i) {
    ffs[i].addEventListener("click", function(event){
      var deck = this.parentNode.parentNode.dataset.deck;
      decks[deck].goTo('+00:00:10:00');
    });
  }

  var rws = document.getElementsByClassName('rw');
  for (var i = 0; i < ffs.length; ++i) {
    rws[i].addEventListener("click", function(event){
      var deck = this.parentNode.parentNode.dataset.deck;
      decks[deck].goTo('-00:00:10:00');
    });
  }

  var removes = document.getElementsByClassName('remove');
  for (var i = 0; i < plays.length; ++i) {
    removes[i].addEventListener("click", function(event){
      var deck = this.parentNode.parentNode.dataset.deck;
      var ips = store.get('ips');
      var names = store.get('names');
      console.log('remove deck ' +deck);
      

      ips.splice(deck, 1);
      names.splice(deck, 1);

      store.set('ips', ips);
      store.set('names', names);

      this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
    });
  }

  var move_ups = document.getElementsByClassName('move-up');
  for (var i = 0; i < plays.length; ++i) {
    move_ups[i].addEventListener("click", function(event){
      var deck = parseInt(this.parentNode.parentNode.dataset.deck);
      var ips = store.get('ips');
      var names = store.get('names');
      console.log('move deck up ' +deck);
      

      arraymove(ips, deck, deck-1);
      arraymove(names, deck, deck-1);

      this.parentNode.parentNode.dataset.deck = deck-1;
      this.parentNode.parentNode.previousElementSibling.dataset.deck = parseInt(this.parentNode.parentNode.previousElementSibling.dataset.deck)+1;

      store.set('ips', ips);
      store.set('names', names);

      var decks = document.getElementsByClassName('monitor');

      swap(decks[deck-1], decks[deck]);

    });
  }

  var move_downs = document.getElementsByClassName('move-down');
  for (var i = 0; i < move_downs.length; ++i) {
    move_downs[i].addEventListener("click", function(event){
      var deck = parseInt(this.parentNode.parentNode.dataset.deck);
      var ips = store.get('ips');
      var names = store.get('names');
      console.log('move deck down ' +deck);
      

      arraymove(ips, deck, deck+1);
      arraymove(names, deck, deck+1);

      this.parentNode.parentNode.dataset.deck = deck+1;
      this.parentNode.parentNode.nextElementSibling.dataset.deck = parseInt(this.parentNode.parentNode.nextElementSibling.dataset.deck)-1;

      store.set('ips', ips);
      store.set('names', names);

      var decks = document.getElementsByClassName('monitor');

      swap(decks[deck], decks[deck+1]);

    });
  }

  function swap(node1, node2) {
    const afterNode2 = node2.nextElementSibling;
    const parent = node2.parentNode;
    node1.replaceWith(node2);
    parent.insertBefore(node1, afterNode2);
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


function addDevice(){
  console.log("Will add deck");

  var ip = document.getElementById('ip').value;
  var name = document.getElementById('name').value;


  if (ips != undefined) {
    store.set('ips', ips.concat(ip));
    store.set('names', names.concat(name));
  }
  else {
    store.set('ips', [ip]);
    store.set('names', [name]);
  }
  ips = store.get('ips');
  names = store.get('names');

  loadDeck(ip);

  document.getElementById('addDevice').focus();
}

function clearDevices() {
  store.delete('ips');
  store.delete('names');

  ips = undefined;
  names = undefined;

  console.log('devices cleared');
  document.getElementById('decks').innerHTML = '';


}

function arraymove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
