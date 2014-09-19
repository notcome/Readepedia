var MWReader = {};

function extractMainHeading () {
  var heading = document.getElementById('firstHeading')
  heading.removeAttribute('id')
  heading.removeAttribute('class')
  if (heading.lastElementChild.className == 'mw-editsection')
    heading.removeChild(heading.lastElementChild);
  return heading;
}

function extractSubHeading (from) {
  var heading = document.createElement('h1');
  heading.id = from.firstElementChild.id;
  heading.innerText = from.firstElementChild.innerText;
  return heading;
}

function isHeading (element) {
  var match = element.tagName.match(/H[1-6]/);
  if (match && match[0] == element.tagName)
    return true;
  else
    return false;
}

function extractTOCInfo (node) {
  var toc = node.lastElementChild;

  var info = [];
  while (toc.firstElementChild) {
    info.push(parseTOCNode(toc.firstElementChild));
    toc.removeChild(toc.firstElementChild);
  }
  return info;
}

function parseTOCNode (node) {
  var anchor = node.firstElementChild;
  var href = anchor.href;
  var text = anchor.lastElementChild.innerText;
  node.removeChild(anchor);

  var children;
  if (node.lastElementChild)
    children = parseTOCNode(node.lastElementChild)

  return {
    href: href,
    text: text,
    children: children
  };
}

function constructDocument (content, container, delimiter) {
  while(content.firstElementChild) {
    var element = content.firstElementChild;

    if (isHeading(element)) {
      if (element.tagName <= delimiter)
        return;

      var section = document.createElement('section');

      var thisHeading = element.tagName;
      var newHeading = extractSubHeading(element);
      section.appendChild(newHeading);
      content.removeChild(element);

      constructDocument(content, section, thisHeading);
      element = section;
    }

    if (element.className == 'toc') {
      MWReader.TOC = extractTOCInfo(element);
      content.removeChild(element);
      continue;
    }

    container.appendChild(element);
  }
}

var main = document.createElement('main');
main.appendChild(extractMainHeading());

content = document.getElementById('mw-content-text');
constructDocument(content, main, 'H1');

document.body.innerHTML = '';
document.body.appendChild(main);
