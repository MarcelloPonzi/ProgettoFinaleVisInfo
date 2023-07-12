export function createInfoSection(nodeMap, id) {
    var nodo = nodeMap.get(id);

    // Controlla che non esista già la info section
    var existingInfoSection = d3.select(".info-section");
    if (!existingInfoSection.empty()) {
        existingInfoSection.remove();
    }

    // Crea un elemento div per la sezione delle informazioni
    var infoSection = d3.select("body")
        .append("div")
        .attr("class", "info-section");

    infoSection.append("h2")
        .text(nodo.nome);

    // Aggiungi un pulsante per chiudere la sezione delle informazioni
    infoSection.append("button")
        .attr("class", "close-button")
        .text("X")
        .on("click", function () {
            infoSection.remove();
        });

    // Aggiungi le informazioni del nodo alla sezione delle informazioni
    infoSection.append("label")
        .text("Nome:");
    infoSection.append("input")
        .attr("type", "text")
        .attr("value", nodo.nome);

    infoSection.append("label")
        .text("Giocatore:");
    infoSection.append("input")
        .attr("type", "text")
        .attr("value", nodo.giocatore);

    infoSection.append("label")
        .text("Ruolo:");
    infoSection.append("input")
        .attr("type", "text")
        .attr("value", nodo.ruolo);

    infoSection.append("label")
        .text("Tratti:");
    infoSection.append("input")
        .attr("type", "text")
        .attr("value", nodo.tratti);

    infoSection.append("label")
        .text("Info:");
    infoSection.append("textarea")
        .text(nodo.info);

    infoSection.append("label")
        .text("Background:");
    infoSection.append("textarea")
        .text(nodo.background);
}
