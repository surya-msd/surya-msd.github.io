import { LightningElement } from 'lwc';
export default class HelloWorld extends LightningElement {
  greeting = 'World1';
  changeHandler(event) {
    this.greeting = event.target.value;
  }

     statusOptions = [
        {value: 'new', label: 'New', description: 'A new item'},
        {value: 'in-progress', label: 'In Progress', description: 'Currently working on this item'},
        {value: 'finished', label: 'Finished', description: 'Done working on this item'}
    ];

    value = 'new';
    svalue;
    desc = '';

    handleChange(event) {
        // Get the string of the "value" attribute on the selected option
       
        this.svalue = event.detail.value;
        alert(this.svalue);

        //this.desc = event.target.options.find(opt => opt.value === this.svalue).description;
       // alert(this.desc);
    }

    get show(){
      alert('Inside Getter');
      if(this.svalue){
        return true;
      }
       
      else{
        return false;
      }
       
    }
}