Public with sharing class ClassAndEventsController{
	
	@AuraEnabled
	Public static ClassWrapper getClassDetails(String classId){
        ClassWrapper clsWrap = new ClassWrapper();
		/*List<Product2> prodLst = [Select Id,Name,Description,(Select Id from Sessions order by created date desc) from Product2 where Id =: classId];
		for(Product2 prod:prodLst){
			ClassWrapper clsWrap = new ClassWrapper();
			clsWrap.clsName = prod.Name;
			clsWrap.clsDate = Sessions[0];
			clsWrap.clsTime = Sessions[0];
			clsWrap.noOfSession = Sessions.size();
			clsWrap.costPerPers = ;
			clsWrap.seasAvlbl = ;
			clsWrap.description = prod.Description;
			clsWrap.sponsored = ;
		}*/
        return clsWrap;
	}
	
	Public class ClassWrapper {
		@AuraEnabled Public String clsName;
		@AuraEnabled Public String clsDate;
		@AuraEnabled Public String clsTime;
		@AuraEnabled Public Integer noOfSession;
		@AuraEnabled Public Decimal costPerPers;
		@AuraEnabled Public Integer seasAvlbl;
		@AuraEnabled Public Integer description;
		@AuraEnabled Public Integer sponsored;
	}

}