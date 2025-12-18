import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import '../shared/delete-button.js';
import '../shared/create-button.js';

export class UserActions extends LitElement {
    static properties = {
        user: { type: Object },
        isAdmin: { type: Boolean },
    };

    createRenderRoot() {
        return this;
    }

    editUser() {
        this.dispatchEvent(new CustomEvent('edit-user', {
            detail: this.user,
            bubbles: true,
            composed: true,
        }));
    }

    deleteUser() {
        this.dispatchEvent(new CustomEvent('delete-user', {
            detail: this.user,
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        if (!this.isAdmin) return html``;

        return html`
            <div class="d-flex gap-2">
                <create-button
                    label="Editar"
                    @action=${this.editUser}>
                </create-button>

                <delete-button
                    label="Eliminar"
                    @confirm=${this.deleteUser}>
                </delete-button>
            </div>
        `;
    }
}

customElements.define('user-actions', UserActions);
