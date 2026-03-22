({
	handlechangeAccName : function(component, event, helper) {
		var cmpEvent = component.getEvent("InputCarryEvent");
        var currentInput = component.get("v.accName");
        console.log(currentInput);
        cmpEvent.setParams({
            userInput : currentInput
        });
        cmpEvent.fire();
	}
})