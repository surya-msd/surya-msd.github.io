({
	fetchHelper: function(searchVal,component) {
		component.set("v.columnsToDisplay",[
            {label: 'Opportunity name', fieldName: 'Name', type: 'text'},
            {label: 'Account name', fieldName: 'Account_Name__c', type: 'text'},
            {label: 'Close date', fieldName: 'CloseDate', type: 'date'}
        ]);
        
        var action = component.get("c.fetchOpportunities");
        action.setParams(
            {
                "searchKeyword": searchVal
            }
        );
        
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                component.set("v.lstOpportnuities",response.getReturnValue());
            }
            else{
                alert("There is a issue while fetching opportunity");
            }
                
        });
        
        $A.enqueueAction(action);
          
	}
})