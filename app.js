import { parentElement, parentWidth, parentHeight, svg } from './globalVariables.js'
import { createInfoSection } from "./infoSection.js";
import * as idHandler from './idHandler.js';
import * as graphManager from './graphManager.js'
export var simulation;

var links;
var nodes;
var nodesMap = new Map();
var linksMap = new Map();
var nodesIds;
var linksIds;

window.addEventListener('DOMContentLoaded', function () {
  // Carica il file JSON
  d3.json("dataGraph.json").then(function (data) {
    // Funzione di callback che viene chiamata quando il file JSON è stato caricato correttamente
    svg.on("contextmenu", function (event) {
      // Previeni il comportamento predefinito del browser
      event.preventDefault();
      closeOpenedPopups();
      createNodePopup(event, nodes, nodesIds, nodesMap);
    });
    svg.on("click", function (event) { closeOpenedPopups(); });

    // Definisci i dati del grafo e crea una mappa per associare gli ID dei nodi ai nodi stessi 
    nodes = data.nodes;
    links = data.links;

    // Inizializza gli array con gli ID
    nodesIds = idHandler.createNodesIds()
    linksIds = idHandler.createLinksIds()

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
  })
    .catch(function (error) {
      // Funzione di callback per gestire eventuali errori durante il caricamento del file JSON
      console.log(error);
    });
});

/*-------------------------------------------------------------------
 
                       FUNZIONI DI SUPPORTO    
 
-------------------------------------------------------------------*/

function simulationForce() {
  // Aggiorna la posizione dei nodi e dei link ad ogni iterazione
  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(parentWidth / 10))
    .force("charge", d3.forceManyBody())
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
  svg.selectAll("line")
    .data(links)
    .attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });

  svg.selectAll("circle")
    .data(nodes)
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; });

  svg.selectAll(".link-label")
    .data(links)
    .attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
    .attr("y", function (d) { return (d.source.y + d.target.y) / 2; });

  svg.selectAll(".node-label")
    .data(nodes)
    .attr("x", function (d) { return d.x; })
    .attr("y", function (d) { return d.y - (parentWidth / 100 + 5); });
}


export function drawNodesElements() {
  svg.selectAll("circle")
    .data(nodes)
    .enter()
    .insert("circle", "line")
    .attr("r", parentWidth / 100)
    .attr("fill", "red")
    .on("mouseover", function (event, d) { showInfoPopup(d.id) })
    .on("mouseout", removeInfoPopup)
    .on("click", function (event, d) { createInfoSection(nodesMap, d.id) })
    .on("contextmenu", function (event, d) {
      event.preventDefault()
      event.stopPropagation();
      createLinkPopup(event, d.id);
    });
}

export function drawNodesLabels() {
  svg.selectAll(".node-label")
    .data(nodes)
    .enter()
    .append("text")
    .text(function (d) { return d.nome; })
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black");
}

export function drawLinkElements() {
  svg.selectAll("line")
    .data(links)
    .enter()
    .insert("line")
    .attr("stroke", function (d) { return d.color; });
}

export function drawLinkLabels() {
  svg.selectAll(".link-label")
    .data(links)
    .enter()
    .append("text")
    .text(function (d) { return d.label; })
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black");
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
    .text("Crea nodo qui")
    .on("click", function () {
      var x = event.clientX;
      var y = event.clientY;
      popup.remove()
      graphManager.createNode(nodes, nodesIds, nodesMap, x, y);
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