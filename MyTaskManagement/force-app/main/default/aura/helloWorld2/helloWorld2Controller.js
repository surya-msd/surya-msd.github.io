({
	add : function(component) {
		var result = component.get("v.num1")+component.get("v.num2")
        component.set("v.SUM",result)
	}
})