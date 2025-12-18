import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';
import './confirm-button.js';

export class ProductActions extends LitElement {
    static properties = {
        producto: { type: Object },
        loading: { type: Boolean },
        error: { type: String },
        isAdmin: { type: Boolean },
    };

    constructor() {
        super();
        this.producto = null;
        this.loading = false;
        this.error = '';
        this.isAdmin = false;
    }

    createRenderRoot() {
        return this;
    }

    edit() {
        if (!this.isAdmin) return;
        this.dispatchEvent(new CustomEvent('edit-product', {
            detail: this.producto,
            bubbles: true,
            composed: true,
        }));
    }

    async onConfirmedDelete() {
        if (!this.producto || this.loading || !this.isAdmin) return;
        this.error = '';
        this.loading = true;
        try {
            await apiFetch(`/api/productos/${this.producto.id}`, { method: 'DELETE' });
            this.dispatchEvent(new CustomEvent('product-deleted', {
                detail: this.producto.id,
                bubbles: true,
                composed: true,
            }));
        } catch (err) {
            this.error = err.message;
            this.dispatchEvent(new CustomEvent('product-error', {
                detail: { id: this.producto.id, error: this.error },
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
                <button class="btn btn-sm btn-warning me-2" @click=${this.edit} ?disabled=${this.loading || !this.isAdmin}>Editar</button>
                <confirm-button
                    .label=${'Eliminar'}
                    .confirmLabel=${'Sí, eliminar'}
                    @confirmed=${this.onConfirmedDelete}
                    .disabled=${this.loading || !this.isAdmin}
                ></confirm-button>
                ${this.loading ? html`<div class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></div>` : ''}
                ${this.error ? html`<div class="text-danger small ms-2">${this.error}</div>` : ''}
            </div>
        `;
    }
}

customElements.define('product-actions', ProductActions);
