public class FetchAccountClass {

    @AuraEnabled
    public static List<Account> fetchAccount(String searchKeyword){
        system.debug(searchKeyword);
        List<Account> lstAccount = new List<Account>();
        String searchVal = String.isBlank(searchKeyword) ? '%%' : '%'+searchKeyword+'%';
        lstAccount = [select name from Account where name like :searchVal];
        system.debug(lstAccount);
        return lstAccount;
    }
}