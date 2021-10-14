import { LightningElement,wire,api } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation'
import {ShowToastEvent} from 'lightning/platformShowToastEvent'
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  
  @api boatTypeId;
  //boatTypeId = 'a025f000000EmufAAC'
  mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation,{
    latitude: '$latitude',
    longitude: '$longitude',
    boatTypeId: '$boatTypeId'
  })
  wiredBoatsJSON({data, error}) {
    if(data){
        this.createMapMarkers(data)
    }
    if(error){
        this.dispatchEvent(new ShowToastEvent({
            title: ERROR_TITLE,
            message: error,
            variant: ERROR_VARIANT
        }))
    }
    this.isLoading=false
   }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() { 
      if(!this.isRendered){
        this.getLocationFromBrowser()
        this.isRendered = true
      }
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() { 
    navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      })
  }
  
  // Creates the map markers
  createMapMarkers(boatData) {
     // const newMarkers = boatData.map(boat => {...});
     // newMarkers.unshift({...});

    this.mapMarkers = JSON.parse(boatData).map(boat=>{
        return{
            location:{
                Latitude:boat.Geolocation__Latitude__s,
                Longitude:boat.Geolocation__Longitude__s
            },
            icon:ICON_STANDARD_USER,
            title: boat.Name
        }
    })

    this.mapMarkers.unshift({
        location:{
            Latitude:this.latitude,
            Longitude:this.longitude
        },
        icon:ICON_STANDARD_USER,
        title: LABEL_YOU_ARE_HERE 
    })

  //   this.mapMarkers = [
  //       {
  //         location: {
  //           Latitude: this.latitude,
  //           Longitude: this.longitude
  //         },
  //         icon: ICON_STANDARD_USER,
  //         title: LABEL_YOU_ARE_HERE
  //       },
  //       ...JSON.parse(boatData).map(boat => ({
  //         location: {
  //           Latitude: boat.Geolocation__Latitude__s,
  //           Longitude: boat.Geolocation__Longitude__s
  //         },
  //         title: boat.Name
  //       }))
  //     ];

   }
}