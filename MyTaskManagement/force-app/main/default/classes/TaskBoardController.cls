/**
 * @description Apex Controller for Task Board LWC Application
 * @author      Task Board App
 */
public with sharing class TaskBoardController {

    /**
     * @description Retrieves all tasks, optionally filtered by category
     * @param category Filter by 'Work', 'Personal', or null for all
     * @return List of Task__c records
     */
    @AuraEnabled(cacheable=true)
    public static List<Task__c> getTasks(String category) {
        try {
            String query = 'SELECT Id, Name, Status__c, Description__c, Priority__c, ' +
                           'Category__c, Due_Date__c, Assigned_To__c, Tags__c, ' +
                           'Sort_Order__c, CreatedDate, LastModifiedDate ' +
                           'FROM Task__c';

            if (String.isNotBlank(category) && category != 'All') {
                query += ' WHERE Category__c = :category';
            }

            query += ' ORDER BY Sort_Order__c ASC NULLS LAST, CreatedDate ASC';

            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving tasks: ' + e.getMessage());
        }
    }

    /**
     * @description Creates a new task
     * @param taskData JSON string containing task field values
     * @return Newly created Task__c record
     */
    @AuraEnabled
    public static Task__c createTask(String taskData) {
        try {
            Map<String, Object> taskMap = (Map<String, Object>) JSON.deserializeUntyped(taskData);

            Task__c newTask = new Task__c();
            newTask.Name           = (String)  taskMap.get('title');
            newTask.Status__c      = (String)  taskMap.get('status');
            newTask.Description__c = (String)  taskMap.get('description');
            newTask.Priority__c    = (String)  taskMap.get('priority');
            newTask.Category__c    = (String)  taskMap.get('category');
            newTask.Assigned_To__c = (String)  taskMap.get('assignedTo');
            newTask.Tags__c        = (String)  taskMap.get('tags');

            if (taskMap.get('dueDate') != null && String.isNotBlank((String)taskMap.get('dueDate'))) {
                newTask.Due_Date__c = Date.valueOf((String) taskMap.get('dueDate'));
            }

            // Set sort order to end of column
            AggregateResult[] maxOrder = [
                SELECT MAX(Sort_Order__c) maxOrder
                FROM Task__c
                WHERE Status__c = :newTask.Status__c
            ];
            Decimal currentMax = (Decimal) maxOrder[0].get('maxOrder');
            newTask.Sort_Order__c = (currentMax == null) ? 1 : currentMax + 1;

            insert newTask;

            return [
                SELECT Id, Name, Status__c, Description__c, Priority__c,
                       Category__c, Due_Date__c, Assigned_To__c, Tags__c,
                       Sort_Order__c, CreatedDate, LastModifiedDate
                FROM Task__c
                WHERE Id = :newTask.Id
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error creating task: ' + e.getMessage());
        }
    }

    /**
     * @description Updates an existing task
     * @param taskData JSON string containing task field values including Id
     * @return Updated Task__c record
     */
    @AuraEnabled
    public static Task__c updateTask(String taskData) {
        try {
            Map<String, Object> taskMap = (Map<String, Object>) JSON.deserializeUntyped(taskData);

            Task__c task = new Task__c();
            task.Id            = (String) taskMap.get('id');
            task.Name          = (String) taskMap.get('title');
            task.Status__c     = (String) taskMap.get('status');
            task.Description__c = (String) taskMap.get('description');
            task.Priority__c   = (String) taskMap.get('priority');
            task.Category__c   = (String) taskMap.get('category');
            task.Assigned_To__c = (String) taskMap.get('assignedTo');
            task.Tags__c       = (String) taskMap.get('tags');

            if (taskMap.get('dueDate') != null && String.isNotBlank((String)taskMap.get('dueDate'))) {
                task.Due_Date__c = Date.valueOf((String) taskMap.get('dueDate'));
            } else {
                task.Due_Date__c = null;
            }

            update task;

            return [
                SELECT Id, Name, Status__c, Description__c, Priority__c,
                       Category__c, Due_Date__c, Assigned_To__c, Tags__c,
                       Sort_Order__c, CreatedDate, LastModifiedDate
                FROM Task__c
                WHERE Id = :task.Id
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error updating task: ' + e.getMessage());
        }
    }

    /**
     * @description Deletes a task by Id
     * @param taskId Id of the Task__c record to delete
     */
    @AuraEnabled
    public static void deleteTask(String taskId) {
        try {
            Task__c task = [SELECT Id FROM Task__c WHERE Id = :taskId LIMIT 1];
            delete task;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting task: ' + e.getMessage());
        }
    }

    /**
     * @description Updates task status and sort order when dragged between columns
     * @param taskId        Id of the dragged task
     * @param newStatus     Target column status
     * @param orderedIds    JSON array of all task Ids in the target column (in new order)
     */
    @AuraEnabled
    public static void updateTaskStatus(String taskId, String newStatus, String orderedIds) {
        try {
            List<Object> idList = (List<Object>) JSON.deserializeUntyped(orderedIds);
            List<Task__c> tasksToUpdate = new List<Task__c>();

            // Update the dragged task's status
            Task__c draggedTask = new Task__c(Id = taskId, Status__c = newStatus);
            tasksToUpdate.add(draggedTask);

            // Re-order all tasks in the column
            Integer order = 1;
            for (Object id : idList) {
                tasksToUpdate.add(new Task__c(Id = (String)id, Sort_Order__c = order++));
            }

            update tasksToUpdate;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating task status: ' + e.getMessage());
        }
    }

    /**
     * @description Reorders tasks within the same column
     * @param orderedIds JSON array of Task Ids in the new order
     */
    @AuraEnabled
    public static void reorderTasks(String orderedIds) {
        try {
            List<Object> idList = (List<Object>) JSON.deserializeUntyped(orderedIds);
            List<Task__c> tasksToUpdate = new List<Task__c>();

            Integer order = 1;
            for (Object id : idList) {
                tasksToUpdate.add(new Task__c(Id = (String) id, Sort_Order__c = order++));
            }

            update tasksToUpdate;
        } catch (Exception e) {
            throw new AuraHandledException('Error reordering tasks: ' + e.getMessage());
        }
    }
}
