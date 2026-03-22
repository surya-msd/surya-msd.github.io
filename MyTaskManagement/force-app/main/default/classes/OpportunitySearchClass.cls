public class OpportunitySearchClass {

    @AuraEnabled
    public static List<Opportunity> fetchOpportunities(String searchKeyword){
        
        string searchVal = String.isBlank(searchKeyword)? '%%' : searchKeyword+'%';
        List<Opportunity> resultListOpportunities = new List<Opportunity>();
        resultListOpportunities = [select Name,Account_Name__c,CloseDate from Opportunity where Name Like :searchVal limit 15];
        return resultListOpportunities;
       
        
        
    }
    
}