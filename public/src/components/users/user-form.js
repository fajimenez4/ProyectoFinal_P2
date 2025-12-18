import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';

export class UserForm extends LitElement {
    static properties = {
        id: { type: Number },
        username: { type: String },
        name: { type: String },
        email: { type: String },
        password: { type: String },
        estado: { type: Boolean },
        mode: { type: String }, // 'create' | 'edit' | 'register'
        error: { type: String },
        loading: { type: Boolean },
        success: { type: String },
        rolesList: { type: Array },
        selectedRoles: { type: Array },
    };

    constructor() {
        super();
        this.reset();
        this.rolesList = [];
    }

    reset() {
        this.id = null;
        this.username = '';
        this.name = '';
        this.email = '';
        this.password = '';
        this.estado = true;
        this.mode = 'create';
        this.error = '';
        this.loading = false;
        this.success = '';
        this.selectedRoles = [];
    }

    createRenderRoot() {
        return this; // Bootstrap
    }

    connectedCallback() {
        super.connectedCallback();

        // Escuchar evento de crear usuario
        this.addEventListener('create-user', () => {
            this.reset();
        });

        // Escuchar evento de editar usuario
        this.addEventListener('edit-user', (e) => {
            const user = e.detail;
            this.id = user.id;
            this.username = user.username;
            this.name = user.name;
            this.email = user.email;
            this.estado = !!user.estado;
            this.password = '';
            this.mode = 'edit';
            this.error = '';
            this.success = '';
            this.selectedRoles = (user.roles || []).map(r => r.id);
        });

        // Cargar lista de roles disponibles
        this.loadRoles();
    }

    async loadRoles() {
        try {
            const roles = await apiFetch('/api/roles');
            this.rolesList = Array.isArray(roles) ? roles : [];
        } catch (err) {
            console.warn('No se pudieron cargar los roles:', err.message);
            this.rolesList = [];
        }
    }

    onInput(e) {
        const { name, value, type, checked } = e.target;
        this[name] = type === 'checkbox' ? checked : value;
    }

    onRoleToggle(e, roleId) {
        roleId = Number(roleId);
        if (e.target.checked) {
            if (!this.selectedRoles.includes(roleId)) {
                this.selectedRoles = [...this.selectedRoles, roleId];
            }
        } else {
            this.selectedRoles = this.selectedRoles.filter(id => id !== roleId);
        }
    }

    async save() {
        this.error = '';
        this.success = '';
        this.loading = true;

        try {
            const payload = {
                username: this.username,
                name: this.name,
                email: this.email,
                estado: this.estado,
                roles: this.selectedRoles
            };

            // Solo enviar password si está lleno
            if (this.password) {
                payload.password = this.password;
            }

            let result;
            if (this.mode === 'edit' && this.id) {
                // Actualizar usuario existente
                result = await apiFetch(`/api/users/${this.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                this.success = 'Usuario actualizado exitosamente';
            } else if (this.mode === 'register') {
                // Registro público (sin roles ni estado)
                const registerPayload = {
                    username: this.username,
                    name: this.name,
                    email: this.email,
                    password: this.password
                };
                result = await apiFetch('/api/register', {
                    method: 'POST',
                    body: JSON.stringify(registerPayload),
                });
                
                // Si el backend devuelve token, guardarlo y hacer login
                if (result.token) {
                    localStorage.setItem('token', result.token);
                    this.dispatchEvent(new CustomEvent('login-success', {
                        detail: result.user,
                        bubbles: true,
                        composed: true,
                    }));
                }
                this.success = 'Registro exitoso';
            } else {
                // Crear nuevo usuario (admin)
                result = await apiFetch('/api/users', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                this.success = 'Usuario creado exitosamente';
            }

            // Emitir evento para refrescar lista
            this.dispatchEvent(new CustomEvent('user-saved', {
                detail: result,
                bubbles: true,
                composed: true,
            }));

            // Limpiar formulario después de un delay (excepto en registro que redirige)
            if (this.mode !== 'register') {
                setTimeout(() => this.reset(), 1500);
            }

        } catch (err) {
            this.error = err.message;
        } finally {
            this.loading = false;
        }
    }

    cancel() {
        this.reset();
    }

    goToLogin() {
        this.dispatchEvent(new CustomEvent('show-login', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const isRegister = this.mode === 'register';
        const isEdit = this.mode === 'edit';

        return html`
            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h4 class="card-title mb-4">
                        ${isRegister ? 'Crear cuenta' : isEdit ? 'Editar usuario' : 'Crear usuario'}
                    </h4>

                    ${this.error ? html`
                        <div class="alert alert-danger">${this.error}</div>
                    ` : ''}

                    ${this.success ? html`
                        <div class="alert alert-success">${this.success}</div>
                    ` : ''}

                    <div class="mb-3">
                        <label class="form-label">Usuario</label>
                        <input
                            type="text"
                            class="form-control"
                            name="username"
                            .value=${this.username}
                            @input=${this.onInput}
                            placeholder="Nombre de usuario"
                            ?disabled=${isEdit}
                        />
                        ${isEdit ? html`
                            <small class="text-muted">El nombre de usuario no se puede cambiar</small>
                        ` : ''}
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
                        <label class="form-label">Email</label>
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
                        <label class="form-label">
                            Contraseña ${isEdit ? '(dejar vacío para no cambiar)' : ''}
                        </label>
                        <input
                            type="password"
                            class="form-control"
                            name="password"
                            .value=${this.password}
                            @input=${this.onInput}
                            placeholder=${isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                        />
                    </div>

                    ${!isRegister ? html`
                        <div class="form-check mb-3">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                name="estado"
                                .checked=${this.estado}
                                @change=${this.onInput}
                            />
                            <label class="form-check-label">
                                Usuario activo
                            </label>
                        </div>

                        ${this.rolesList.length ? html`
                            <div class="mb-3">
                                <label class="form-label">Roles</label>
                                <div>
                                    ${this.rolesList.map(r => html`
                                        <div class="form-check">
                                            <input 
                                                class="form-check-input" 
                                                type="checkbox" 
                                                id="role-${r.id}"
                                                .checked=${this.selectedRoles.includes(r.id)}
                                                @change=${(e) => this.onRoleToggle(e, r.id)}
                                            />
                                            <label class="form-check-label" for="role-${r.id}">
                                                ${r.name}
                                            </label>
                                        </div>
                                    `)}
                                </div>
                            </div>
                        ` : ''}
                    ` : ''}

                    <div class="d-flex gap-2">
                        ${isEdit ? html`
                            <button 
                                class="btn btn-secondary" 
                                @click=${this.cancel}
                                ?disabled=${this.loading}
                            >
                                Cancelar
                            </button>
                        ` : ''}

                        <button
                            class="btn btn-primary"
                            @click=${this.save}
                            ?disabled=${this.loading}
                        >
                            ${this.loading 
                                ? 'Guardando...' 
                                : isEdit 
                                    ? 'Actualizar' 
                                    : isRegister 
                                        ? 'Registrarse' 
                                        : 'Guardar'
                            }
                        </button>
                    </div>

                    ${isRegister ? html`
                        <div class="mt-3 text-center">
                            <small class="text-muted">
                                ¿Ya tienes cuenta? 
                                <a href="#" @click=${this.goToLogin} class="text-decoration-none">
                                    Iniciar sesión
                                </a>
                            </small>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

customElements.define('user-form', UserForm);