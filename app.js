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
var graphSvg = document.getElementById("graph");
var graphWidth = graphSvg.clientWidth;

window.addEventListener('DOMContentLoaded', async function () {
  var openFileButton = document.getElementById("openFileButton");
  var saveFileButton = document.getElementById("saveFileButton");
  var newGraphButton = document.getElementById("newGraphButton");
  var loadTestGraphButton = document.getElementById("loadTestGraphButton");

  newGraphButton.addEventListener("click", function () {
    initializeGraph()
    openFileButton.remove()
    newGraphButton.remove()
    loadTestGraphButton.remove()
  })
  saveFileButton.addEventListener("click", function () { graphManager.saveJSONToFile() })

  loadTestGraphButton.addEventListener("click", async function () {
    const filePath = "testGraph.json";
    const testGraphData = await loadGraphData(filePath);
    initializeGraph(testGraphData)
    openFileButton.remove()
    newGraphButton.remove()
    loadTestGraphButton.remove()

    drawGraphTitle(filePath)
  });

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
      loadTestGraphButton.remove()
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

    // Aggiunge lo zoom
    addZoomListener(graphSvg);
  }
}

/*-------------------------------------------------------------------
 
                       FUNZIONI DI SIMULAZIONE   
 
-------------------------------------------------------------------*/

function simulationForce() {
  // Aggiorna la posizione dei nodi e dei link ad ogni iterazione
  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(graphWidth / 10))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(graphWidth / 2, parentHeight / 2))
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
    .attr("y", (d) => d.y - (graphWidth / 100 + 5));
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
    .attr("width", graphWidth / 75)
    .attr("height", graphWidth / 75);

  nodesSelection.filter(function (d) {
    return d.tipo === 'personaggio';
  })
    .attr("r", graphWidth / 100);
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


function showInfoPopup(id) {

  var popup = document.createElement("div");
  var nodo = nodesMap.get(id);
  popup.className = "popup";

  var popupContent = document.createElement("div");

  switch (nodo.tipo) {
    case "personaggio":
      appendPopupField(popupContent, "Nome personaggio:", nodo.nome);
      appendPopupField(popupContent, nodo.tipo + " interpretato da ", nodo.giocatore);
      appendPopupField(popupContent, "Ruolo:", nodo.ruolo);
      appendPopupField(popupContent, "Età:", nodo.età);
      appendPopupField(popupContent, "Tratti:", nodo.tratti);
      appendPopupField(popupContent, "Movente:", nodo.movente);
      popup.appendChild(popupContent);
      popup.style.top = (nodo.y + parentElement.offsetTop - graphWidth / 10) + "px";
      popup.style.left = (nodo.x + parentElement.offsetLeft - graphWidth / 20) + "px";
      break;

    case "oggetto":

      appendPopupField(popupContent, "Nome oggetto:", nodo.nome);
      appendPopupField(popupContent, "Descrizione:", nodo.descrizione);
      popup.appendChild(popupContent);
      popup.style.top = (nodo.y + parentElement.offsetTop - graphWidth / 25) + "px";
      popup.style.left = (nodo.x + parentElement.offsetLeft - graphWidth / 25) + "px";
      break;

    default:
      popupContent.textContent = "Tipo nodo non riconosciuto";
      break;
  }

  document.body.appendChild(popup);
}

function appendPopupField(container, label, value) {
  var field = document.createElement("div");
  field.classList.add("popup-field");
  field.innerHTML = "<span class='popup-text'>" + label + "</span> " + value;
  container.appendChild(field);
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
  popup.append("br");
  // Aggiungi del testo al popup
  popup.append("button")
    .text("Crea nodo Personaggio qui")
    .on("click", function () {
      var x = event.clientX;
      var y = event.clientY;
      popup.remove()
      graphManager.createNode(x, y, "personaggio");
    });
  popup.append("br");
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
    .attr("class", "close-button")
    .text("X")
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

  // Aggiunge del testo al popup
  popup.append("br");
  popup.append("button")
    .text("Crea relazione per questo nodo")
    .on("click", function () {
      var x = event.clientX;
      var y = event.clientY;
      popup.remove()
      var nodeSource = nodesMap.get(id)
      graphManager.createLink(nodeSource);
    });

  // Aggiungi un pulsante per chiudere il popup
  popup.append("button")
    .attr("class", "close-button")
    .text("X")
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
    .style("stroke-width", "7px")
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

function addZoomListener(svgElement) {
  var scaleFactor = 1.0;
  var zoomSpeed = 0.1;

  svgElement.addEventListener("wheel", function (event) {
    event.preventDefault();

    var zoomDirection = event.deltaY > 0 ? -1 : 1;

    scaleFactor += zoomDirection * zoomSpeed;

    // Impedisci lo zoom in eccesso
    scaleFactor = Math.max(0.1, Math.min(3.0, scaleFactor));

    // Applica la trasformazione di scala solo all'SVG interno
    svgElement.setAttribute("transform", "scale(" + scaleFactor + ")");
  });
}

function drawGraphTitle(filePath) {
  var fileName = filePath.split('/').pop().split('.')[0];

  var titleGraphDiv = document.createElement("div");
  titleGraphDiv.textContent = fileName;
  titleGraphDiv.classList.add("file-name");

  document.body.appendChild(titleGraphDiv);
}

/*-------------------------------------------------------------------
 
                       FUNZIONI GESTIONE FILES    
 
-------------------------------------------------------------------*/


async function chooseFile() {
  return new Promise((resolve) => {
    console.log("Scegli un file");
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", async function () {
      var file = this.files[0];

      var reader = new FileReader();
      reader.onload = function (event) {
        var fileName = file.name.split('.').slice(0, -1).join('.');
        drawGraphTitle(fileName);
        resolve(event.target.result);
      };
      reader.readAsText(file);
    });
    input.click();
  });
}

// Funzione per caricare i dati del grafico da un file JSON
async function loadGraphData(fileName) {
  try {
    const response = await fetch(fileName);
    if (!response.ok) {
      throw new Error("Errore durante il caricamento del file JSON.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Si è verificato un errore durante il caricamento del file JSON:", error);
    throw error;
  }
}






