import { LightningElement,wire } from 'lwc';
// Custom Labels Imports
// import labelDetails for Details.
// import labelReviews for Reviews
// import labelAddReview for Add_Review
// import labelFullDetails for Full_Details
// import labelPleaseSelectABoat for Please_select_a_boat
// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelDetails from '@salesforce/label/c.Details';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import labelReviews from '@salesforce/label/c.Reviews';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import { APPLICATION_SCOPE, MessageContext, subscribe, unsubscribe } from 'lightning/messageService';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    boatId;

    @wire(getRecord,{recordId:'$boatId',fields:BOAT_FIELDS})    
    wiredRecord;

    label = {
      labelDetails,
      labelReviews,
      labelAddReview,
      labelFullDetails,
      labelPleaseSelectABoat,
    };
    
    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return this.wiredRecord?'utility:anchor':null
     }
    
    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD)
    }
    
    // Private
    subscription = null;
    
    @wire(MessageContext)
    messageContext
    // Subscribe to the message channel
    subscribeMC() {
      // local boatId must receive the recordId from the message
      if(this.subscription)
      return;
      this.subscription=subscribe(this.messageContext, BOATMC,(message)=>{
        return this.boatId = message.recordId
      },{scope:APPLICATION_SCOPE})
    }
    
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
      }
    // Calls subscribeMC()
    connectedCallback() { 
        this.subscribeMC()
    }
    
    // Navigates to record page
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes:{
                recordId: this.boatId,
                actionName: 'view'
            }
        })
    }
    
    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() { 
        const tabSet = this.template.querySelector('lightning-tabset');
        tabSet.activeTabValue = 'reviews';
        const reviews = this.template.querySelector('c-boat-reviews');
        if (reviews) reviews.refresh();
    }
}