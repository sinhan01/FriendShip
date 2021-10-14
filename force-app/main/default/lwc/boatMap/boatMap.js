  import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c'
  import { subscribe,unsubscribe,APPLICATION_SCOPE,MessageContext } from 'lightning/messageService';
  import { api, LightningElement,track,wire } from 'lwc';
  import { getRecord } from 'lightning/uiRecordApi';
  const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
  const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
  const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

// Declare the const LONGITUDE_FIELD for the boat's Longitude__s
// Declare the const LATITUDE_FIELD for the boat's Latitude
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];
export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  @track boatId;
  //boatId = 'a025f000000EmufAAC'
  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api 
  get recordId() {
    return this.boatId;
  }

  set recordId(value) {
    this.setAttribute('boat-id', value);
    this.boatId = value;
  }

  @api error = undefined;
  @api mapMarkers = [];

  // Initialize messageContext for Message Service
  @wire(MessageContext)
  messageContext

  // Subscribes to the message channel
  // subscribeToMessageChannel(){
  //   if(!this.subscription){
  //     this.subscription = subscribe(this.messageContext, 
  //       BOATMC, 
  //       (message)=>{this.handleMessage(message)},
  //     {scope:APPLICATION_SCOPE})
  //   }
  // }

  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord ,{recordId:'$boatId',fields:BOAT_FIELDS})
  wiredRecord({ data, error }) {
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }



  unsubscribeToMessageChannel() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  handleMessage(message){
    this.recordId = message.recordId
  }

  subscribeMC() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription || this.recordId) {
      return;
    }
    else{
      this.subscription = subscribe(this.messageContext, 
        BOATMC, 
        (message)=>{this.boatId = message.recordId},
      {scope:APPLICATION_SCOPE})
    }
    //this.subscribeToMessageChannel()
    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
  }

  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers=[
      {
        location:{Latitude,Longitude}
      }
    ]
  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}