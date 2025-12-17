import { LitElement, html, css }
    from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

import './login-form.js';
import './user-list.js';

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
        this.addEventListener('login-success', (e) => {
            this.user = e.detail;
            this.token = localStorage.getItem('token');
        });
    }

    logout() {
        localStorage.removeItem('token');
        this.user = null;
        this.token = null;
    }

    render() {
        return html`
            <nav class="navbar navbar-dark bg-dark">
            <div class="container-fluid">
                <span class="navbar-brand mb-0 h1">StoreManager</span>

                ${this.user
                ? html`
                <button class="btn btn-outline-light btn-sm" @click=${this.logout}>
                    Cerrar sesión
                </button>
                `
                : ''}
            </div>
        </nav>

        <!-- CONTENIDO -->
        <div class="container mt-5">
            ${!this.token || !this.user
            ? html`
            <!-- LOGIN -->
            <div class="row justify-content-center">
                <div class="col-md-5">
                    <login-form></login-form>
                </div>
            </div>
            `
            : html`
            <!-- DASHBOARD -->
            <div class="row justify-content-center mb-4">
                <div class="col-md-8">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h3 class="card-title mb-3">
                                Bienvenido, ${this.user.name}
                            </h3>

                            <p class="mb-1"><b>Usuario:</b> ${this.user.username}</p>
                            <p class="mb-1"><b>Email:</b> ${this.user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- LISTADO DE USUARIOS -->
            <div class="row justify-content-center">
                <div class="col-md-10">
                    <user-list></user-list>
                </div>
            </div>
            `}
        </div>
        `;
    }


}

customElements.define('user-app', UserApp);
