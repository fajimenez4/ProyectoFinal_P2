import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';
import '../shared/delete-button.js';

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
        return this; // Bootstrap
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
            await apiFetch(`/api/users/${this.user.id}`, {
                method: 'DELETE'
            });

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
        // Prevenir eliminar al usuario admin principal
        const isProtectedUser = this.user?.username === 'admin' || this.user?.id === 1;

        return html`
            <div class="d-flex align-items-center gap-2">
                <button 
                    class="btn btn-sm btn-warning" 
                    @click=${this.edit}
                    ?disabled=${this.loading}
                >
                    Editar
                </button>

                ${isProtectedUser ? html`
                    <button 
                        class="btn btn-sm btn-secondary" 
                        disabled
                        title="No se puede eliminar el usuario administrador"
                    >
                        <i class="bi bi-shield-lock-fill"></i> Protegido
                    </button>
                ` : html`
                    <delete-button
                        .label=${'Eliminar'}
                        .confirmLabel=${'Sí, eliminar'}
                        @delete-confirmed=${this.onConfirmedDelete}
                        .disabled=${this.loading}
                    ></delete-button>
                `}

                ${this.loading ? html`
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                ` : ''}

                ${this.error ? html`
                    <div class="text-danger small">${this.error}</div>
                ` : ''}
            </div>
        `;
    }
}

customElements.define('user-actions', UserActions);