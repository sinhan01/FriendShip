import { LightningElement, api, wire,track } from 'lwc';
// imports
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats'
import { NavigationMixin } from 'lightning/navigation';
export default class SimilarBoats extends NavigationMixin(LightningElement) {
    currentBoat;
    @track relatedBoats;
    boatId;
    error;

    // public
    @api
    get recordId() {
         return this.boatId
      }
      set recordId(value) {
        //this.setAttribute('boat-id', value)
          this.boatId = value
          // sets the boatId value
          
          // sets the boatId attribute
      }
    
    // public
    @api
    similarBy;
    
    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats,{boatId:'$boatId',similarBy:'$similarBy'})
    similarBoats({ error, data }) {
    if (error) {
        this.error = error
        console.error('error',error)
        } 
    else if (data) {
        this.relatedBoats = data;
        console.log('data', data)
        }
     }
    get getTitle() {
      return 'Similar boats by ' + this.similarBy;
    }
    get noBoats() {
      return !(this.relatedBoats && this.relatedBoats.length > 0);
    }
    
    // Navigate to record page
    openBoatDetailPage(event) { 
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
              recordId: event.detail.boatId,
              actionName: 'view',
            }
          });
    }
}