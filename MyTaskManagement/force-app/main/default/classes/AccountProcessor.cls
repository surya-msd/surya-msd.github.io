public class AccountProcessor {
@future
  public static void countContacts(List<Id> accountIds) {
      List<Account> accountToUpdate = new List<Account>();
    List<Account> accounts = [Select Id, Name,(Select Id from Contacts) from Account Where Id IN :accountIds];
      for(Account acc:accounts){
          List<Contact> contactList = acc.Contacts;
          acc.Number_of_Contacts__c= contactList.size();
          accountToUpdate.add(acc);
      }
      update accountToUpdate;
  }
}