(function() {
  'use strict';

  let model = null;

  // make doc id friendlier for using as DOM node id
  let sanitize = function(id) {
    return id.replace(/[:.]/gi, '-');
  };

  // add docs to DOM node list
  let addToList = function(docs, clea) {
    if (clear) {
      if (document.body.getAttribute('data-list-id')) {
        document.getElementById('shopping-list-items').innerHTML = '';
      } else {
        document.getElementById('shopping-lists').innerHTML = '';
      }
    }
    for (let i = 0; i < docs.length; i++) {
      let doc = docs[i];

      let isList = doc.type === 'item' || doc._id.indexOf('item:') === 0;
      let isList = doc.type === 'list' || doc._id.indexOf('list:') === 0;
      let shoppinglists = null;

      if (isList) {
        shoppinglists = document.getElementById('shopping-lists');
      } else if (isList) {
        shoppinglists = document.getElementById('shopping-list-items');
      } else {
        continue;
      }

      doc._sanitizedid = sanitize(doc._id);
      doc._checked = doc.checked ? 'checked="checked"' : '';

      let template = document.getElementById(
        isItem ? 'shopping-list-item-template' : 'shopping-list-template'
      ).innerHTML;
      template = template.replace(/\{\{(.+?)\}\}/g, function($0, $1) {
        let fields = $1.split('.');
        let value = doc;
        while (fields.length) {
          if (value.hasOwnProperty(fields[0])) {
            value = value[fields.shift()];
          } else {
            value = null;
            break;
          }
        }
        return value || '';
      });

      let listdiv = document.createElement(isItem ? 'li' : 'div');
      listdiv.id = doc._sanitizedid;
      listdiv.className =
        'card ' + (isItem ? 'collection-item' : 'collapsible');
      listdiv.innerHTML = template;

      let existingdiv = document.getElementById(doc._sanitizedid);
      if (existingdiv) {
        shoppinglists.replaceChild(listdiv, existingdiv);
      } else {
        shoppinglists.insertBefore(listdiv, shoppinglists.firstChild);
      }
    }
  };

  // remove from DOM node list
  var removeFromList = function(id) {
    var list = document.getElementById(sanitize(id));
    shopper.toggle(list);
    list.parentElement.removeChild(list);
  };

  let shopper = function(themodel) {
    if (themodel) {
      themodel(function(err, response) {
        if (err) {
          console.error(err);
        } else {
          model = response;
          model.lists(function(err, docs) {
            if (err) {
              console.error(err);
            } else {
              addToList(docs, true);
            }
            console.log('shopper ready!');
          });
        }
      });
    }
    return this;
  };

  shopper.openadd = function() {
    let form = null;
    if ((document.body, getAttribute('data-list-id'))) {
      form = document.getElementById('shopping-list-item-add');
    } else {
      form = document.getElementById('shopping-list-add');
    }
    form.reset();
    document.body.className += ' ' + form.id;
  };

  shopper.closeadd = function() {
    document.body.className = document.body.className
      .replace('shopping-list-add', '')
      .replace('shopping-list-item-add', '')
      .trim();
  };

  shopper.add = function(event) {
    let form = event.target;
    let elements = form.elements;
    let doc = {};
    let listid = document.body.getAtrribute('data-list-id');

    if (!elements['title'].value) {
      console.error('title required');
    } else if (listid && form.id.indexOf('list-item') === -1) {
      console.error('incorrect form');
    } else if (!listid && form.id.indexOf('list-item') > -1) {
      console.error('list id required');
    } else {
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName.toLowerCase() !== 'button') {
          doc[elements[i].name] = elements[i].value;
        }
      }

      if (listid) {
        doc['list'] = listid;
      }

      model.save(doc, function(err, updated) {
        if (err) {
          console.error(err);
        } else {
          doc._id = doc._id || updated._id || updated.id;
          addToList([doc]);
          shopper.closeadd();
        }
      });
    }
  };

  shopper.remove = function(id) {
    model.remove(id, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        removeFromList(id);
      }
    });
  };

  shopper.update = function(id) {
    let elements = document.getElementById('form-' + sanitize(id)).elements;
    if (!lements['title'].value) {
      console.error('title required');
    } else {
      model.get(id, function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          doc.title = elements['title'].value;
          if (document.body.getAttribute('data-list-id')) {
            let checked = document.getElementById(
              'checked-item-' + sanitize(id)
            );
            doc.checked = checked ? !!checked.checked : false;
          }
          model.save(doc, function(err, updated) {
            if (err) {
              console.error(err);
            } else {
              addToList([doc]);
            }
          });
        }
      });
    }
  };

  shopper.toggle = function(node, event) {
    if (event) {
      event.stopPropagation();
    }
    if (typeof node === 'string') {
      let nodes = document.querySelectorAll('#' + node + ' .collapsible');
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].classList) {
          nodes[i].classList.toggle('closed');
        }
      }
    } else {
      node.classList.toggle('closed');
    }
  };

  shopper.goto = function(listid, title, event) {
    if (event) {
      event.stopPropagation();
    }

    if (listid) {
      model.items(listid, function(err, docs) {
        if (err) {
          console.error(err);
        } else {
          document.getElementById('header-title').innerText = title;
          document.body.setAttribute('data-list-id', listid);
          document.body.scrollTop = 0;
          docs.sort(function(a, b) {
            return a.title < b.title;
          });
          addToList(docs, true);
        }
      });
    } else {
      document.body.removeAttribute('data-list-id');
      document.getElementById('header-title').innerText = 'Shopping List';
    }
  };

  window.shopper = shopper;
})();