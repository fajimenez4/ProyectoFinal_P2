import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';
import './confirm-button.js';

export class UserActions extends LitElement {
    static properties = {
        user: { type: Object },
        loading: { type: Boolean },
        error: { type: String },
    };

    constructor() {
        super();
        this.user = null;
        this.loading = false;
        this.error = '';
    }

    createRenderRoot() {
        return this;
    }

    edit() {
        this.dispatchEvent(new CustomEvent('edit-user', {
            detail: this.user,
            bubbles: true,
            composed: true,
        }));
    }

    async onConfirmedDelete() {
        if (!this.user || this.loading) return;
        this.error = '';
        this.loading = true;
        try {
            await apiFetch(`/api/users/${this.user.id}`, { method: 'DELETE' });
            this.dispatchEvent(new CustomEvent('user-deleted', {
                detail: this.user.id,
                bubbles: true,
                composed: true,
            }));
        } catch (err) {
            this.error = err.message;
            this.dispatchEvent(new CustomEvent('user-error', {
                detail: { id: this.user.id, error: this.error },
                bubbles: true,
                composed: true,
            }));
        } finally {
            this.loading = false;
        }
    }

    render() {
        return html`
            <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-warning me-2" @click=${this.edit} ?disabled=${this.loading}>Editar</button>
                <confirm-button
                    .label=${'Eliminar'}
                    .confirmLabel=${'Sí, eliminar'}
                    @confirmed=${this.onConfirmedDelete}
                    .disabled=${this.loading}
                ></confirm-button>
                ${this.loading ? html`<div class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></div>` : ''}
                ${this.error ? html`<div class="text-danger small ms-2">${this.error}</div>` : ''}
            </div>
        `;
    }
}

customElements.define('user-actions', UserActions);
