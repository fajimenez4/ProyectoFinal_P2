import { LitElement, html }
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

import './user-list.js';
import './user-form.js';

export class UserPage extends LitElement {
    static properties = {
        view: { type: String },     // list | form
        selectedUser: { type: Object },
    };

    constructor() {
        super();
        this.view = 'list';
        this.selectedUser = null;
    }

    connectedCallback() {
        super.connectedCallback();

        this.addEventListener('create-user', () => {
            this.selectedUser = null;
            this.view = 'form';
        });

        this.addEventListener('edit-user', (e) => {
            this.selectedUser = e.detail;
            this.view = 'form';
        });

        this.addEventListener('user-saved', () => {
            this.view = 'list';
        });

        this.addEventListener('cancel', () => {
            this.view = 'list';
        });
    }

    render() {
        return html`
            ${this.view === 'list' ? html`
                <user-list></user-list>
            ` : ''}

            ${this.view === 'form' ? html`
                <user-form .user=${this.selectedUser}></user-form>
            ` : ''}
        `;
    }
}

customElements.define('user-page', UserPage);
