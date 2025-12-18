import { LitElement, html, css } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';

export class LoginForm extends LitElement {
    static properties = {
        username: { type: String },
        password: { type: String },
        error: { type: String },
        loading: { type: Boolean },
    };

    static styles = css`
    :host { display: block; max-width: 420px; margin: 40px auto; }
    .card { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .group { margin-bottom: 12px; }
    label { display: block; font-weight: 600; margin-bottom: 6px; }
    input { width: 100%; padding: 10px; }
    button { padding: 10px 14px; cursor: pointer; }
    .error { color: #c00; margin-top: 10px; }
    `;

    constructor() {
        super();
        this.username = '';
        this.password = '';
        this.error = '';
        this.loading = false;
    }
    

    onInput(e) {
        this[e.target.name] = e.target.value;
    }

    async login() {
        this.error = '';
        this.loading = true;

        try {
            const data = await apiFetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: this.username,
                    password: this.password,
                }),
            });

            // Guardar token
            localStorage.setItem('token', data.token);

            // Evento personalizado
            this.dispatchEvent(new CustomEvent('login-success', {
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
                <h3 class="card-title text-center mb-4">Iniciar sesión</h3>

                <div class="mb-3">
                <label class="form-label">Usuario</label>
                <input
                    type="text"
                    class="form-control"
                    name="username"
                    .value=${this.username}
                    @input=${this.onInput}
                    placeholder="Ingrese su usuario"
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
                    placeholder="Ingrese su contraseña"
                />
                </div>

                <button
                class="btn btn-primary w-100"
                @click=${this.login}
                ?disabled=${this.loading}
                >
                ${this.loading ? 'Ingresando...' : 'Ingresar'}
                </button>

                ${this.error
                ? html`
                    <div class="alert alert-danger mt-3 mb-0" role="alert">
                        ${this.error}
                    </div>
                    `
                : ''}
            </div>
        </div>
        `;
    }
}

customElements.define('login-form', LoginForm);
