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
      .attr("height", parentHeight);

    // Definisci i dati del grafo e crea una mappa per associare gli ID dei nodi ai nodi stessi 
    var nodes = data.nodes;
    var links = data.links;
    var nodeMap = new Map();

    // Crea gli elementi del grafo
    nodes.forEach(function (node) {
      nodeMap.set(node.id, node);
    });

    // Crea i link del grafo
    var linkElements = svg.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", function (d) { console.log(d); return d.color; });

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
      .on("mouseover", function (event, d) { showPopup(d.id) })
      .on("mouseout", hidePopup)
      .on("click", function (event, d) { createInfoSection(d.id) });

    // Aggiungi l'etichetta a ogni nodo
    var nodeLabelElements = svg.selectAll(".node-label")
      .data(nodes)
      .enter()
      .append("text")
      .text(function (d) { console.log(d); return d.nome; })
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
    function showPopup(id) {
      // Crea un elemento div per la finestra pop-up
      var popup = document.createElement("div");
      var nodo = nodeMap.get(id)
      popup.className = "popup";
      popup.innerHTML =
        "Nome personaggio: " + nodo.nome + "<br>" +
        "Tipo: " + nodo.tipo + "<br>" +
        "Nome giocatore: " + nodo.giocatore + "<br>" +
        "Ruolo: " + nodo.ruolo + "<br>" +
        "Info: " + nodo.info + "<br>" +
        "Tratti: " + nodo.tratti;

      // Posiziona la finestra pop-up sopra il nodo corrente
      popup.style.top = (nodo.y + parentElement.offsetTop - 150) + "px";
      popup.style.left = (nodo.x + parentElement.offsetLeft - 100) + "px";
      // Aggiungi la finestra pop-up al documento
      document.body.appendChild(popup);
    }

    // Funzione di callback per nascondere la finestra pop-up
    function hidePopup() {
      // Rimuovi tutti gli elementi con la classe "popup"
      var popups = document.getElementsByClassName("popup");
      while (popups.length > 0) {
        popups[0].parentNode.removeChild(popups[0]);
      }
    }

    function createInfoSection(id) {
      var nodo = nodeMap.get(id)
      // Crea un elemento div per la sezione delle informazioni
      var infoSection = document.createElement("div");
      var title = document.createElement("h2");
      infoSection.className = "info-section";
      title.innerHTML = nodo.nome;
      infoSection.appendChild(title);

      // Aggiungi un pulsante per chiudere la sezione delle informazioni
      var closeButton = document.createElement("button");
      closeButton.className = "close-button";
      closeButton.innerHTML = "X";
      closeButton.onclick = function () {
        infoSection.remove();
      };
      infoSection.appendChild(closeButton);
      document.body.appendChild(infoSection);
    }

  })
    .catch(function (error) {
      // Funzione di callback per gestire eventuali errori durante il caricamento del file JSON
      console.log(error);
    });
});
