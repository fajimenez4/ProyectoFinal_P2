import { LitElement, html, css }
    from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';

import './login-form.js';
import './user-list.js';
import './user-form.js';
import './app.navbar.js';
import './product-list.js';
import './producto-form.js';

export class UserApp extends LitElement {
    static properties = {
        user: { type: Object },
        token: { type: String },
    };

    static styles = css`
        :host {
        display: block;
        padding: 20px;
        font-family: Arial, sans-serif;
        }
        .panel {
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 8px;
        }
        button {
        margin-top: 15px;
        padding: 8px 12px;
        cursor: pointer;
        }
    `;

    constructor() {
        super();
        this.user = null;
        this.token = localStorage.getItem('token') || null;
    }

    connectedCallback() {
        super.connectedCallback();

        // Escuchar evento de login desde cualquier componente hijo
        this.addEventListener('login-success', async (e) => {
            // Guardar token ya lo hace el componente de login; recargar usuario
            this.token = localStorage.getItem('token');
            await this.loadCurrentUser(); // obtiene usuario con roles desde API
        });
        // Cuando se guarda o elimina un usuario, refrescar la lista
        this.addEventListener('user-saved', () => this.refreshUsers());
        this.addEventListener('user-deleted', () => this.refreshUsers());
        // Productos: refrescar al crear/editar/eliminar
        this.addEventListener('product-saved', () => this.refreshProducts());
        this.addEventListener('product-deleted', () => this.refreshProducts());
        // Crear/editar usuario: reenviar al formulario correspondiente
        this.addEventListener('create-user', () => {
            const form = this.querySelector('user-form');
            if (form && typeof form.reset === 'function') form.reset();
        });
        // Crear/editar producto: reenviar al formulario correspondiente
        this.addEventListener('create-product', () => {
            const form = this.querySelector('producto-form');
            if (form && typeof form.reset === 'function') form.reset();
        });

        this.addEventListener('edit-product', (e) => {
            const form = this.querySelector('producto-form');
            if (form) {
                form.dispatchEvent(new CustomEvent('edit-product', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true,
                }));
            }
        });

        this.addEventListener('edit-user', (e) => {
            const form = this.querySelector('user-form');
            if (form) {
                form.dispatchEvent(new CustomEvent('edit-user', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true,
                }));
            }
        });

        // Si hay token guardado, intentar cargar info del usuario actual
        if (this.token && !this.user) {
            this.loadCurrentUser();
        }
    }

    logout() {
        // Llamar al backend para invalidar token (si hay uno)
        const token = localStorage.getItem('token');

        if (token) {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => {});
        }

        localStorage.removeItem('token');
        this.user = null;
        this.token = null;
    }

    // Evitar shadow DOM para que Bootstrap se aplique correctamente
    createRenderRoot() {
        return this;
    }

    async loadCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const user = await apiFetch('/api/me');
            this.user = user;
            this.token = token;
        } catch (err) {
            // token invalido -> limpiar
            console.warn('No se pudo cargar usuario actual:', err.message);
            localStorage.removeItem('token');
            this.token = null;
            this.user = null;
        }
    }

    refreshUsers() {
        const list = this.querySelector('user-list');
        if (list && typeof list.loadUsers === 'function') {
            list.loadUsers();
        }
    }
    refreshProducts() {
        const list = this.querySelector('product-list');
        if (list && typeof list.loadProducts === 'function') {
            list.loadProducts();
        }
    }

    render() {
        const isAdmin = !!(this.user && ((this.user.roles && this.user.roles.some(r => r.name === 'admin')) || this.user.username === 'admin'));

        return html`
            <app-navbar .user=${this.user} @logout=${this.logout}></app-navbar>

            <!-- CONTENIDO -->
            <div class="container mt-5">
                ${!this.token || !this.user ? html`
                    <!-- LOGIN -->
                    <div class="row justify-content-center">
                        <div class="col-md-5">
                            <login-form></login-form>
                        </div>
                    </div>
                ` : html`
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="card shadow-sm">
                                <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                                    <div>
                                        <h3 class="card-title mb-1">Bienvenido, ${this.user.name}</h3>
                                        <p class="mb-0 small text-muted">Usuario: ${this.user.username} · ${this.user.email}</p>
                                    </div>
                                    <div>
                                        <button class="btn btn-outline-secondary btn-sm" @click=${this.logout}>Cerrar sesión</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        ${isAdmin ? html`
                            <div class="col-md-4 mb-4">
                                <producto-form></producto-form>
                            </div>
                            <div class="col-md-8">
                                <product-list .isAdmin=${isAdmin}></product-list>
                            </div>
                        ` : html`
                            <div class="col-12">
                                <product-list .isAdmin=${isAdmin}></product-list>
                            </div>
                        `}
                    </div>
                `}
            </div>
        `;
    }


}

customElements.define('user-app', UserApp);
