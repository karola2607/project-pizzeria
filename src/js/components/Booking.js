import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedPlace = '';

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking
                                      + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event
                                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event
                                      + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('url', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked (date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){
      //console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
      &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector('.floor-plan');
    console.log(thisBooking.dom.floorPlan);
  }



  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    //console.log(thisBooking.hourPickerAmountWidget)
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    //console.log(thisBooking.datePickerAmountWidget)

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });


    // add eventListener for all tables - div floor-plan
    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      event.preventDefault();
      // check if clicked element is a table
      if (event.target.offsetParent.classList.contains('table')){
        // when it's a table, check if not contains class 'booked' or 'selected'

        if ((event.target.offsetParent.classList.contains(!classNames.booking.tableBooked)) ^ (event.target.offsetParent.classList.contains(!classNames.booking.tableSelected))) {
          // find data-table of clicked element
          let dataTable = event.target.offsetParent.getAttribute(settings.booking.tableIdAttribute);
          console.log(dataTable);
          //add data-table of clicked element to new property in constructor
          thisBooking.selectedPlace = dataTable;
          //make a loop for a table to find a tableId (data-table)
          for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);

            // check if one of another tables wasn't already selected
            if (tableId !== dataTable && table.classList.contains(classNames.booking.tableSelected)){
              // when yes, remove class 'selected' and add class 'selected' to clicked element
              table.classList.remove(classNames.booking.tableSelected);
              event.target.offsetParent.classList.add(classNames.booking.tableSelected);
            }
          }
        }

        // when it's a table and was already clicked - remove class 'selected'
        else if (event.target.offsetParent.classList.contains(classNames.booking.tableSelected)){
          event.target.offsetParent.classList.remove(classNames.booking.tableSelected);
        }

        // when it's a table and was already booked - display alert
        else if (event.target.offsetParent.classList.contains(classNames.booking.tableBooked)){
          alert('This table is not available');
        }
      }
    });


  }
}



export default Booking;
