import { LitElement, html } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';

export class LoginForm extends LitElement {
    static properties = {
        username: { type: String },
        password: { type: String },
        error: { type: String },
        loading: { type: Boolean },
    };

    constructor() {
        super();
        this.username = '';
        this.password = '';
        this.error = '';
        this.loading = false;
    }
    
    createRenderRoot() {
        return this; // Bootstrap
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

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.login();
        }
    }

    goToRegister(e) {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('show-register', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <style>
                .login-container {
                    max-width: 440px;
                    margin: 0 auto;
                }
                
                .login-card {
                    border-radius: 16px;
                    border: none;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                }
                
                .login-header-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                
                .login-header-icon svg {
                    width: 40px;
                    height: 40px;
                    fill: white;
                }
                
                .login-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 0.5rem;
                }
                
                .login-subtitle {
                    color: #718096;
                    font-size: 0.95rem;
                }
                
                .form-label-custom {
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }
                
                .form-control-custom {
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                
                .form-control-custom:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    outline: none;
                }
                
                .btn-login {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 10px;
                    padding: 0.875rem 1.5rem;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                
                .btn-login:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                    background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
                }
                
                .btn-login:active:not(:disabled) {
                    transform: translateY(0);
                }
                
                .btn-login:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .alert-custom {
                    border-radius: 10px;
                    border: none;
                    background-color: #fee;
                    color: #c53030;
                    padding: 1rem;
                }
                
                .divider {
                    border-top: 1px solid #e2e8f0;
                    margin: 1.5rem 0;
                }
                
                .register-link {
                    color: #667eea;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                
                .register-link:hover {
                    color: #764ba2;
                    text-decoration: underline;
                }
            </style>

            <div class="login-container">
                <div class="card login-card">
                    <div class="card-body p-4 p-md-5">
                        <!-- Header -->
                        <div class="text-center mb-4">
                            <div class="login-header-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                                </svg>
                            </div>
                            <h3 class="login-title">Bienvenido</h3>
                            <p class="login-subtitle mb-0">Ingresa a tu cuenta</p>
                        </div>

                        <!-- Usuario -->
                        <div class="mb-3">
                            <label class="form-label form-label-custom">Usuario</label>
                            <input
                                type="text"
                                class="form-control form-control-custom"
                                name="username"
                                .value=${this.username}
                                @input=${this.onInput}
                                @keypress=${this.handleKeyPress}
                                placeholder="Ingrese su usuario"
                                autocomplete="username"
                            />
                        </div>

                        <!-- Contraseña -->
                        <div class="mb-4">
                            <label class="form-label form-label-custom">Contraseña</label>
                            <input
                                type="password"
                                class="form-control form-control-custom"
                                name="password"
                                .value=${this.password}
                                @input=${this.onInput}
                                @keypress=${this.handleKeyPress}
                                placeholder="Ingrese su contraseña"
                                autocomplete="current-password"
                            />
                        </div>

                        <!-- Botón -->
                        <button
                            class="btn btn-primary btn-login w-100 mb-3"
                            @click=${this.login}
                            ?disabled=${this.loading}
                        >
                            ${this.loading ? html`
                                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Ingresando...
                            ` : 'Ingresar'}
                        </button>

                        <!-- Error -->
                        ${this.error ? html`
                            <div class="alert alert-custom d-flex align-items-start" role="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-exclamation-triangle-fill me-2 flex-shrink-0" viewBox="0 0 16 16">
                                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                </svg>
                                <div>${this.error}</div>
                            </div>
                        ` : ''}

                        <!-- Registro -->
                        <div class="divider"></div>
                        <div class="text-center">
                            <p class="text-muted mb-0">
                                ¿No tienes cuenta? 
                                <a href="#" @click=${this.goToRegister} class="register-link">
                                    Regístrate aquí
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('login-form', LoginForm);