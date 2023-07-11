import { createInfoSection } from "./infoSection.js";
import * as idHandler from './idHandler.js';

window.addEventListener('DOMContentLoaded', function () {
  var parentElement = document.getElementById("svg-container");
  var parentWidth = parentElement.clientWidth;
  var parentHeight = parentElement.clientHeight;

  // Carica il file JSON
  d3.json("dataGraph.json").then(function (data) {
    // Funzione di callback che viene chiamata quando il file JSON è stato caricato correttamente

    var svg = d3.select("#svg-container")
      .append("svg")
      .attr("width", parentWidth)
      .attr("height", parentHeight)
      .on("contextmenu", function (event) {
        // Previeni il comportamento predefinito del browser
        event.preventDefault();
        createNodePopup();
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
    console.log("Array filtrati")
    console.log(nodesIds)
    console.log(linksIds)


    // Crea i link del grafo
    var linkElements = svg.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", function (d) { return d.color; });

    // Aggiungi l'etichetta a ogni link
    var linkLabelElements = svg.selectAll(".link-label")
      .data(links)
      .enter()
      .append("text")
      .text(function (d) { return d.label; })
      .attr("class", "link-label")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "black");

    // Crea i nodi del grafo
    var nodeElements = svg.selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", parentWidth / 100)
      .attr("fill", "red")
      .on("mouseover", function (event, d) { showInfoPopup(d.id) })
      .on("mouseout", removeInfoPopup)
      .on("click", function (event, d) { createInfoSection(nodesMap, d.id) });

    // Aggiungi l'etichetta a ogni nodo
    var nodeLabelElements = svg.selectAll(".node-label")
      .data(nodes)
      .enter()
      .append("text")
      .text(function (d) { return d.nome; })
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "black");

    // Aggiorna la posizione dei nodi e dei link ad ogni iterazione
    d3.forceSimulation(nodes)
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

      linkLabelElements
        .attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
        .attr("y", function (d) { return (d.source.y + d.target.y) / 2; });

      nodeLabelElements
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y - (parentWidth / 100 + 5); });
    }

    // Funzione di callback per mostrare la finestra pop-up
    function showInfoPopup(id) {
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

    function createNodePopup() {
      // Crea un elemento div per il popup
      const popup = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("left", event.clientX + "px")
        .style("top", event.clientY + "px")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("padding", "10px");

      // Aggiungi del testo al popup
      popup.append("p")
        .text("Hai cliccato con il tasto destro del mouse!");

      // Aggiungi un pulsante per chiudere il popup
      popup.append("button")
        .text("Chiudi")
        .on("click", function () {
          popup.remove();
        });

    }



  })
    .catch(function (error) {
      // Funzione di callback per gestire eventuali errori durante il caricamento del file JSON
      console.log(error);
    });
});
