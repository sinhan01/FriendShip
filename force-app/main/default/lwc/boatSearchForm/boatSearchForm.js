import { LightningElement,wire } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes'
export default class BoatSearchForm extends LightningElement {
    selectedBoatTypeId = '';

    // Private
    error = undefined;
    
    searchOptions;
    //defaultValue=''
    
    // Wire a custom Apex method
    @wire(getBoatTypes)
      boatTypes({ error, data }) {
      if (data) {
        this.searchOptions = data.map(type => {
          return {
              label:type.Name,
              value:type.Id,
              Id: type.Id
          }
        });        
        this.searchOptions.unshift({ label: 'All Types', value: '', Id:'' });
        console.log(this.searchOptions)
      } else if (error) {
        this.searchOptions = undefined;
        this.error = error;
      }
    }
    
    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
      // Create the const searchEvent
      // searchEvent must be the new custom event search
        //this.value = event.target.value
        this.selectedBoatTypeId = event.target.value
        //this.selectedBoatTypeId = (this.searchOptions.filter(item=>item.value === event.target.value))[0].Id
        console.log(this.selectedBoatTypeId)
        const searchEvent = new CustomEvent('search', {
          detail: {boatTypeId:this.selectedBoatTypeId}
        });
        
        this.dispatchEvent(searchEvent);
    }
}