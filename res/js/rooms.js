/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function () {
    /*Gesamtes JSON Object laden um Liste damit zu befüllen*/

    $.getJSON("../res/rooms.json", function (data) {

        /*get all keys of the upper Layer*/
        var obj = Object.keys(data);
        /*First key of upper Layer is the position of the actual rooms (für den jeweiligen Bauteil) object*/
        JSONObject = data[obj[0]];
        /*First key is headline --> Bauteil*/
        var headline = document.createElement("h4");
        headline.setAttribute("id", "headline_BauteilA");
        var node = document.createTextNode(obj[0]);
        headline.appendChild(node);
        /*Element, das mit der Liste befüllt wird ist formList*/
        var element = document.getElementById("formList");
        element.appendChild(headline);
        /*unter der h4 kommt ein div welches eine ul enthält*/
        var div = document.createElement("div");
        div.className = "container";
        div.id = "divRaumliste";
        var unorderedList = document.createElement("ul");
        unorderedList.setAttribute("aria-labelledby", "headline_BauteilA");

        /*Go through all key value pairs within JSONObject*/
        $.each(JSONObject, function (key, val) {
            /*jedes li enthält ein a --> bei klick auf a wird die function getRoom fromList(this) ausgeführt*/
            var listElement = document.createElement("a");
            listElement.id = key;
            listElement.setAttribute("class", "listLink");
            listElement.setAttribute("tabindex", 0);
            node = document.createTextNode(val);
            listElement.setAttribute("aria-label", "Raumbelegung" + val);
            listElement.setAttribute("role", "toggle");
            listElement.appendChild(node);
            listElement.onclick = function () {
                getRoomfromList(this);
            };
            var list = document.createElement("li");
            list.appendChild(listElement);
            unorderedList.appendChild(list);
        });
        div.appendChild(unorderedList);
        element.appendChild(div);
    });
    /*Hinzufügen des onlick listeners für den Button bei Raumsuche*/
    var buttonSearch = document.getElementById("btnRaumsuche");
    buttonSearch.onclick = function () {
        checkInput();
    };
    var svg = document.getElementById("svg");
    svg.onclick = function () {
        loadQR();
    };
});
/*Überleitung zur Raumbelegung aus Liste*/
function getRoomfromList(a) {
    var text = a.innerHTML;
    getValidity(text, a.parentNode);
}
/*globale Variable um erneutes abfragen auf die Kamera zu vermeiden*/
var firstScan = true;
/*Function um QR zu scannen*/
function loadQR() {
    /*svg ausblenden*/
    var svg = document.getElementById("svg");
    var qrPlaceholder = document.getElementById("qrPlaceholder");
    svg.setAttribute("style", "display:none;");
    /*video einblenden*/
    var video = document.getElementById("preview");
    video.setAttribute("style", "display:default;");
    qrPlaceholder.appendChild(video);
    /*einmalige Einstellungen für QR-Scan*/
    if (firstScan) {
        firstScan = false;
        let scanner = new Instascan.Scanner({video: document.getElementById('preview')});

        scanner.addListener('scan', function (content) {
            /*content= z.B. A2.06 --> Übergabe an die Funktion getValidity*/
            getValidity(content, document.getElementById("addQRdata"));
            /*svg einblenden*/
            var svg = document.getElementById("svg");
            svg.setAttribute("style", "display:default;");
            /*video ausblenden*/
            var video = document.getElementById("preview");
            video.setAttribute("style", "display:none;");
        });

        Instascan.Camera.getCameras().then(function (cameras) {

            if (cameras.length > 0) {
                scanner.start(cameras[0]);
            } else {

                console.error('No cameras found.');
            }
        }).catch(function (e) {

            console.error(e);

        });
    }
}
/*Überprüfe ob ein Input vorhanden*/
function checkInput() {

    var input = document.getElementById("roomSearch");
    if (input.value === "") {
        alert("Bitte Geben Sie einen Raum ein!");
    } else {
        var element = document.getElementById("formSearch");
        checkRoom(input.value, element);
    }
}
/*Überprüfe den Input auf Richtigkeit bzw. ob er in der Liste der verfügbaren Räume vorhanden ist*/
function checkRoom(text, element) {
    var check = false;

    var aArray = document.getElementsByClassName("listLink");
    /*check wird auf true gesetzt wenn text in der Liste vorhanden in den Formaten EDVA206 EDV_A2.06 A2.06*/
    for (var i = 0; i < aArray.length; i++) {
        
        if (aArray[i].innerHTML === text) {
            /*case EDV_A2.06*/
            check = true;
        } else if (7 === text.length) {
             /*case EDVA206*/
            var array1 = aArray[i].innerHTML.split("_");
            var array2 = array1[1].split(".");
            var string = array1[0] + array2[0] + array2[1];

            if (text === string) {
                check = true;
                text = array1[0] + "_" + array2[0] + "." + array2[1];
            }
        } else {
            /*case A2.06*/
            var splitArray = aArray[i].innerHTML.split("_");
            if (splitArray[1] === text) {
                check = true;
            }
        }
        if (check === true)
            i = aArray.length;//raus aus der Schleife, wenn true
    }

    if (check === true) {
        console.log("room valid");
        getValidity(text, element);
    } else {
        alert("Der eingegebene Raum ist ungültig!");
    }
}

/*Verbindungsaufbau xml + heutiges Datum */
function getValidity(text, element) {

    /*zur Überprüfung des Datums und fürs korrekte Format*/
    var currentdate = new Date();
    var datum = ((((currentdate.getDate()+10) < 10) ? "0" : "") + (currentdate.getDate() + 10)) + "." //+10 muss noch weg!
            + (((currentdate.getMonth() + 1) < 10) ? "0" : "") + (currentdate.getMonth() + 1) + "."
            + (currentdate.getFullYear() - 1);
    var uhrzeit = (((currentdate.getHours() < 10) ? "0" : "") + (currentdate.getHours())) + ":"
            + ((currentdate.getMinutes() < 10) ? "0" : "") + currentdate.getMinutes() + ":"
            + ((currentdate.getSeconds() < 10) ? "0" : "") + currentdate.getSeconds();
    /*Abänderung des textes z.B. A2.06 --> EDVA206 oder EDV_A2.06 --> EDVA206*/
    if (element !== document.getElementById("addQRdata")) {
        if (text.length > 5) {
            var array1 = text.split("_");
            var array2 = array1[1].split(".");
            text = array1[0] + array2[0] + array2[1];
        } else {
            var array2 = text.split(".");
            text = "EDV" + array2[0] + array2[1];
        }
    }
    /*Start HTTP Request*/
    var xhr = new XMLHttpRequest();

    /*Verbindungsaufbau zu xml Datei mit Namen text.xml*/
    xhr.open("GET", "../res/" + text + ".xml?", true);

    /*festlegen des response Types (If specified, responseType must be empty string or "document")*/
    xhr.responseType = 'document';

    /*Um Jedenfalls ein XML Objekt bzw. Dokument zu erhalten (overrideMimeType() can be used to force the response to be parsed as XML)*/
    xhr.overrideMimeType('text/xml');
    console.log("onload");
    xhr.onload = function () {

        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
                console.log(xhr.response);
                console.log(xhr.responseXML);
                /*Überprüfe ob xml Dokument zum gewünschtem Raum passt*/
                var x = xhr.responseXML.getElementsByTagName("Saalplan")[0];
                var y = x.getAttribute("raum");
                if (y === text) {
                    doSomethingXML(xhr.responseXML, element, datum, uhrzeit);
                } else {
                    alert("Die Verbindung wurde zum falschem .xml Dokument aufgebaut!");
                }
            }
        }
    };
    xhr.send();
    console.log("send");
}
function doSomethingXML(xml, element, datum, uhrzeit) {

    console.log(datum + " @ " + uhrzeit);
    /*Erstellen eines div indem anschließend die Informationen aus dem xml dargestellt werden*/
    var newDiv = document.createElement("div");
    newDiv.className = "container";
    var splitD = datum.split(".");
    var nameString = "";
    /*wenn QR-Scan oder Suche --> wird zu dem Datum auch der Raum angezeigt (--> nameString)*/
    if ((element === document.getElementById("addQRdata")) || ((element === document.getElementById("formSearch")))) {

        var name = xml.getElementsByTagName("Saalplan")[0];
        var tempString = (name.getAttribute("raum")).substring(3);
        var part2 = tempString.substring(2);
        var part1 = tempString.substring(0, 2);
        var nameString = ": " + part1 + "." + part2;


    }
    var h5 = document.createElement("h5");
    var stringDate = splitD[2] + "-" + splitD[1] + "-" + splitD[0];
    var d = new Date(stringDate);
    var weekday = new Array(7);
    weekday[0] = "So ";
    weekday[1] = "Mo ";
    weekday[2] = "Di ";
    weekday[3] = "Mi ";
    weekday[4] = "Do ";
    weekday[5] = "Fr ";
    weekday[6] = "Sa ";
    
    /*Icon X um newDiv zu schließen*/
    var icon = document.createElement("i");
    icon.setAttribute("class", "material-icons");
    icon.setAttribute("style", "font-size:30px;color:#0C6DA1;");
    icon.setAttribute("tabIndex", "0");
    icon.setAttribute("aria-label", "Raumbelegung schließen");
    icon.innerHTML = "close";
    icon.onclick = function () {
        deleteNode(this);
    };
    h5.innerHTML = weekday[d.getDay()] + datum + nameString;
    h5.appendChild(icon);

    var timeCheck = 0;
    /*Überprüfen jedes Elements des xml Dokuments auf das Datum*/
    for (var i = 0; i < xml.getElementsByTagName("Datum").length; i++) {
        var child = xml.getElementsByTagName("Datum")[i];
        var content = child.childNodes[0];
        /*wenn Datum übereinstimmt -->  row wird erstellt und hinzugefügt*/
        if (content.nodeValue === datum) {
            var parent = child.parentNode;
            /*Reihe je LV*/
            var row = document.createElement("div");
            row.setAttribute("class", "row customRow");
            /*Spalte für Uhrzeit*/
            var col1 = document.createElement("div");
            col1.setAttribute("class", "col-lg-2 col-md-3 col-sm-4 col-xs-12");
            var x = parent.getElementsByTagName("Von")[0];
            var vonNode = x.childNodes[0];
            x = parent.getElementsByTagName("Bis")[0];
            var bisNode = x.childNodes[0];
            col1.innerHTML = vonNode.nodeValue + "-" + bisNode.nodeValue;
            col1.setAttribute("aria-label", "Von-Bis");
            col1.setAttribute("tabIndex", "0");
            row.appendChild(col1);
            /*Spalte für LV Name*/
            var col2 = document.createElement("div");
            col2.setAttribute("class", "col-lg-10 col-md-9 col-sm-8 col-xs-12 addPadd");
            col2.setAttribute("aria-label", "Lehrfach");
            col2.setAttribute("tabIndex", "0");
            x = parent.getElementsByTagName("Lehrfach")[0];
            var LVNode = x.childNodes[0];
            col2.innerHTML = LVNode.nodeValue;
            row.appendChild(col2);

            /*beim 1. eintrag wird die zeitliche Gültigkeit überprüft*/
            if (newDiv.childNodes.length === 0) {
                var vonXML = vonNode.nodeValue.split(":")[0] + ":" + vonNode.nodeValue.split(":")[1];
                var bisXML = bisNode.nodeValue.split(":")[0] + ":" + bisNode.nodeValue.split(":")[1];
                var current = uhrzeit.split(":")[0] + ":" + uhrzeit.split(":")[1];
                var dayOver = 0;
                var tempDate = dateAdd();//+ 45min 
                /*datumTemp und uhrzeitTemp um zu bestimmen ob die LV in kürze startet*/
                var datumTemp = ((((tempDate.getDate()+10) < 10) ? "0" : "") + (tempDate.getDate() + 10)) + "." //+10 muss noch weg!
                        + (((tempDate.getMonth() + 1) < 10) ? "0" : "") + (tempDate.getMonth() + 1) + "."
                        + (tempDate.getFullYear() - 1);
                var uhrzeitTemp = (((tempDate.getHours() < 10) ? "0" : "") + tempDate.getHours()) + ":"
                        + ((tempDate.getMinutes() < 10) ? "0" : "") + tempDate.getMinutes() + ":"
                        + ((tempDate.getSeconds() < 10) ? "0" : "") + tempDate.getSeconds();
                /*falls ein Überlauf*/
                if (datum !== datumTemp)
                    dayOver = 1;
                /*format ändern um Funktion compareTime anzuwenden*/
                var current45 = uhrzeitTemp.split(":")[0] + ":" + uhrzeitTemp.split(":")[1];
                /*kategorisierung --> Einfärbung des Icons schedule und der h5*/
                if (compareTime(bisXML, current) <= 0) {
                    console.log("LV ist bereits vorüber");
                    continue;
                } else if (compareTime(vonXML, current) <= 0) {
                    console.log("LV findet derzeit statt");
                    timeCheck = 1;
                    h5.setAttribute("style", "color:red");
                    newDiv.appendChild(h5);
                } else if ((dayOver === 0) && (compareTime(vonXML, current45) <= 0)) {
                    console.log("LV findet inkürze statt");
                    timeCheck = 2;
                    h5.setAttribute("style", "color:orange");
                    newDiv.appendChild(h5);
                } else if ((dayOver === 1)) {
                    console.log("LV findet am nächsten Tag statt");
                    timeCheck = 0;
                    h5.setAttribute("style", "color:green");
                    newDiv.appendChild(h5);
                } else {
                    console.log("LV findet in Zukunft statt");
                    timeCheck = 0;
                    h5.setAttribute("style", "color:green");
                    newDiv.appendChild(h5);
                }
            }
            /*Icon für Raumbelegung*/
            var icon = document.createElement("i");
            icon.setAttribute("class", "material-icons iconCustom");
            if (timeCheck === 0) {
                icon.setAttribute("style", "font-size:20px;color:green;");
                icon.setAttribute("aria-label", "Raum frei");
            } else if (timeCheck === 1) {
                icon.setAttribute("style", "font-size:20px;color:red;");
                icon.setAttribute("aria-label", "Raum besetzt");
            } else if (timeCheck === 2) {
                icon.setAttribute("style", "font-size:20px;color:orange;");
                icon.setAttribute("aria-label", "Raum in kürze besetzt");
            }
            icon.innerHTML = "schedule";
            icon.setAttribute("role", "status");
            /*elemente zu newDiv hinzufügen*/
            col2.appendChild(icon);
            newDiv.appendChild(row);
        }
    }
    /*falls keine row bzw. keine LV hinzugefügt wurde --> nächste LV findet am nächsten Tag statt*/
    if (newDiv.childNodes.length === 0) {
        h5.setAttribute("style", "color:green");
        newDiv.appendChild(h5);
    }
    /*remove old div before adding new*/
    for (var i = 0; i < element.childNodes.length; i++) {
        if (element.childNodes[i].className === "container") {
            element.removeChild(element.childNodes[i]);
            break;
        }
    }
    newDiv.setAttribute("aria-label", "Informationen zum Raum");
    newDiv.setAttribute("tabIndex", "0");
    /*wenn zumindest eine Reihe mit LV da ist*/
    if (newDiv.childNodes.length > 1) {
        element.appendChild(newDiv);
    } else {
        /*nur heading ist da*/
        var row = document.createElement("div");
        row.setAttribute("class", "row customRow");
        var col1 = document.createElement("div");
        col1.setAttribute("class", "col-xs-12");
        col1.setAttribute("tabIndex", "0");
        var textNode = document.createTextNode("Heute sind keine weiteren LVs!");
        col1.appendChild(textNode);
        row.appendChild(col1);
        newDiv.appendChild(row);
        element.appendChild(newDiv);
    }
}
/*compareTime fürs format hh:mm*/
function compareTime(str1, str2) {
    if (str1 === str2) {
        return 0;
    }
    var time1 = str1.split(':');
    var time2 = str2.split(':');
    if (eval(time1[0]) > eval(time2[0])) {
        return 1;
    } else if (eval(time1[0]) === eval(time2[0]) && eval(time1[1]) > eval(time2[1])) {
        return 1;
    } else {
        return -1;
    }
}
/*returns current Date + 45min*/
function dateAdd() {
    var ret = new Date(); 
    ret.setTime(ret.getTime() + 45 * 60000);
    return ret;
}
/*deletes newDiv*/
function deleteNode(icon) {
    var heading = icon.parentNode;
    var div = heading.parentNode;
    var divParent = div.parentNode;
    divParent.removeChild(div);

    if (divParent === document.getElementById("addQRdata")) {
        /*wenn QR-Scan blende svg ein und video aus*/
        var svg = document.getElementById("svg");
        svg.setAttribute("style", "display:default;");
        var video = document.getElementById("preview");
        video.setAttribute("style", "display:none;");
    }
}
/*Eventhandling wenn Enter pressed*/
$(function () {
    $(document).on('keypress', function (e) {
        /*13 --> Enter*/
        if (e.which === 13) {

            if (document.activeElement.getAttribute("class") === "listLink") {
                var check = 0;
                var element = document.activeElement.parentNode;
                /*wenn newDiv bei Listenelement vorhanden, dann wird es gelöscht*/
                for (var i = 0; i < element.childNodes.length; i++) {
                    if (element.childNodes[i].className === "container") {
                        element.removeChild(element.childNodes[i]);
                        check = 1;

                        break;
                    }
                }
                /*wenn nicht vorhanden, dann wird eines hinzugefügt*/
                if (check === 0)
                    getRoomfromList(document.activeElement);


            } else if (document.activeElement.getAttribute("role") === "button") {
                /*mit Enter auf btn Raumsuche starten*/
                checkInput();
            } else if (document.activeElement.getAttribute("aria-label") === "Um QR-Code zuscannen Klicken") {
                 /*mit Enter auf svg QR scan starten*/
                loadQR();
            } else if (document.activeElement.getAttribute("aria-label") === "Raumbelegung schließen") {
                /*mit enter auf icon close newDiv schließen*/
                deleteNode(document.activeElement);
            }
        }
    });
});
/*Event Enter bei Inputfeld der Raumsuche handeln*/
$('#roomSearch').keypress(function (e) {
    if (e.which === 13) {
        e.preventDefault();
        checkInput();
    }
});