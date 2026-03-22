({
	doInit: function(component, event, helper) {
		helper.fetchHelper(null,component);
	},
    
    fetchWithKeyword: function(component, event, helper) {
		var searchVal = component.find("searchKeyField").get("v.value");
        helper.fetchHelper(searchVal,component);
	}
})