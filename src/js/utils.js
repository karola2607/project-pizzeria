/* global Handlebars, dataSource */

export const utils = {}; // eslint-disable-line no-unused-vars

export utils.createDOMFromHTML = function(htmlString) {
  let div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

export utils.createPropIfUndefined = function(obj, key, value = []){
  if(!obj.hasOwnProperty(key)){
    obj[key] = value;
  }
};

export utils.serializeFormToObject = function(form){
  let output = {};
  if (typeof form == 'object' && form.nodeName == 'FORM') {
    for (let field of form.elements) {
      if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
        if (field.type == 'select-multiple') {
          for (let option of field.options) {
            if(option.selected) {
              utils.createPropIfUndefined(output, field.name);
              output[field.name].push(option.value);
            }
          }
        } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
          utils.createPropIfUndefined(output, field.name);
          output[field.name].push(field.value);
        } else if(!output[field.name]) output[field.name] = [];
      }
    }
  }
  return output;
};

export utils.convertDataSourceToDbJson = function(){
  const productJson = [];
  for(let key in dataSource.products){
    productJson.push(Object.assign({id: key}, dataSource.products[key]));
  }

  console.log(JSON.stringify({product: productJson, order: []}, null, '  '));
};

export Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

export Handlebars.registerHelper('joinValues', function(input, options) {
  return Object.values(input).join(options.fn(this));
});


