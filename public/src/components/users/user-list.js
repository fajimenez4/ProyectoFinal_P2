import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';
import './user-actions.js';

export class UserList extends LitElement {
    static properties = {
        users: { type: Array },
        error: { type: String },
        loading: { type: Boolean },
    };

    constructor() {
        super();
        this.users = [];
        this.error = '';
        this.loading = false;
    }

    createRenderRoot() {
        return this; // Bootstrap
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadUsers();
    }

    async loadUsers() {
        this.loading = true;
        this.error = '';
        
        try {
            this.users = await apiFetch('/api/users');
        } catch (err) {
            this.error = err.message;
            this.users = [];
        } finally {
            this.loading = false;
        }
    }

    createUser() {
        this.dispatchEvent(new CustomEvent('create-user', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">Usuarios</h4>
                        <button class="btn btn-primary btn-sm" @click=${this.createUser}>
                            + Nuevo usuario
                        </button>
                    </div>

                    ${this.error ? html`
                        <div class="alert alert-danger">${this.error}</div>
                    ` : ''}

                    ${this.loading ? html`
                        <div class="text-center py-4">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ` : html`
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead class="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Roles</th>
                                        <th>Creado</th>
                                        <th style="width:180px">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.users.length === 0 ? html`
                                        <tr>
                                            <td colspan="7" class="text-center text-muted py-4">
                                                No hay usuarios registrados
                                            </td>
                                        </tr>
                                    ` : this.users.map(user => html`
                                        <tr>
                                            <td>${user.id}</td>
                                            <td>${user.username}</td>
                                            <td>${user.name}</td>
                                            <td>${user.email}</td>
                                            <td>
                                                ${user.roles?.map(r => html`
                                                    <span class="badge bg-secondary me-1">${r.name}</span>
                                                `) || html`<span class="text-muted">Sin rol</span>`}
                                            </td>
                                            <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
                                            <td>
                                                <user-actions .user=${user}></user-actions>
                                            </td>
                                        </tr>
                                    `)}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
}

customElements.define('user-list', UserList);