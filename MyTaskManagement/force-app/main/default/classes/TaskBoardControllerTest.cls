/**
 * @description Test class for TaskBoardController
 */
@isTest
private class TaskBoardControllerTest {

    @TestSetup
    static void makeData() {
        List<Task__c> tasks = new List<Task__c>();
        tasks.add(new Task__c(Name='Work Task 1', Status__c='ToDo',      Priority__c='High',   Category__c='Work',     Sort_Order__c=1));
        tasks.add(new Task__c(Name='Work Task 2', Status__c='InProgress', Priority__c='Medium', Category__c='Work',     Sort_Order__c=2));
        tasks.add(new Task__c(Name='Personal 1',  Status__c='Completed', Priority__c='Low',    Category__c='Personal', Sort_Order__c=1));
        insert tasks;
    }

    @isTest
    static void testGetAllTasks() {
        Test.startTest();
        List<Task__c> tasks = TaskBoardController.getTasks(null);
        Test.stopTest();
        System.assertEquals(3, tasks.size(), 'Should return all 3 tasks');
    }

    @isTest
    static void testGetTasksByCategory() {
        Test.startTest();
        List<Task__c> workTasks     = TaskBoardController.getTasks('Work');
        List<Task__c> personalTasks = TaskBoardController.getTasks('Personal');
        Test.stopTest();
        System.assertEquals(2, workTasks.size(),     'Should return 2 work tasks');
        System.assertEquals(1, personalTasks.size(), 'Should return 1 personal task');
    }

    @isTest
    static void testCreateTask() {
        Map<String, Object> taskData = new Map<String, Object>{
            'title'       => 'New Test Task',
            'status'      => 'ToDo',
            'description' => 'Test Description',
            'priority'    => 'High',
            'category'    => 'Work',
            'assignedTo'  => 'John Doe',
            'tags'        => 'test,lwc',
            'dueDate'     => '2025-12-31'
        };

        Test.startTest();
        Task__c created = TaskBoardController.createTask(JSON.serialize(taskData));
        Test.stopTest();

        System.assertNotEquals(null, created.Id,    'Task should have an Id');
        System.assertEquals('New Test Task', created.Name, 'Title should match');
        System.assertEquals('ToDo',          created.Status__c, 'Status should be ToDo');
    }

    @isTest
    static void testUpdateTask() {
        Task__c existing = [SELECT Id FROM Task__c WHERE Name='Work Task 1' LIMIT 1];

        Map<String, Object> taskData = new Map<String, Object>{
            'id'          => existing.Id,
            'title'       => 'Updated Task Title',
            'status'      => 'InProgress',
            'description' => 'Updated Description',
            'priority'    => 'Critical',
            'category'    => 'Work',
            'assignedTo'  => 'Jane Doe',
            'tags'        => 'updated',
            'dueDate'     => ''
        };

        Test.startTest();
        Task__c updated = TaskBoardController.updateTask(JSON.serialize(taskData));
        Test.stopTest();

        System.assertEquals('Updated Task Title', updated.Name,       'Name should be updated');
        System.assertEquals('InProgress',         updated.Status__c,  'Status should be InProgress');
        System.assertEquals('Critical',           updated.Priority__c,'Priority should be Critical');
    }

    @isTest
    static void testDeleteTask() {
        Task__c existing = [SELECT Id FROM Task__c WHERE Name='Work Task 1' LIMIT 1];

        Test.startTest();
        TaskBoardController.deleteTask(existing.Id);
        Test.stopTest();

        List<Task__c> remaining = [SELECT Id FROM Task__c WHERE Id = :existing.Id];
        System.assertEquals(0, remaining.size(), 'Task should be deleted');
    }

    @isTest
    static void testUpdateTaskStatus() {
        Task__c task = [SELECT Id FROM Task__c WHERE Name='Work Task 1' LIMIT 1];
        Task__c task2 = [SELECT Id FROM Task__c WHERE Name='Work Task 2' LIMIT 1];

        List<String> orderedIds = new List<String>{task.Id, task2.Id};

        Test.startTest();
        TaskBoardController.updateTaskStatus(task.Id, 'InProgress', JSON.serialize(orderedIds));
        Test.stopTest();

        Task__c updated = [SELECT Status__c FROM Task__c WHERE Id = :task.Id];
        System.assertEquals('InProgress', updated.Status__c, 'Status should be updated to InProgress');
    }

    @isTest
    static void testReorderTasks() {
        List<Task__c> tasks = [SELECT Id FROM Task__c WHERE Category__c='Work' ORDER BY Sort_Order__c];
        List<String> reversedIds = new List<String>{tasks[1].Id, tasks[0].Id};

        Test.startTest();
        TaskBoardController.reorderTasks(JSON.serialize(reversedIds));
        Test.stopTest();

        Task__c firstTask = [SELECT Sort_Order__c FROM Task__c WHERE Id = :tasks[1].Id];
        System.assertEquals(1, firstTask.Sort_Order__c, 'Reversed task should have order 1');
    }
}
