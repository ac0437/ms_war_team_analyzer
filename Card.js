const url = "https://docs.google.com/spreadsheets/d/";
const ssid = "1jjf4mTIvjiemQvaCGjKoqnBkGO3X_iZ--nQb9V8mbt4";
const query1 = `/gviz/tq?`;
const endpoint1 = `${url}${ssid}${query1}`;



class CharacterCards extends HTMLElement {
  constructor() {
   super();
   this.table = document.querySelector('table');
   this.analysis = document.querySelector('.analysis');
   this.input = document.querySelector("input");
   this.searchButton = document.querySelector(".search-button");
   this.resetButton = document.querySelector(".reset-button");
   console.log("Input", this.input);
   console.log(this.createCharactesrCards());
   this.createCharactesrCards()
   .then(characters => {
      characters.forEach(character => {
        const characterObject = {
          name: character.c[0].v,
          isBanned: character.c[1].v,
          isStunner: character.c[2].v,
          isChakraDrainer: character.c[3].v,
          isAOE: character.c[4].v,
          isHealer: character.c[5].v,
          hasCounterOrReflect: character.c[6].v
        }

        this.characterData.push(characterObject);
      });
      this.characterData.forEach(character => {
        this.createCardElement(character);
      })
    this.completeListOfCharacters = this.characterData;

    this.searchButton.addEventListener('click', (e) => {
      const filteredCharacters = this.characterData.filter(character => {
        return character.name.toLowerCase().includes(this.input.value.toLowerCase());
      })
      this.innerHTML = ``;
      filteredCharacters.forEach(filteredCharacter => {
        this.createCardElement(filteredCharacter);
      });
    });

    this.resetButton.addEventListener('click', () => {
      this.innerHTML = ``;
      this.characterData.forEach(filteredCharacter => {
        this.createCardElement(filteredCharacter);
      });
    })
   })
  }

  selected = [];
  characterData = [];
  completeListOfCharacters = [];

  async createCharactesrCards() {
    const response = await fetch(endpoint1)
      .then(res => res.text())
      .then(data => {
        const temp = data.substr(47).slice(0,-2); 
        const json = JSON.parse(temp);
        const rows = json.table.rows;
        rows.shift();
        return rows;
    })

    return response;
  }

  createCardElement(character) {
    this.innerHTML += `
      <div class="card card1"">
        <h3 class="character-name">
          ${character.name}
        </h3>
        <div class="details">
          <div>Banned: ${character.isBanned}</div>
          <div>Stunner: ${character.isStunner}</div>
          <div>Chakra Drainer: ${character.isChakraDrainer}</div>
          <div>Has AOE: ${character.isAOE}</div>
          <div>Healer: ${character.isHealer}</div>
          <div>Has a Counter/Reflect: ${character.hasCounterOrReflect}</div>
        </div>
        <button class="select-button button" data-name="${character.name}">Select</button>
      </div> 
    `;

    this.buttons = document.querySelectorAll('.select-button');
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        if(this.table.querySelector('tbody').children.length >= 4) return;
        const characterSelected = this.characterData.filter(character => {
          return character.name === e.target.dataset.name;
        })[0];
        this.selected.push(characterSelected);
        this.selectCharacter(characterSelected);
        e.target.disabled = true;
      });
    })
  }

  selectCharacter(selectedCharacter) {
    if(this.table.querySelector('tbody').children.length >= 3) {
      this.anaylsisTeam();
    }
    if(this.table.querySelector('tbody').children.length > 0) {
      console.log("children", this.table.querySelector('tbody').children.length)
      this.table.classList.remove('hide');
      this.analysis.classList.remove('hide');
    }
    if(this.table.querySelector('tbody').children.length < 4) {
      const characterRow = document.createElement('tr');
      characterRow.innerHTML += `
        <tr>
          <td data-cell="Name">${selectedCharacter.name}</td>
          <td data-cell="Banned">${selectedCharacter.isBanned}</td>
          <td data-cell="Stunner">${selectedCharacter.isStunner}</td>
          <td data-cell="Chakra Drainer">${selectedCharacter.isChakraDrainer}</td>
          <td data-cell="AOE">${selectedCharacter.isAOE}</td>
          <td data-cell="Healer">${selectedCharacter.isHealer}</td>
          <td data-cell="Counter/Reflect">${selectedCharacter.hasCounterOrReflect}</td>
          <td data-cell="Remove Character"><button class="remove-character button">Remove</button></td>
        </tr>
      `;

      characterRow.querySelector(".remove-character").addEventListener('click', () => this.removeCharacter(characterRow, selectedCharacter.name));
      this.table.querySelector('tbody').appendChild(characterRow);
      this.addTableARIA();
    }
  }

  removeCharacter(row, characterName) {
    console.log("children", this.table.querySelector('tbody').children.length)
    if(this.table.querySelector('tbody').children.length <= 2) {
      this.table.classList.add('hide');
      this.analysis.textContent = ``;
      this.analysis.classList.add('hide');
    }
    row.remove();
    this.selected = this.selected.filter(character => character.name !== characterName);
    this.buttons.forEach(button => {
      if(button.dataset.name === characterName) button.disabled = false;
    })
  };

  anaylsisTeam() {
    this.analysis.textContent = ``;
     const checkForBannedCharacters = this.selected.filter(character => character.isBanned === "Yes");
     const checkForStunners = this.selected.filter(character => character.isStunner === "Yes");
     const checkForChakraDrain = this.selected.filter(character => character.isChakraDrainer === "Yes");
     const checkForAoe = this.selected.filter(character => character.isAOE === "Yes");
     const checkForHealers = this.selected.filter(character => character.isHealer === "Yes");
     const checkForCountersOrReflects = this.selected.filter(character => character.hasCounterOrReflect === "Yes");

     if(checkForBannedCharacters.length >= 1) {
      const checkForCharacters = checkForBannedCharacters.map(character => character.name);
      const illegalCharacters = checkForCharacters.join(", ");
      this.analysis.textContent = `Illegal, ${illegalCharacters} are banned\n`;
      this.analysis.style.color = "red";
     }
     if(checkForStunners.length > 2) {
      this.analysis.textContent =`Illegal this is a full stun team`;
      this.analysis.style.color = "red";
     }
     if(checkForChakraDrain.length > 2) {
      this.analysis.textContent =`Illegal this is a full chakra drain team`;
      this.analysis.style.color = "red";
     }
     if(checkForAoe.length > 2) {
      this.analysis.textContent =`Illegal this is a full AOE team`;
      this.analysis.style.color = "red";
     }
     if(checkForHealers.length > 2) {
      this.analysis.textContent =`Illegal this is a full healer team`;
      this.analysis.style.color = "red";
     }
     if(checkForCountersOrReflects.length > 2) {
      this.analysis.textContent =`Illegal this is a full counter/reflect team`;
      this.analysis.style.color = "red";
     }
     if(checkForBannedCharacters.length < 1 && 
        checkForStunners.length < 3  && 
        checkForChakraDrain.length < 3 && 
        checkForAoe.length < 3 && 
        checkForHealers.length < 3 && 
        checkForCountersOrReflects.length < 3) {
      this.analysis.textContent =`This team is legal and ready to fight!`;
      this.analysis.style.color = "green";
     }

     this.analysis.scrollIntoView({
        behavior: "smooth"
     })
  }

  addTableARIA() {
    try {
      var allTables = document.querySelectorAll('table');
      for (var i = 0; i < allTables.length; i++) {
        if(allTables[i].getAttribute('role') !== 'table') {
          allTables[i].setAttribute('role','table');
        }
      }
      var allCaptions = document.querySelectorAll('caption');
      for (var i = 0; i < allCaptions.length; i++) {
        if(allCaptions[i].getAttribute('role') !== 'caption') {
          allCaptions[i].setAttribute('role','caption');
        }
      }
      var allRowGroups = document.querySelectorAll('thead, tbody, tfoot');
      for (var i = 0; i < allRowGroups.length; i++) {
        if(allRowGroups[i].getAttribute('rowgroup')) {
          allRowGroups[i].setAttribute('role','rowgroup');
        }
      }
      var allRows = document.querySelectorAll('tr');
      for (var i = 0; i < allRows.length; i++) {
        if(allRows[i].getAttribute('role') !== "row") {
          allRows[i].setAttribute('role','row');
        }
      }
      var allCells = document.querySelectorAll('td');
      for (var i = 0; i < allCells.length; i++) {
        if(allCells[i].getAttribute('role') !== 'cell') {
          allCells[i].setAttribute('role','cell');
        }
      }
      var allHeaders = document.querySelectorAll('th');
      for (var i = 0; i < allHeaders.length; i++) {
        if(allHeaders[i].getAttribute('role') !== 'columnheader') {
          allHeaders[i].setAttribute('role','columnheader');
        }
      }
      // this accounts for scoped row headers
      var allRowHeaders = document.querySelectorAll('th[scope=row]');
      for (var i = 0; i < allRowHeaders.length; i++) {
        if(allRowHeaders[i].getAttribute('role') !== 'rowheader') {
          allRowHeaders[i].setAttribute('role','rowheader');
        }
      }
    } catch (e) {
      console.log("AddTableARIA(): " + e);
    }
  }
}

customElements.define("character-card", CharacterCards);