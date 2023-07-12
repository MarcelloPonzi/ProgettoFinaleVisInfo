import { parentElement, parentWidth, parentHeight, svg } from './globalVariables.js'
import { createInfoSection } from "./infoSection.js";
import * as idHandler from './idHandler.js';
import * as graphManager from './graphManager.js'
export var simulation;
window.addEventListener('DOMContentLoaded', function () {

  // Carica il file JSON
  d3.json("dataGraph.json").then(function (data) {
    // Funzione di callback che viene chiamata quando il file JSON è stato caricato correttamente
    svg.on("contextmenu", function (event) {
      // Previeni il comportamento predefinito del browser
      event.preventDefault();
      createNodePopup(event, nodes, nodeElements, nodesIds, nodesMap);
    });

    // Definisci i dati del grafo e crea una mappa per associare gli ID dei nodi ai nodi stessi 
    var nodes = data.nodes;
    var links = data.links;
    var nodesMap = new Map();
    var linksMap = new Map();

    // Inizializza gli array con gli ID
    var nodesIds = idHandler.createNodesIds()
    var linksIds = idHandler.createLinksIds()

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
    console.log("Array id nodi filtrati")
    console.log(nodesIds)

    // Disegna nodi, link e labels
    var linkElements = drawLinkElements(links);
    var linkLabels = drawLinkLabels(links);
    var nodeElements = drawNodesElements(nodes, nodesMap);
    var nodeLabels = drawNodesLabels(nodes);

    // Aggiorna la posizione dei nodi e dei link ad ogni iterazione
    simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(parentWidth / 10 + 100))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(parentWidth / 2, parentHeight / 2))
      .on("tick", ticked);

    // Funzione di callback chiamata ad ogni aggiornamento delle posizioni dei nodi e dei link
    function ticked() {
      linkElements
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

      nodeElements
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });

      linkLabels
        .attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
        .attr("y", function (d) { return (d.source.y + d.target.y) / 2; });

      nodeLabels
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y - (parentWidth / 100 + 5); });
    }

  })
    .catch(function (error) {
      // Funzione di callback per gestire eventuali errori durante il caricamento del file JSON
      console.log(error);
    });
});



/*-------------------------------------------------------------------
 
                       FUNZIONI DI SUPPORTO    
 
-------------------------------------------------------------------*/

export function drawNodesElements(nodes, nodesMap) {
  var nodeElements = svg.selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", parentWidth / 100)
    .attr("fill", "red")
    .on("mouseover", function (event, d) { showInfoPopup(nodesMap, d.id) })
    .on("mouseout", removeInfoPopup)
    .on("click", function (event, d) { createInfoSection(nodesMap, d.id) });
  return nodeElements;
}

export function drawNodesLabels(nodes) {
  var nodeLabels = svg.selectAll(".node-label")
    .data(nodes)
    .enter()
    .append("text")
    .text(function (d) { return d.nome; })
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black");
  return nodeLabels;
}

export function drawLinkElements(links) {
  var linkElements = svg.selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke", function (d) { return d.color; });
  return linkElements;
}

export function drawLinkLabels(links) {
  var linkLabels = svg.selectAll(".link-label")
    .data(links)
    .enter()
    .append("text")
    .text(function (d) { return d.label; })
    .attr("class", "link-label")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black");
  return linkLabels;
}

// Funzione di callback per mostrare la finestra pop-up
function showInfoPopup(nodesMap, id) {
  // Crea un elemento div per la finestra pop-up
  var popup = document.createElement("div");
  var nodo = nodesMap.get(id)
  popup.className = "popup";
  popup.innerHTML =
    "Nome personaggio: " + nodo.nome + "<br>" +
    nodo.tipo + " interpretato da " + nodo.giocatore + "<br>" +
    "Ruolo: " + nodo.ruolo + "<br>" +
    "Età: " + nodo.età + "<br>" +
    "Tratti: " + nodo.tratti + "<br>" +
    "Movente: " + nodo.movente;

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

function createNodePopup(event, nodes, nodeElements, nodesIds, nodesMap) {
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
      popup.remove()
      graphManager.createNode(nodes, nodeElements, nodesIds, nodesMap);
    });

  // Aggiungi un pulsante per chiudere il popup
  popup.append("button")
    .text("Chiudi")
    .on("click", function () {
      popup.remove();
    });
}
