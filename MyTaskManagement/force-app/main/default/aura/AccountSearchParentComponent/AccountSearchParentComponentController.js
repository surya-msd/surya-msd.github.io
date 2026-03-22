({
	reloadData : function(component, event, helper) {
		var action = component.get("c.fetchAccount");
        var userInput = event.getParam("userInput")
        console.log(userInput);
        action.setParams({
            searchKeyword:userInput
        }  
        );
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.accList",response.getReturnValue());
            }
            else{
                alert("Error while fetching records");
            }
        });
        $A.enqueueAction(action);
	},
    
    goToRecord : function(component, event){
    	var recId = event.getSource().get("v.value");
        var recEvent = $A.get("e.force:navigateToSObject");
    	recEvent.setParams({
        	recordId:recId
	    });
       recEvent.fire();
	}
})