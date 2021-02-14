import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import BaseWidget from './BaseWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(element);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    //console.log(element)
    element.innerHTML = generatedHTML;

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    //console.log(thisBooking.dom.peopleAmount)
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    //console.log(thisBooking.dom.hoursAmount)


  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.hourPickerAmountWidget = new HourPicker(thisBooking.dom.hourPicker);
    //console.log(thisBooking.hourPickerAmountWidget)
    thisBooking.datePickerAmountWidget = new DatePicker(thisBooking.dom.datePicker);
    //console.log(thisBooking.datePickerAmountWidget)

    thisBooking.dom.peopleAmount.addEventListener('updated', function() {
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function() {
    });

  }
}

export default Booking;
