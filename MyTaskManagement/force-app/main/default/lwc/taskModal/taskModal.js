import { LightningElement, api, track } from 'lwc';
import createTask from '@salesforce/apex/TaskBoardController.createTask';
import updateTask from '@salesforce/apex/TaskBoardController.updateTask';

export default class TaskModal extends LightningElement {

    @api defaultStatus = 'ToDo';

    @track formData = {
        title:       '',
        status:      'ToDo',
        priority:    'Medium',
        category:    'Work',
        dueDate:     '',
        assignedTo:  '',
        tags:        '',
        description: ''
    };

    @track isSaving    = false;
    @track titleError  = '';
    _task = null;

    // ─── Task Property ────────────────────────────────────────────────────────
    @api
    get task() { return this._task; }
    set task(value) {
        this._task = value;
        if (value) {
            this.formData = {
                title:       value.Name           || '',
                status:      value.Status__c       || 'ToDo',
                priority:    value.Priority__c     || 'Medium',
                category:    value.Category__c     || 'Work',
                dueDate:     value.Due_Date__c     || '',
                assignedTo:  value.Assigned_To__c  || '',
                tags:        value.Tags__c         || '',
                description: value.Description__c  || ''
            };
        } else {
            this.formData = {
                title:       '',
                status:      this.defaultStatus || 'ToDo',
                priority:    'Medium',
                category:    'Work',
                dueDate:     '',
                assignedTo:  '',
                tags:        '',
                description: ''
            };
        }
    }

    // ─── Computed ─────────────────────────────────────────────────────────────
    get isEdit()      { return !!this._task; }
    get modalTitle()  { return this.isEdit ? 'Edit Task' : 'Create New Task'; }
    get modalSubtitle() {
        return this.isEdit
            ? `Editing: ${this._task.Name}`
            : 'Fill in the details below to create a task';
    }
    get saveLabel()   { return this.isEdit ? 'Update Task' : 'Create Task'; }

    get headerIconClass() {
        const statusMap = { ToDo: 'todo', InProgress: 'inprogress', Completed: 'completed' };
        return `header-icon header-icon--${statusMap[this.formData.status] || 'todo'}`;
    }

    get titleInputClass() {
        return `form-input form-input--title${this.titleError ? ' form-input--error' : ''}`;
    }

    get descriptionLength() {
        return (this.formData.description || '').length;
    }

    get formattedLastModified() {
        if (!this._task?.LastModifiedDate) return '';
        return new Date(this._task.LastModifiedDate).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    }

    // Tags
    get hasTags() {
        return this.formData.tags && this.formData.tags.trim().length > 0;
    }

    get tagPreviewList() {
        if (!this.formData.tags) return [];
        return this.formData.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 6);
    }

    // ─── Status Options ───────────────────────────────────────────────────────
    get statusOptions() {
        const statuses = [
            { value: 'ToDo',       label: 'To Do',       dot: 'todo' },
            { value: 'InProgress', label: 'In Progress', dot: 'inprogress' },
            { value: 'Completed',  label: 'Completed',   dot: 'completed' }
        ];
        return statuses.map(s => ({
            ...s,
            cssClass: `status-btn${this.formData.status === s.value ? ' status-btn--active status-btn--' + s.dot : ''}`,
            dotClass: `status-dot status-dot--${s.dot}`
        }));
    }

    // ─── Priority Options ─────────────────────────────────────────────────────
    get priorityOptions() {
        const opts = [
            { value: 'Critical', label: '🔴 Critical' },
            { value: 'High',     label: '🟠 High' },
            { value: 'Medium',   label: '🟡 Medium' },
            { value: 'Low',      label: '🟢 Low' }
        ];
        return opts.map(o => ({
            ...o,
            cssClass: `priority-btn priority-btn--${o.value.toLowerCase()}${this.formData.priority === o.value ? ' priority-btn--active' : ''}`
        }));
    }

    // Category
    get workCategoryClass() {
        return `toggle-btn${this.formData.category === 'Work' ? ' toggle-btn--active toggle-btn--work' : ''}`;
    }
    get personalCategoryClass() {
        return `toggle-btn${this.formData.category === 'Personal' ? ' toggle-btn--active toggle-btn--personal' : ''}`;
    }

    // ─── Input Handlers ───────────────────────────────────────────────────────
    handleFieldChange(event) {
        const field = event.currentTarget.dataset.field;
        this.formData = { ...this.formData, [field]: event.target.value };
        if (field === 'title' && this.titleError && event.target.value.trim()) {
            this.titleError = '';
        }
    }

    handleStatusSelect(event) {
        this.formData = { ...this.formData, status: event.currentTarget.dataset.value };
    }

    handlePrioritySelect(event) {
        this.formData = { ...this.formData, priority: event.currentTarget.dataset.value };
    }

    handleCategorySelect(event) {
        this.formData = { ...this.formData, category: event.currentTarget.dataset.value };
    }

    // ─── Modal Actions ────────────────────────────────────────────────────────
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleBackdropClick() {
        this.handleClose();
    }

    stopPropagation(event) {
        event.stopPropagation();
    }

    handleSave() {
        // Validate
        if (!this.formData.title || !this.formData.title.trim()) {
            this.titleError = 'Task title is required.';
            this.template.querySelector('[data-field="title"]').focus();
            return;
        }

        this.isSaving = true;
        const payload = JSON.stringify({ ...this.formData });

        if (this.isEdit) {
            updateTask({ taskData: JSON.stringify({ id: this._task.Id, ...this.formData }) })
                .then(updated => {
                    this.isSaving = false;
                    this.dispatchEvent(new CustomEvent('save', {
                        detail: { task: updated, isNew: false }
                    }));
                })
                .catch(error => {
                    this.isSaving = false;
                    console.error('Update error:', error);
                });
        } else {
            createTask({ taskData: payload })
                .then(created => {
                    this.isSaving = false;
                    this.dispatchEvent(new CustomEvent('save', {
                        detail: { task: created, isNew: true }
                    }));
                })
                .catch(error => {
                    this.isSaving = false;
                    console.error('Create error:', error);
                });
        }
    }
}
