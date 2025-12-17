import { LitElement, html } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

export class UserList extends LitElement {
    static properties = {
        users: { type: Array },
        error: { type: String },
        confirmDeleteId: { type: Number },
    };

    constructor() {
        super();
        this.users = [];
        this.error = '';
        this.confirmDeleteId = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadUsers();
    }

    async loadUsers() {
        try {
            const token = localStorage.getItem('token');

            const res = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('No autorizado o error en API');
            }

            this.users = await res.json();
        } catch (err) {
            this.error = err.message;
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

    confirmarEliminar(id) {
        this.confirmDeleteId = id;
    }

    cancelarEliminar() {
        this.confirmDeleteId = null;
    }

    eliminarUsuario(id) {
        this.dispatchEvent(new CustomEvent('delete-user', {
            detail: id,
            bubbles: true,
            composed: true
        }));
        this.confirmDeleteId = null;
    }

    render() {
        return html`
            <div class="card shadow-sm mt-4">
                <div class="card-body">

                    <!-- HEADER -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">Usuarios registrados</h4>

                        <button
                            class="btn btn-primary btn-sm"
                            @click=${this.crearUsuario}
                        >
                            + Crear usuario
                        </button>
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
                                    <td>
                                        ${user.estado
                                            ? html`<span class="badge bg-success">Activo</span>`
                                            : html`<span class="badge bg-danger">Inactivo</span>`
                                        }
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-sm btn-warning me-1"
                                            @click=${() => this.editarUsuario(user)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            class="btn btn-sm btn-danger"
                                            @click=${() => this.confirmarEliminar(user.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>

                                ${this.confirmDeleteId === user.id ? html`
                                    <tr class="table-warning">
                                        <td colspan="6">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span>
                                                    ¿Eliminar al usuario <b>${user.username}</b>?
                                                </span>
                                                <div>
                                                    <button
                                                        class="btn btn-sm btn-danger me-2"
                                                        @click=${() => this.eliminarUsuario(user.id)}
                                                    >
                                                        Sí, eliminar
                                                    </button>
                                                    <button
                                                        class="btn btn-sm btn-secondary"
                                                        @click=${this.cancelarEliminar}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ` : ''}
                            `)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define('user-list', UserList);
