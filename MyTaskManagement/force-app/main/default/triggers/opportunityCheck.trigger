trigger opportunityCheck on Opportunity (after insert,after update) {

    set<Id> oppIds = new set<Id>();
    List<OpportunityLineItem> updateOppLine = new List<OpportunityLineItem>();
    Map<Id,List<OpportunityLineItem>> oppWithLineItems= new Map<Id,List<OpportunityLineItem>>();
    
    if(Trigger.isInsert){
        for(Opportunity opp: Trigger.New){
            oppIds.add(opp.id);
        
        }
    }
    if(Trigger.isUpdate){
        for(Opportunity opp: Trigger.New){
           if(Trigger.oldMap.get(opp.id).amountGenerated__c <> opp.amountGenerated__c)
            oppIds.add(opp.id);
        }
    }

  for(Opportunity opp : [select Id,amountGenerated__c ,(select id from OpportunityLineItems) oppLine from Opportunity where id in :oppIds])
  {
      for(OpportunityLineItem opl : opp.OpportunityLineItems){
          OpportunityLineItem newOpl = new OpportunityLineItem();
          newOpl.amountGenerated__c = opp.amountGenerated__c;
          newOpl.Id = opl.id;
          updateOppLine.add(newOpl);
          
      }
  }
  
  update updateOppLine;
    
    

}