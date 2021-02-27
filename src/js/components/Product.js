import {select, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import {utils} from '../utils.js';



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
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */

    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createDOMFromHTML */

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */

    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */

    menuContainer.appendChild(thisProduct.element);
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
    thisProduct.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  }


  initAccordion(){
    const thisProduct = this;

    /* START: add event listener to accordionTrigger on event click */

    thisProduct.accordionTrigger.addEventListener('click', function(event) {

      /* prevent default action for event */
      event.preventDefault();


      /* find active product (product that has active class) */
      let activeProduct = thisProduct.element.querySelector('.active');

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
      thisProduct.addToCart();
    });
  }


  processOrder(){
    const thisProduct = this;
    //console.log('processOrder');
    // covert form to object structure e.g. {sauce:['tomato'], toppings: ['olives', 'redPeppers']}}
    const formData = utils.serializeFormToObject(thisProduct.form);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log(optionId, option);

        // check if optionId of paramID ist chosen in formData

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        //console.log(optionSelected);
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
        //console.log(img);

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
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }

  addToCart(){
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.name ,
      amount: thisProduct.amount,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceElem.innerHTML,
      params: thisProduct.prepareCartProductParams()
    };

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};


    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      params[paramId] = {label: param.label, options: {}};

      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        // check if optionId of paramID ist chosen in formData

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          params[paramId].options = {[param.label]: option.label};
        }
      }
    }
    return params;
  }
}

export default Product;
