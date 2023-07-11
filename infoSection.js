export function createInfoSection(nodeMap, id) {
    var nodo = nodeMap.get(id)

    // Controlla che non esista già la info section
    var existingInfoSection = document.querySelector(".info-section");
    if (existingInfoSection) {
        existingInfoSection.remove();
    }

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

    // Aggiungi le informazioni del nodo alla sezione delle informazioni
    var nomeLabel = document.createElement("label");
    nomeLabel.innerHTML = "Nome:";
    infoSection.appendChild(nomeLabel);
    var nomeInput = document.createElement("input");
    nomeInput.type = "text";
    nomeInput.value = nodo.nome;
    infoSection.appendChild(nomeInput);

    var giocatoreLabel = document.createElement("label");
    giocatoreLabel.innerHTML = "Giocatore:";
    infoSection.appendChild(giocatoreLabel);
    var giocatoreInput = document.createElement("input");
    giocatoreInput.type = "text";
    giocatoreInput.value = nodo.giocatore;
    infoSection.appendChild(giocatoreInput);

    var ruoloLabel = document.createElement("label");
    ruoloLabel.innerHTML = "Ruolo:";
    infoSection.appendChild(ruoloLabel);
    var ruoloInput = document.createElement("input");
    ruoloInput.type = "text";
    ruoloInput.value = nodo.ruolo;
    infoSection.appendChild(ruoloInput);

    var trattiLabel = document.createElement("label");
    trattiLabel.innerHTML = "Tratti:";
    infoSection.appendChild(trattiLabel);
    var trattiInput = document.createElement("input");
    trattiInput.type = "text";
    trattiInput.value = nodo.tratti;
    infoSection.appendChild(trattiInput);

    var infoLabel = document.createElement("label");
    infoLabel.innerHTML = "Info:";
    infoSection.appendChild(infoLabel);
    var infoInput = document.createElement("textarea");
    infoInput.value = nodo.info;
    infoSection.appendChild(infoInput);

    var backgroundLabel = document.createElement("label");
    backgroundLabel.innerHTML = "Background:";
    infoSection.appendChild(backgroundLabel);
    var backgroundInput = document.createElement("textarea");
    backgroundInput.value = nodo.background;
    infoSection.appendChild(backgroundInput);

    //Aggiungi la sezione info al corpo della pagina
    document.body.appendChild(infoSection);
}