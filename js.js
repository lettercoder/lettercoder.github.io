var buttonDemoCharacter = 'u';



var hexcharacters = "0123456789ABCDEF \u00a0";

var textelem = document.getElementById("textarea");
var textCursorPosition = 0;

var hexelem = document.getElementById("hexarea");


function hexunicodeFromCharCode(code) {
    var codeHex = code.toString(16).toUpperCase();
    while (codeHex.length < 4) {
        codeHex = "0" + codeHex;
    }
    return codeHex;
}

function createRange(node, chars, range) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count >0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
           for (var lp = 0; lp < node.childNodes.length; lp++) {
                range = createRange(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                    break;
                }
            }
        }
    } 

    return range;
};

function setCurrentCursorPosition(chars,elem) {
    if (chars >= 0) {
        var selection = window.getSelection();

        range = createRange(elem, { count: chars });

        if (range) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

var calcHex = function() {
	var outhex = "";
	for (var i=0;i<textelem.innerText.length;i++){
		if (i+1==textCursorPosition) outhex+="<span>";
		outhex += " "+hexunicodeFromCharCode(textelem.innerText.charCodeAt(i));
		if (i+1==textCursorPosition) outhex+="</span>";
	}
	hexelem.innerHTML=outhex;
};

var textChanged = function() {
	textCursorPosition = getCaretCharacterOffsetWithin(textelem);
	calcHex();
};


var hexChanged = function() {
	
	var hexcursor = getCaretCharacterOffsetWithin(hexelem);
	var hexinput = hexelem.innerText.toUpperCase();
	
	var lastTypedCharCode = hexinput.charCodeAt(hexinput.length-1);
	
	var hexcorrected = "";
	for (var i=0;i<hexinput.length;i++) {
		if (hexcharacters.includes(hexinput[i])) {
			hexcorrected += hexinput[i];
		}
	}
	
	if (lastTypedCharCode==43) {
		hexcorrected += hexcorrected.slice(hexcorrected.length-5);
	}
	
	hexelem.innerText = hexcorrected;
	setCurrentCursorPosition(hexcursor,hexelem);
	
	// check if input valid
	var hexChars = hexcorrected.split(" ");
	var dirty = false;
	for(var i=0;i<hexChars.length;i++) {
		if (hexChars[i].length!=4) {
			if (hexChars[i].length!=0) {
				if (hexChars[i]!=5 && hexChars[i].charCodeAt(4)!=0x00a0) {
					dirty = true;
				}
			}
		}
	}
	if (dirty) {
		hexelem.setAttribute('class','dirty');
		return;
	} else {
		hexelem.removeAttribute('class','dirty');
	}
	
	// replay to text area
	var newText = "";
	for(var i=0;i<hexChars.length;i++) {
		newText += String.fromCharCode(parseInt(hexChars[i],16));
	}
	textelem.innerText = newText;
	
};

textelem.addEventListener('keyup',textChanged,false);
textelem.addEventListener('mouseup',textChanged,false);
hexelem.addEventListener('keyup',hexChanged,false);

var unicodeButtonPressed = function(event) {
	var el = event.srcElement;
	btn = el;
	var text = textelem.innerText;
	var insert = btn.innerText;
	if (buttonDemoCharacter!=null) insert = insert.slice(1);
	var newtext = text.slice(0,textCursorPosition)+insert+text.slice(textCursorPosition);
	textelem.innerText = newtext;
	textCursorPosition++;
	calcHex();
};

var makeButtons = function() {
	var container = document.getElementById('unicodeBtnContainer');

	var lastgroup =rockets[0].group;
	for (var i=0;i<rockets.length;i++) {
		if (rockets[i].group!=lastgroup) {
			var br = document.createElement("br");
			container.appendChild(br);
		}
		lastgroup = rockets[i].group;
		var btn = document.createElement("button");
		btn.setAttribute('class','unicodeBtn');
		var insert = '&#x'+rockets[i].code+';';
		if (buttonDemoCharacter!=null) insert = buttonDemoCharacter+insert; 
		btn.innerHTML = insert;
		container.appendChild(btn);
		
	}

	var buttons = document.getElementsByClassName('unicodeBtn');
	for (var i=0;i<buttons.length;i++){
		buttons[i].addEventListener('click',unicodeButtonPressed,false);
	}
}


makeButtons();
