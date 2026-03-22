public class QueryContact {
    

    Map<String, Object> nameBind = new Map<String, Object>{'lastName' => 'Test','title' => 'Test'};
    Id contactId = getContactIDWithBinds(nameBind);
  
    public static Id getContactID(String lastName, String title) {
    try {
      Contact myContact = Database.query(
        'SELECT ID FROM Contact WHERE lastName = :lastName AND title = :title LIMIT 1'
      );
      return myContact.Id;
    } catch (Exception ex) {
      return null;
    }
  }
  public static Id getContactIDWithBinds(Map<String, Object> bindVars) {
        String queryString =
            'SELECT Id ' +
            'FROM Contact ' +
            'WHERE lastName = :lastName AND title = :title LIMIT 1';
        Contact myContact = Database.queryWithBinds(
            queryString,
            bindVars,
            AccessLevel.USER_MODE
        );
      return myContact.Id;
    }
}