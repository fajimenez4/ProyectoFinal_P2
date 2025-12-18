import { LitElement, html } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';
import './user-actions.js';
import '../shared/create-button.js';


export class UserList extends LitElement {
    static properties = {
        users: { type: Array },
        error: { type: String },
        // ...removed confirmDeleteId...
    };

    constructor() {
        super();
        this.users = [];
        this.error = '';
        // ...removed confirmDeleteId init...
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadUsers();
    }

    async loadUsers() {
        try {
            const data = await apiFetch('/api/users');
            this.users = data;
            this.error = '';
        } catch (err) {
            this.error = err.message;
            this.users = [];
        }
    }

    crearUsuario() {
        this.dispatchEvent(new CustomEvent('create-user', {
            bubbles: true,
            composed: true
        }));
    }

    editarUsuario(user) {
        this.dispatchEvent(new CustomEvent('edit-user', {
            detail: user,
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="card shadow-sm mt-4">
                <div class="card-body">
                    <!-- HEADER -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">Usuarios registrados</h4>

                        <create-button
                            label="Crear usuario"
                            type="user"
                            @create=${this.crearUsuario}>
                        </create-button>

                    </div>

                    ${this.error ? html`
                        <div class="alert alert-danger">
                            ${this.error}
                        </div>
                    ` : ''}

                    <table class="table table-bordered table-striped align-middle">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Roles</th>
                                <th>Estado</th>
                                <th style="width: 180px">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.users.map(user => html`
                                <tr>
                                    <td>${user.id}</td>
                                    <td>${user.username}</td>
                                    <td>${user.name}</td>
                                    <td>${user.email}</td>
                                    <td>${(user.roles || []).map(r => r.name).join(', ')}</td>
                                    <td>
                                        ${user.estado
                                            ? html`<span class="badge bg-success">Activo</span>`
                                            : html`<span class="badge bg-danger">Inactivo</span>`
                                        }
                                    </td>
                                    <td>
                                        <user-actions .user=${user}></user-actions>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define('user-list', UserList);
