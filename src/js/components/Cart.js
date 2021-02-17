import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './CartProduct.js';
import {utils} from '../utils.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  //console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;


    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subTotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }

    console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }


  add(menuProduct){
    const thisCart = this;
    /* generate HTML based on template */

    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createElementFromHTML */

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* add element to menu */

    thisCart.dom.productList.appendChild(generatedDOM);
    console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }


  update(){
    const thisCart = this;
    let deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subTotalPrice = 0;


    for (thisCart.CartProduct of thisCart.products) {
      totalNumber += thisCart.CartProduct.amount;
      subTotalPrice += (thisCart.CartProduct.amount * thisCart.CartProduct.priceSingle);
    }


    if (totalNumber == 0) {
      thisCart.totalPrice = 0;

    } else if (totalNumber !== 0)  {
      thisCart.totalPrice = subTotalPrice + deliveryFee;

    }

    for (let i = 0; i < thisCart.dom.totalPrice.length; i++) {
      thisCart.dom.totalPrice[i].innerHTML = thisCart.totalPrice;
    }

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subTotalPrice.innerHTML = subTotalPrice;


    thisCart.subTotalPrice = subTotalPrice;
    thisCart.totalNumber = totalNumber;
    thisCart.deliveryFee = deliveryFee;
  }

  remove(thisCartProduct){
    const thisCart = this;

    const indexOfCartProduct = thisCart.products.indexOf(thisCartProduct);
    console.log(indexOfCartProduct);
    const removedCartProduct = thisCart.products.splice(indexOfCartProduct, 1);
    console.log(removedCartProduct);


    const removedDOMCartProduct = thisCartProduct.dom.wrapper;
    console.log(removedDOMCartProduct);
    removedDOMCartProduct.remove();

    thisCart.update();
  }
}

export default Cart;
