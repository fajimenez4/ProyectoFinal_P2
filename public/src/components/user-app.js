import { LitElement, html, css }
    from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from './api/api-client.js';
import './auth/login-form.js';
import './users/user-list.js';
import './users/user-form.js';
import './layout/app-navbar.js';
import './products/product-list.js';
import './products/producto-form.js';

export class UserApp extends LitElement {
    static properties = {
        user: { type: Object },
        token: { type: String },
        view: { type: String }
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
        this.token = localStorage.getItem('token');
        this.view = 'login'; // login | register | users
    }


    connectedCallback() {
        super.connectedCallback();

        // Escuchar evento de login desde cualquier componente hijo
        this.addEventListener('login-success', async (e) => {
            // Guardar token ya lo hace el componente de login; recargar usuario
            this.token = localStorage.getItem('token');
            await this.loadCurrentUser(); // obtiene usuario con roles desde API
        });

        this.addEventListener('logout', () => {
            this.logout();
        });

        this.addEventListener('show-login', () => {
            this.view = 'login';
            this.requestUpdate();
        });

        this.addEventListener('show-register', () => {
            this.view = 'register';
            this.requestUpdate();
        });

        // Cuando se guarda o elimina un usuario, refrescar la lista
        this.addEventListener('user-saved', () => this.refreshUsers());
        this.addEventListener('user-deleted', () => this.refreshUsers());
        // Productos: refrescar al crear/editar/eliminar
        this.addEventListener('product-saved', () => this.refreshProducts());
        this.addEventListener('product-deleted', () => this.refreshProducts());

        // IMPORTANTE: Capturar eventos de create/edit y reenviarlos a los formularios
        // Los eventos vienen desde las listas/actions, necesitamos redirigirlos a los formularios

        this.addEventListener('create-user', (e) => {
            e.stopPropagation(); // Evitar propagación múltiple
            const form = this.querySelector('user-form');
            if (form) {
                form.dispatchEvent(new CustomEvent('create-user', {
                    bubbles: false,
                    composed: false,
                }));
            }
        });

        this.addEventListener('create-product', (e) => {
            e.stopPropagation(); // Evitar propagación múltiple
            const form = this.querySelector('producto-form');
            if (form) {
                form.dispatchEvent(new CustomEvent('create-product', {
                    bubbles: false,
                    composed: false,
                }));
            }
        });

        this.addEventListener('edit-product', (e) => {
            e.stopPropagation(); // Evitar propagación múltiple
            const form = this.querySelector('producto-form');
            if (form) {
                form.dispatchEvent(new CustomEvent('edit-product', {
                    detail: e.detail,
                    bubbles: false,
                    composed: false,
                }));
            }
        });

        this.addEventListener('edit-user', (e) => {
            e.stopPropagation(); // Evitar propagación múltiple
            const form = this.querySelector('user-form');
            if (form) {
                form.dispatchEvent(new CustomEvent('edit-user', {
                    detail: e.detail,
                    bubbles: false,
                    composed: false,
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
            }).catch(() => { });
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
        // Verificar roles del usuario
        const isAdmin = this.user?.roles?.some(r => r.name === 'admin') ?? false;
        const isEmpleado = this.user?.roles?.some(r => r.name === 'empleado') ?? false;
        const canManageProducts = isAdmin || isEmpleado;

        return html`
            <app-navbar .user=${this.user} @logout=${this.logout}></app-navbar>

            <!-- CONTENIDO -->
            <div class="container mt-5">
                ${!this.token || !this.user ? html`
                    <div class="row justify-content-center">
                        <div class="col-md-5">

                            ${this.view === 'login' ? html`
                                <login-form></login-form>
                            ` : ''}

                            ${this.view === 'register' ? html`
                                <user-form mode="register"></user-form>
                            ` : ''}

                        </div>
                    </div>
                ` : html`
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="card shadow-sm">
                                <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                                    <div>
                                        <h3 class="card-title mb-1">Bienvenido, ${this.user.name}</h3>
                                        <p class="mb-0 small text-muted">
                                            Usuario: ${this.user.username} · ${this.user.email}
                                            ${this.user.roles?.length ? html`
                                                <br>
                                                <span class="mt-1 d-inline-block">
                                                    Roles: 
                                                    ${this.user.roles.map(r => html`
                                                        <span class="badge bg-primary me-1">${r.name}</span>
                                                    `)}
                                                </span>
                                            ` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SECCIÓN DE USUARIOS - SOLO ADMIN -->
                    ${isAdmin ? html`
                        <div class="row mb-4">
                            <div class="col-md-8 mb-4 mb-md-0 order-md-1">
                                <user-list></user-list>
                            </div>
                            <div class="col-md-4 order-md-2">
                                <user-form></user-form>
                            </div>
                        </div>
                    ` : ''}

                    <!-- SECCIÓN DE PRODUCTOS -->
                    <div class="row">
                        ${canManageProducts ? html`
                            <!-- Admin y Empleado ven formulario + lista -->
                            <div class="col-md-8 mb-4 order-md-1">
                                <product-list .isAdmin=${canManageProducts}></product-list>
                            </div>
                            <div class="col-md-4 order-md-2">
                                <producto-form></producto-form>
                            </div>
                        ` : html`
                            <!-- Usuario sin permisos solo ve lista -->
                            <div class="col-12">
                                <product-list .isAdmin=${false}></product-list>
                            </div>
                        `}
                    </div>
                `}
            </div>
        `;
    }


}

customElements.define('user-app', UserApp);