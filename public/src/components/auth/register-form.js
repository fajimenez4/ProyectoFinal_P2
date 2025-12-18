import { LitElement, html, css }
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';

export class RegisterForm extends LitElement {

    static properties = {
        username: { type: String },
        name: { type: String },
        email: { type: String },
        password: { type: String },
        error: { type: String },
        loading: { type: Boolean },
    };

    static styles = css`
        :host {
            display: block;
            max-width: 420px;
            margin: 40px auto;
        }
    `;

    constructor() {
        super();
        this.username = '';
        this.name = '';
        this.email = '';
        this.password = '';
        this.error = '';
        this.loading = false;
    }

    onInput(e) {
        this[e.target.name] = e.target.value;
    }

    async register() {
        this.error = '';
        this.loading = true;

        try {
            const data = await apiFetch('/api/register', {
                method: 'POST',
                body: JSON.stringify({
                    username: this.username,
                    name: this.name,
                    email: this.email,
                    password: this.password,
                }),
            });

            // Guardar token si backend lo devuelve
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            this.dispatchEvent(new CustomEvent('register-success', {
                detail: data.user,
                bubbles: true,
                composed: true,
            }));

        } catch (err) {
            this.error = err.message;
        } finally {
            this.loading = false;
        }
    }

    render() {
        return html`
            <div class="card shadow-sm">
                <div class="card-body">

                    <h3 class="card-title text-center mb-4">
                        Crear cuenta
                    </h3>

                    <div class="mb-3">
                        <label class="form-label">Usuario</label>
                        <input
                            type="text"
                            class="form-control"
                            name="username"
                            .value=${this.username}
                            @input=${this.onInput}
                            placeholder="Nombre de usuario"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Nombre completo</label>
                        <input
                            type="text"
                            class="form-control"
                            name="name"
                            .value=${this.name}
                            @input=${this.onInput}
                            placeholder="Nombre completo"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Correo</label>
                        <input
                            type="email"
                            class="form-control"
                            name="email"
                            .value=${this.email}
                            @input=${this.onInput}
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Contraseña</label>
                        <input
                            type="password"
                            class="form-control"
                            name="password"
                            .value=${this.password}
                            @input=${this.onInput}
                            placeholder="Contraseña"
                        />
                    </div>

                    <button
                        class="btn btn-success w-100"
                        @click=${this.register}
                        ?disabled=${this.loading}
                    >
                        ${this.loading ? 'Registrando...' : 'Registrarse'}
                    </button>

                    ${this.error ? html`
                        <div class="alert alert-danger mt-3 mb-0">
                            ${this.error}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

customElements.define('register-form', RegisterForm);
