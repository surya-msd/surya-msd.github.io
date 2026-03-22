import { LightningElement, api } from 'lwc';

const STATUS_ORDER = ['ToDo', 'InProgress', 'Completed'];

export default class TaskCard extends LightningElement {

    @api task;

    // ─── CSS Classes ──────────────────────────────────────────────────────────
    get cardClass() {
        return `task-card task-card--${(this.task.Status__c || '').toLowerCase().replace(' ', '')}`;
    }

    get priorityBarClass() {
        const p = (this.task.Priority__c || 'medium').toLowerCase();
        return `priority-bar priority-bar--${p}`;
    }

    get categoryBadgeClass() {
        const c = (this.task.Category__c || 'work').toLowerCase();
        return `badge category-badge category-badge--${c}`;
    }

    get priorityBadgeClass() {
        const p = (this.task.Priority__c || 'medium').toLowerCase();
        return `badge priority-badge priority-badge--${p}`;
    }

    get dueDateClass() {
        return `meta-item due-date${this.isOverdue ? ' overdue' : ''}`;
    }

    // ─── Computed Values ──────────────────────────────────────────────────────
    get priorityLabel() {
        const icons = { Critical: '🔴', High: '🟠', Medium: '🟡', Low: '🟢' };
        return `${icons[this.task.Priority__c] || ''} ${this.task.Priority__c || ''}`;
    }

    get hasTags() {
        return this.task.Tags__c && this.task.Tags__c.trim().length > 0;
    }

    get tagList() {
        if (!this.task.Tags__c) return [];
        return this.task.Tags__c.split(',').map(t => t.trim()).filter(Boolean).slice(0, 4);
    }

    get formattedDueDate() {
        if (!this.task.Due_Date__c) return '';
        const d = new Date(this.task.Due_Date__c + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    get isOverdue() {
        if (!this.task.Due_Date__c) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(this.task.Due_Date__c) < today && this.task.Status__c !== 'Completed';
    }

    // ─── Quick Move Buttons ───────────────────────────────────────────────────
    get currentStatusIndex() {
        return STATUS_ORDER.indexOf(this.task.Status__c);
    }

    get showMoveLeft() {
        return this.currentStatusIndex > 0;
    }

    get showMoveRight() {
        return this.currentStatusIndex < STATUS_ORDER.length - 1;
    }

    get moveLeftLabel() {
        const idx = this.currentStatusIndex;
        return idx > 0 ? `Move to ${STATUS_ORDER[idx - 1]}` : '';
    }

    get moveRightLabel() {
        const idx = this.currentStatusIndex;
        return idx < STATUS_ORDER.length - 1 ? `Move to ${STATUS_ORDER[idx + 1]}` : '';
    }

    // ─── Event Handlers ───────────────────────────────────────────────────────
    handleEdit(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('edit', { detail: { task: { ...this.task } } }));
    }

    handleDelete(event) {
        event.stopPropagation();
        // eslint-disable-next-line no-alert
        if (window.confirm(`Delete "${this.task.Name}"? This cannot be undone.`)) {
            this.dispatchEvent(new CustomEvent('delete', { detail: { taskId: this.task.Id } }));
        }
    }

    handleMoveLeft(event) {
        event.stopPropagation();
        const idx = this.currentStatusIndex;
        if (idx > 0) {
            this.dispatchEvent(new CustomEvent('statuschange', {
                detail: { taskId: this.task.Id, newStatus: STATUS_ORDER[idx - 1] }
            }));
        }
    }

    handleMoveRight(event) {
        event.stopPropagation();
        const idx = this.currentStatusIndex;
        if (idx < STATUS_ORDER.length - 1) {
            this.dispatchEvent(new CustomEvent('statuschange', {
                detail: { taskId: this.task.Id, newStatus: STATUS_ORDER[idx + 1] }
            }));
        }
    }
}
