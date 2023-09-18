import { parentElement, parentWidth, parentHeight, svg } from './globalVariables.js'
import { createInfoSection, createLinkInfoSection } from "./infoSection.js"
import * as idHandler from './idHandler.js'
import * as graphManager from './graphManager.js'
export var simulation;
export var links;
export var nodes;
export var nodesMap = new Map();
export var linksMap = new Map();
export var nodesIds;
export var linksIds;


window.addEventListener('DOMContentLoaded', async function () {
  var openFileButton = document.getElementById("openFileButton");
  var saveFileButton = document.getElementById("saveFileButton");
  var newGraphButton = document.getElementById("newGraphButton");

  newGraphButton.addEventListener("click", function () {
    initializeGraph()
    openFileButton.remove()
    newGraphButton.remove()
  })
  saveFileButton.addEventListener("click", function () { graphManager.saveJSONToFile() })
  openFileButton.addEventListener("click", async function () {
    try {
      // Chiamata a chooseFile() e attesa della risoluzione della promessa
      var fileContent = await chooseFile();
      console.log("File selezionato:\n", fileContent);
      // Converto il contenuto in un nuovo fileJson per ovviare alla richiesta HTTP
      var jsonData = JSON.parse(fileContent);
      initializeGraph(jsonData)
      openFileButton.remove()
      newGraphButton.remove()
    } catch (error) {
      console.error("Errore durante il caricamento del file:", error);
    }
  });
});

/*-------------------------------------------------------------------
 
                       FUNZIONI DI INIZIALIZZAZIONE    
 
-------------------------------------------------------------------*/

function initializeGraph(jsonData) {
  svg.on("contextmenu", function (event) {
    // Previeni il comportamento predefinito del browser
    event.preventDefault();
    closeOpenedPopups();
    createNodePopup(event);
  });
  svg.on("click", function (event) { closeOpenedPopups(); });

  // Inizializza gli array con gli ID
  nodesIds = idHandler.createNodesIds();
  linksIds = idHandler.createLinksIds();

  // Definisci i dati del grafo e crea una mappa per associare gli ID dei nodi ai nodi stessi
  if (!jsonData) {
    console.log("JsonData vuoto, creo un nuovo grafo")
    nodes = []
    links = []
    simulationForce();
  } else {
    nodes = jsonData.nodes;
    links = jsonData.links;
    // Controlla che i dati siano letti correttamente
    console.log("Array di nodi letti nel file:\n", nodes);
    console.log("Array di link letti nel file:\n", links);
    // Aggiungi i nodi alla mappa
    nodes.forEach(function (node) {
      nodesMap.set(node.id, node);
    });

    // Aggiungi i link alla mappa
    links.forEach(function (link) {
      linksMap.set(link.id, link);
    });

    // Crea gli ID e controlla quali di questi sono già utilizzati dai nodi caricati dal json
    nodesIds = idHandler.usedIdChecker(nodesIds, nodesMap);
    linksIds = idHandler.usedIdChecker(linksIds, linksMap);

    // Disegna nodi, link e labels
    drawLinkElements();
    drawLinkLabels();
    drawNodesElements();
    drawNodesLabels();
    simulationForce();
  }
}

/*-------------------------------------------------------------------
 
                       FUNZIONI DI SIMULAZIONE   
 
-------------------------------------------------------------------*/

function simulationForce() {
  // Aggiorna la posizione dei nodi e dei link ad ogni iterazione
  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(parentWidth / 12))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(parentWidth / 2, parentHeight / 2))
    .on("tick", function () { ticked() });
}

export function restartSimulation() {
  /*   console.log("Ricomincio la simulazione, questo è lo stato dei dati")
    console.log("Array nodes: ")
    console.log(nodes)
    console.log("Array links: ")
    console.log(links)
    console.log("Mappa nodi: ")
    console.log(nodesMap)
    console.log("Mappa links: ") */
  simulation.stop();
  simulationForce();
}

// Funzione di callback chiamata ad ogni aggiornamento delle posizioni dei nodi e dei link
function ticked() {
  // Aggiorna le posizioni dei link
  svg.selectAll("line")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  // Aggiorna le posizioni dei cerchi
  svg.selectAll("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

  // Aggiorna le posizioni dei rettangoli in base al centro
  svg.selectAll("rect")
    .attr("x", function (d) {
      return d.x - (this.getAttribute("width") / 2);
    })
    .attr("y", function (d) {
      return d.y - (this.getAttribute("height") / 2);
    });


  // Aggiorna le posizioni delle etichette dei link
  svg.selectAll(".link-label")
    .attr("x", (d) => (d.source.x + d.target.x) / 2)
    .attr("y", (d) => (d.source.y + d.target.y) / 2);

  // Aggiorna le posizioni delle etichette dei nodi
  svg.selectAll(".node-label")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y - (parentWidth / 100 + 5));
}


/*-------------------------------------------------------------------
 
                       FUNZIONI DI SUPPORTO    
 
-------------------------------------------------------------------*/

export function drawNodesElements() {
  var dragHandler = d3.drag()
    .on("start", dragStart)
    .on("drag", dragging)
    .on("end", dragEnd);

  // Selezione degli elementi .node esistenti o appena creati
  var nodesSelection = svg.selectAll(".node")
    .data(nodes)
    .enter()
    .append(function (d) {
      switch (d.tipo) {
        case 'oggetto':
          return document.createElementNS("http://www.w3.org/2000/svg", "rect")
        case 'personaggio':
          return document.createElementNS("http://www.w3.org/2000/svg", "circle")
        default:
          console.error("Tipo non valido: " + d.tipo);
          return null;
      }
    })
    .attr("class", "node")
    .attr("fill", function (d) { return d.color; })
    .call(dragHandler)
    .on("mouseover", function (event, d) {
      showInfoPopup(d.id)
      changeNode(event)
    })
    .on("mouseout", function (event, d) {
      removeInfoPopup()
      resetNode(event)
    })
    .on("click", function (event, d) { createInfoSection(d.id) })
    .on("contextmenu", function (event, d) {
      event.preventDefault()
      event.stopPropagation();
      createLinkPopup(event, d.id);
    })
    .raise();

  // Impostazione degli attributi specifici per i rettangoli e i cerchi
  nodesSelection.filter(function (d) {
    return d.tipo === 'oggetto';
  })
    .attr("width", parentWidth / 75)
    .attr("height", parentWidth / 75);

  nodesSelection.filter(function (d) {
    return d.tipo === 'personaggio';
  })
    .attr("r", parentWidth / 100);
}


export function drawNodesLabels() {
  svg.selectAll(".node-label")
    .data(nodes)
    .enter()
    .append("text")
    .text(function (d) { return d.nome; })
    .attr("class", "node-label")
    .attr("id", function (d) { return d.id; })
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .raise();
}

export function drawLinkElements() {
  svg.selectAll(".link")
    .data(links)
    .enter()
    .insert("line")
    .attr("class", "link")
    .attr("stroke", function (d) { return d.color; })
    .on("click", function (event, d) { createLinkInfoSection(d.id) })
    .lower()
    .on("mouseover", function (event, d) { enlargeLink(event) })
    .on("mouseout", function (event, d) { resetLink(event) })
}

export function drawLinkLabels() {
  svg.selectAll(".link-label")
    .data(links)
    .enter()
    .append("text")
    .text(function (d) { return d.label; })
    .attr("class", "link-label")
    .attr("id", function (d) { return d.id; })
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .raise();
}

// Funzione di callback per mostrare la finestra pop-up
function showInfoPopup(id) {
  // Crea un elemento div per la finestra pop-up
  var popup = document.createElement("div");
  var nodo = nodesMap.get(id)
  popup.className = "popup";
  popup.innerHTML =
    "<span class='popup-text'>Nome personaggio:</span> " + nodo.nome + "<br>" +
    nodo.tipo + "<span class='popup-text'> interpretato da </span>" + nodo.giocatore + "<br>" +
    "<span class='popup-text'>Ruolo:</span> " + nodo.ruolo + "<br>" +
    "<span class='popup-text'>Età:</span> " + nodo.età + "<br>" +
    "<span class='popup-text'>Tratti:</span> " + nodo.tratti + "<br>" +
    "<span class='popup-text'>Movente:</span> " + nodo.movente;

  // Posiziona la finestra pop-up sopra il nodo corrente
  popup.style.top = (nodo.y + parentElement.offsetTop - 150) + "px";
  popup.style.left = (nodo.x + parentElement.offsetLeft - 100) + "px";
  // Aggiungi la finestra pop-up al documento
  document.body.appendChild(popup);
}

// Funzione di callback per nascondere la finestra pop-up
function removeInfoPopup() {
  // Rimuovi tutti gli elementi con la classe "popup"
  var popups = document.getElementsByClassName("popup");
  while (popups.length > 0) {
    popups[0].parentNode.removeChild(popups[0]);
  }
}

function createNodePopup(event) {
  var existingpopup = document.querySelector(".newnode-popup");
  if (existingpopup) {
    existingpopup.remove();
  }
  // Crea un elemento div per il popup
  const popup = d3.select("body")
    .append("div")
    .attr("class", "newnode-popup")
    .style("position", "absolute")
    .style("left", event.clientX + "px")
    .style("top", event.clientY + "px");

  // Aggiungi del testo al popup
  popup.append("button")
    .text("Crea nodo Personaggio qui")
    .on("click", function () {
      var x = event.clientX;
      var y = event.clientY;
      popup.remove()
      graphManager.createNode(x, y, "personaggio");
    });

  popup.append("button")
    .text("Crea nodo Oggetto qui")
    .on("click", function () {
      var x = event.clientX;
      var y = event.clientY;
      popup.remove()
      graphManager.createNode(x, y, "oggetto");
    });



  // Aggiungi un pulsante per chiudere il popup
  popup.append("button")
    .text("Chiudi")
    .on("click", function () {
      popup.remove();
    });
}

function createLinkPopup(event, id) {
  closeOpenedPopups()
  // Crea un elemento div per il popup
  const popup = d3.select("body")
    .append("div")
    .attr("class", "newlink-popup")
    .style("position", "absolute")
    .style("left", event.clientX + "px")
    .style("top", event.clientY + "px");

  // Aggiungi del testo al popup
  popup.append("button")
    .text("Crea relazione per questo nodo")
    .on("click", function () {
      var x = event.clientX;
      var y = event.clientY;
      popup.remove()
      var nodeSource = nodesMap.get(id)
      graphManager.createLink(nodeSource, nodesMap, links, linksIds, linksMap);
    });

  // Aggiungi un pulsante per chiudere il popup
  popup.append("button")
    .text("Chiudi")
    .on("click", function () {
      popup.remove();
    });
}

function closeOpenedPopups() {
  var existingCreateNodePopup = d3.select(".newnode-popup");
  if (!existingCreateNodePopup.empty()) {
    existingCreateNodePopup.remove();
  }
  var existingpopup = document.querySelector(".newlink-popup");
  if (existingpopup) {
    existingpopup.remove();
  }
}


// Funzione di gestione dell'evento drag "start"
function dragStart(event, d) {
  // Logica da eseguire all'inizio del trascinamento
  console.log("Inizio del trascinamento");
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

// Funzione di gestione dell'evento drag "drag"
function dragging(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

// Funzione di gestione dell'evento drag "end"
function dragEnd(event, d) {
  // Logica da eseguire alla fine del trascinamento
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
  console.log("Fine del trascinamento");
}

// Funzione per ingrandire la linea
function enlargeLink(event) {
  console.log("Illumino link")
  var link = d3.select(event.currentTarget)
  link.transition()
    .duration(100)
    .style("stroke-width", "10px")
    .style("stroke", "white");
}

// Funzione per ripristinare le dimensioni originali della linea
function resetLink(event) {
  var link = d3.select(event.currentTarget)
  link.transition()
    .duration(100)
    .style("stroke-width", "5px")
    .style("stroke", function (d) { return d.color; });
}

// Funzione per cambiare colore al bordo del nodo
function changeNode(event) {
  console.log("Illumino nodo")
  var link = d3.select(event.currentTarget)
  link.transition()
    .duration(100)
    .style("stroke-width", "5px")
    .style("stroke", "white");
}

// Funzione per cambiare colore al bordo del nodo
function resetNode(event) {
  var node = d3.select(event.currentTarget)
  node.transition()
    .duration(100)
    .style("stroke-width", "2px")
    .style("stroke", "black");
}

/*-------------------------------------------------------------------
 
                       FUNZIONI GESTIONE FILES    
 
-------------------------------------------------------------------*/


async function chooseFile() {
  return new Promise((resolve) => {
    console.log("Scegli un file");
    // Crea un elemento input di tipo file
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // Accetta solo file con estensione .json

    // Aggiungi un listener per l'evento change
    input.addEventListener("change", async function () {
      // Ottieni il file selezionato dall'utente
      var file = this.files[0];

      // Leggi il contenuto del file utilizzando un FileReader
      var reader = new FileReader();
      reader.onload = function (event) {
        // Risolvi la promessa con il contenuto del file
        resolve(event.target.result);
      };
      reader.readAsText(file);
    });

    // Aggiungi l'elemento input al DOM e apri la finestra di selezione del file
    input.click();
  });
}






