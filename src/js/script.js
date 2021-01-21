/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };


class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    console.log('new Product:', thisProduct);
  }

renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */

    const generatedHTML = templates.menuProduct(thisProduct.data);


    /* create element using utils.createElementFromHTML */

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */

    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */

    menuContainer.appendChild(thisProduct.element)

     }

     getElements(){
  const thisProduct = this;

  thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
  thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
  thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
  thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
  thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
  thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
  thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  }


  initAccordion(){
  const thisProduct = this;

  /* START: add event listener to accordionTrigger on event click */

  thisProduct.accordionTrigger.addEventListener('click', function(event) {

    /* prevent default action for event */
    event.preventDefault();


    /* find active product (product that has active class) */
    let activeProduct = document.querySelector('.active');

    /* if there is active product and it's not thisProduct.element, remove class active from it */
    if (activeProduct !== null && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
    }

    /* toggle active class on thisProduct.element */
   thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

  });

  }

  initOrderForm(){
    const thisProduct = this;
    console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function(event){
    event.preventDefault();
    thisProduct.processOrder();
    });

for(let input of thisProduct.formInputs){
    input.addEventListener('change', function(){
    thisProduct.processOrder();
    });
   }

thisProduct.cartButton.addEventListener('click', function(event){
  event.preventDefault();
  thisProduct.processOrder();
});
  }


  processOrder(){
    const thisProduct = this;
    console.log('processOrder');
    // covert form to object structure e.g. {sauce:['tomato'], toppings: ['olives', 'redPeppers']}}
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);

    // set price to default price
  let price = thisProduct.data.price;

  // for every category (param)...
  for(let paramId in thisProduct.data.params) {
    // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
    const param = thisProduct.data.params[paramId];
    console.log(paramId, param);

    // for every option in this category
    for(let optionId in param.options) {
      // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
      const option = param.options[optionId];
      console.log(optionId, option);

      // check if optionId of paramID ist chosen in formData

    const optionSelected = formData[paramId] && formData[paramId].includes(optionId)
    console.log(optionSelected);
    if (optionSelected) {
      if (!optionId.includes('default')) {
        price += option.price;
              }
    }
    else {
      if (optionId.includes('default')) {
         price -= option.price;
      }
    }

    // add class 'active' to image when element is chosen
    const img = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
      console.log(img);

    if(img) {
      if (optionSelected) {
          img.classList.add(classNames.menuProduct.imageVisible);
          }

      else if (!optionSelected) {
            img.classList.remove(classNames.menuProduct.imageVisible);
        }
      }

    }

  }


  // update calculated price in the HTML
  thisProduct.priceElem.innerHTML = price;
  }
}



class AmountWidget{
  constructor(element){
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);

    console.log('AmountWidget:', thisWidget);
    console.log('constructor arguments:', element);
  };

  getElements(element){
  const thisWidget = this;

  thisWidget.element = element;
  thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
  thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
  thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
 };

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);
    thisWidget.initActions();
    thisWidget.value = newValue;
    thisWidget.input.value = thisWidget.value;

    /*TODO: Add validation */
    if(thisWidget.value !== newValue && !isNan(newValue)) {
      thisWidget.value = newValue;


    };


  initActions() {
    const thisProduct = this;

    thisWidget.input.addEventListener('change', function(event){
      thisWidget.input.value.setValue();
  });
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      setValue(thisWidget.value-1)
    })
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      setValue(thisWidget.value+1)
    })

  };
}




  const app = {
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

       thisApp.initData();
       thisApp.initMenu();
    },
  };

 app.init();

}

