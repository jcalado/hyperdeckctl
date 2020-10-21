const Store = require('electron-store');
const store = new Store();

var ips = store.get('ips');
var names = store.get('names');

document.getElementById('addDevice').addEventListener('click', addDevice);
document.getElementById('clearDevices').addEventListener('click', clearDevices);

console.log(ips);
console.log(names);

if (ips) {
    console.log("Trying to load devices from storage");
    loadDevices();
}

function clearDevices() {
    document.getElementById('decks').innerHTML = '';
    ips = store.delete('ips');
    names = store.delete('names');
    console.log('devices cleared');

    console.log(ips);
    console.log(names);
}

function removeDeck(id) {
    ips.splice(id, 1);
    store.set('ips', ips);
    document.getElementById('decks').innerHTML = '';
    loadDevices();
}

function moveDeckUp(id){
    arraymove(ips, id, id-1);
    arraymove(names, id, id-1);

    store.set('ips', ips);
    store.set('names', names);

    loadDevices();
}

function moveDeckDown(id){
    arraymove(ips, id, id+1);
    arraymove(names, id, id+1);

    store.set('ips', ips);
    store.set('names', names);

    loadDevices();
}

function arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

function loadDevices() {

    document.getElementById('decks').innerHTML = '';
    for (let i=0; i<ips.length; i++) {
        var deck = document.createElement("div");
        deck.className = "monitor";


        var nameElement = document.createElement("h1");
        nameElement.textContent = names[i];

        var ipSpan = document.createElement("span");
        ipSpan.className = "ip";
        ipSpan.textContent = ips[i];

        nameElement.append(ipSpan);
        deck.append(nameElement);


        var optionsElement = document.createElement("span");
        optionsElement.className = 'options';

        var deckUpElement = document.createElement("span");
        deckUpElement.innerHTML = '<i class="fas fa-chevron-up"></i>';
        deckUpElement.className = 'move-up';
        deckUpElement.addEventListener("click", function(){moveDeckUp(i)});
        optionsElement.append(deckUpElement);

        var deckRemoveElement = document.createElement("span");
        deckRemoveElement.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deckRemoveElement.className = 'remove';
        deckRemoveElement.addEventListener("click", function(){removeDeck(i)});
        optionsElement.append(deckRemoveElement);

        var deckDownElement = document.createElement("span");
        deckDownElement.innerHTML = '<i class="fas fa-chevron-down"></i>';
        deckDownElement.className = 'move-down';
        deckDownElement.addEventListener("click", function(){moveDeckDown(i)});
        optionsElement.append(deckDownElement);

        deck.append(optionsElement);


        document.getElementById('decks').append(deck);
      };

}

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

    loadDevices();
}