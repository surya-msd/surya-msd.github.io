import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getTasks       from '@salesforce/apex/TaskBoardController.getTasks';
import updateTaskStatus from '@salesforce/apex/TaskBoardController.updateTaskStatus';
import reorderTasks   from '@salesforce/apex/TaskBoardController.reorderTasks';
import deleteTask      from '@salesforce/apex/TaskBoardController.deleteTask';

export default class TaskBoard extends LightningElement {

    // ─── State ────────────────────────────────────────────────────────────────
    @track allTasks        = [];
    @track isLoading       = true;
    @track isModalOpen     = false;
    @track selectedTask    = null;
    @track defaultStatus   = 'ToDo';
    @track selectedCategory = 'All';
    @track selectedPriority = '';
    @track showToast       = false;
    @track toastMessage    = '';
    @track toastClass      = 'toast-notification toast-success';
    @track toastIcon       = 'utility:success';

    wiredTasksResult;
    draggedTaskId     = null;
    dragSourceStatus  = null;
    toastTimer        = null;

    // ─── Wire ─────────────────────────────────────────────────────────────────
    @wire(getTasks, { category: '$selectedCategory' })
    wiredTasks(result) {
        this.wiredTasksResult = result;
        this.isLoading = true;
        if (result.data) {
            this.allTasks  = result.data.map(t => this._mapTask(t));
            this.isLoading = false;
        } else if (result.error) {
            this.isLoading = false;
            this._showToast('Error loading tasks: ' + result.error.body.message, 'error');
        }
    }

    // ─── Computed: Filtered Lists ──────────────────────────────────────────────
    get filteredTasks() {
        let tasks = [...this.allTasks];
        if (this.selectedPriority) {
            tasks = tasks.filter(t => t.Priority__c === this.selectedPriority);
        }
        return tasks;
    }

    get todoTasks()       { return this.filteredTasks.filter(t => t.Status__c === 'ToDo'); }
    get inProgressTasks() { return this.filteredTasks.filter(t => t.Status__c === 'InProgress'); }
    get completedTasks()  { return this.filteredTasks.filter(t => t.Status__c === 'Completed'); }

    get todoCount()       { return this.todoTasks.length; }
    get inProgressCount() { return this.inProgressTasks.length; }
    get completedCount()  { return this.completedTasks.length; }
    get totalCount()      { return this.filteredTasks.length; }

    get isTodoEmpty()       { return !this.isLoading && this.todoTasks.length === 0; }
    get isInProgressEmpty() { return !this.isLoading && this.inProgressTasks.length === 0; }
    get isCompletedEmpty()  { return !this.isLoading && this.completedTasks.length === 0; }

    // ─── Options ──────────────────────────────────────────────────────────────
    get categoryFilters() {
        return [
            { value: 'All',      label: 'All',      cssClass: this._filterClass('All') },
            { value: 'Work',     label: '💼 Work',  cssClass: this._filterClass('Work') },
            { value: 'Personal', label: '🏠 Personal', cssClass: this._filterClass('Personal') }
        ];
    }

    get priorityOptions() {
        return [
            { label: 'All Priorities', value: '' },
            { label: '🔴 Critical',    value: 'Critical' },
            { label: '🟠 High',        value: 'High' },
            { label: '🟡 Medium',      value: 'Medium' },
            { label: '🟢 Low',         value: 'Low' }
        ];
    }

    _filterClass(value) {
        return `filter-btn${this.selectedCategory === value ? ' filter-btn-active' : ''}`;
    }

    // ─── Filter Handlers ──────────────────────────────────────────────────────
    handleCategoryFilter(event) {
        this.selectedCategory = event.currentTarget.dataset.value;
    }

    handlePriorityFilter(event) {
        this.selectedPriority = event.detail.value;
    }

    // ─── Modal Handlers ───────────────────────────────────────────────────────
    handleNewTask(event) {
        this.selectedTask  = null;
        this.defaultStatus = event.currentTarget.dataset.status || 'ToDo';
        this.isModalOpen   = true;
    }

    handleEditTask(event) {
        this.selectedTask = event.detail.task;
        this.isModalOpen  = true;
    }

    handleModalClose() {
        this.isModalOpen  = false;
        this.selectedTask = null;
    }

    handleModalSave(event) {
        const { task, isNew } = event.detail;
        if (isNew) {
            this.allTasks = [...this.allTasks, this._mapTask(task)];
            this._showToast('Task created successfully!', 'success');
        } else {
            this.allTasks = this.allTasks.map(t => t.Id === task.Id ? this._mapTask(task) : t);
            this._showToast('Task updated successfully!', 'success');
        }
        this.isModalOpen  = false;
        this.selectedTask = null;
        refreshApex(this.wiredTasksResult);
    }

    // ─── Delete Handler ───────────────────────────────────────────────────────
    handleDeleteTask(event) {
        const taskId = event.detail.taskId;
        deleteTask({ taskId })
            .then(() => {
                this.allTasks = this.allTasks.filter(t => t.Id !== taskId);
                this._showToast('Task deleted.', 'info');
                refreshApex(this.wiredTasksResult);
            })
            .catch(error => {
                this._showToast('Error deleting task: ' + error.body.message, 'error');
            });
    }

    // ─── Status Change from Card ──────────────────────────────────────────────
    handleStatusChange(event) {
        const { taskId, newStatus } = event.detail;
        this._moveTask(taskId, newStatus);
    }

    // ─── Drag & Drop ──────────────────────────────────────────────────────────
    handleDragStart(event) {
        this.draggedTaskId    = event.currentTarget.dataset.id;
        this.dragSourceStatus = event.currentTarget.task?.Status__c ||
            this.allTasks.find(t => t.Id === this.draggedTaskId)?.Status__c;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', this.draggedTaskId);
        event.currentTarget.classList.add('dragging');
    }

    handleDragEnd(event) {
        event.currentTarget.classList.remove('dragging');
        // Remove all drag-over highlights
        this.template.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const column = event.currentTarget;
        column.classList.add('drag-over');
    }

    handleDragLeave(event) {
        const column = event.currentTarget;
        // Only remove if leaving the column itself, not a child
        if (!column.contains(event.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const column    = event.currentTarget;
        const newStatus = column.dataset.status;
        column.classList.remove('drag-over');

        if (!this.draggedTaskId) return;

        this._moveTask(this.draggedTaskId, newStatus);
        this.draggedTaskId    = null;
        this.dragSourceStatus = null;
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────
    _moveTask(taskId, newStatus) {
        // Optimistic UI update
        this.allTasks = this.allTasks.map(t =>
            t.Id === taskId ? { ...t, Status__c: newStatus } : t
        );

        // Build ordered IDs of the target column after the move
        const columnTasks = this.allTasks
            .filter(t => t.Status__c === newStatus)
            .map(t => t.Id);

        updateTaskStatus({
            taskId,
            newStatus,
            orderedIds: JSON.stringify(columnTasks)
        })
        .then(() => {
            refreshApex(this.wiredTasksResult);
        })
        .catch(error => {
            this._showToast('Error moving task: ' + error.body.message, 'error');
            refreshApex(this.wiredTasksResult); // Revert on error
        });
    }

    _mapTask(record) {
        return {
            Id:             record.Id,
            Name:           record.Name,
            Status__c:      record.Status__c,
            Description__c: record.Description__c,
            Priority__c:    record.Priority__c,
            Category__c:    record.Category__c,
            Due_Date__c:    record.Due_Date__c,
            Assigned_To__c: record.Assigned_To__c,
            Tags__c:        record.Tags__c,
            Sort_Order__c:  record.Sort_Order__c,
            CreatedDate:    record.CreatedDate,
            LastModifiedDate: record.LastModifiedDate
        };
    }

    _showToast(message, type) {
        this.toastMessage = message;
        this.showToast    = true;

        if (type === 'success') {
            this.toastClass = 'toast-notification toast-success';
            this.toastIcon  = 'utility:success';
        } else if (type === 'error') {
            this.toastClass = 'toast-notification toast-error';
            this.toastIcon  = 'utility:error';
        } else {
            this.toastClass = 'toast-notification toast-info';
            this.toastIcon  = 'utility:info';
        }

        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            this.showToast = false;
        }, 3500);
    }
}
