import { LightningElement } from 'lwc';
import LightningConfirm from 'lightning/confirm';
export default class RecordCardQuickFiles extends LightningElement {

     onDeleteAllFilesButtonClick() {
  const confirmation = LightningConfirm.open({
            message: 'Are you sure you want to delete all files?',
            variant: 'headerless',
            label: 'Are you sure you want to delete all files?',
            // setting theme would have no effect
        });
}
}