trigger calculateTotalAmount on Opportunity (after insert,after update)
{
    Set<Id> accountIds = new Set<Id>();
    List<Account> updateAccountDetails = new List<Account>();
    
    
    for(Opportunity opp:Trigger.New){
        accountIds.add(opp.AccountId);
    }
    
    List<AggregateResult> agrResList = [select AccountId ,sum(Amount__c) amount from opportunity where AccountId in :accountIds group by AccountId];
    
    for(AggregateResult agr :  agrResList )
    {
    
            System.debug('Acc ID' + agr.get('AccountId'));
            //System.debug('Average amount' + agr.get('expr0'));
            System.debug('Average amount' + agr.get('amount'));
        Account acc = new Account();
        acc.Id = (Id)agr.get('AccountId');
        acc.Opportunity_Total_Amount__c = (decimal)agr.get('amount');
        updateAccountDetails.add(acc);
    } 
    update updateAccountDetails;
}