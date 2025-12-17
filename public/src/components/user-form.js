import { LitElement, html }
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

export class UserForm extends LitElement {
    static properties = {
        id: { type: Number },
        username: { type: String },
        name: { type: String },
        email: { type: String },
        password: { type: String },
        estado: { type: Boolean },
        error: { type: String },
        loading: { type: Boolean },
        mode: { type: String }, // create | edit
    };

    constructor() {
        super();
        this.reset();
    }

    reset() {
        this.id = null;
        this.username = '';
        this.name = '';
        this.email = '';
        this.password = '';
        this.estado = true;
        this.error = '';
        this.loading = false;
        this.mode = 'create';
    }

    connectedCallback() {
        super.connectedCallback();

        this.addEventListener('create-user', () => {
            this.reset();
        });

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
        });
    }

    onInput(e) {
        const { name, value, type, checked } = e.target;
        this[name] = type === 'checkbox' ? checked : value;
    }

    async submit() {
        this.error = '';
        this.loading = true;

        try {
            const token = localStorage.getItem('token');

            const payload = {
                username: this.username,
                name: this.name,
                email: this.email,
                estado: this.estado,
            };

            if (this.password) {
                payload.password = this.password;
            }

            const url = this.mode === 'edit'
                ? `/api/users/${this.id}`
                : `/api/users`;

            const method = this.mode === 'edit' ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || 'Error al guardar');
            }

            this.dispatchEvent(new CustomEvent('user-saved', {
                bubbles: true,
                composed: true,
            }));

            this.reset();
        } catch (err) {
            this.error = err.message;
        } finally {
            this.loading = false;
        }
    }

    cancel() {
        this.reset();
    }

    render() {
        return html`
            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h4 class="card-title mb-3">
                        ${this.mode === 'edit'
                            ? 'Editar usuario'
                            : 'Crear usuario'}
                    </h4>

                    ${this.error ? html`
                        <div class="alert alert-danger">
                            ${this.error}
                        </div>
                    ` : ''}

                    <div class="mb-3">
                        <label class="form-label">Usuario</label>
                        <input
                            class="form-control"
                            name="username"
                            .value=${this.username}
                            @input=${this.onInput}
                            ?disabled=${this.mode === 'edit'}
                        >
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input
                            class="form-control"
                            name="name"
                            .value=${this.name}
                            @input=${this.onInput}
                        >
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input
                            type="email"
                            class="form-control"
                            name="email"
                            .value=${this.email}
                            @input=${this.onInput}
                        >
                    </div>

                    <div class="mb-3">
                        <label class="form-label">
                            ${this.mode === 'edit'
                                ? 'Nueva contraseña (opcional)'
                                : 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            class="form-control"
                            name="password"
                            .value=${this.password}
                            @input=${this.onInput}
                        >
                    </div>

                    <div class="form-check mb-3">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            name="estado"
                            .checked=${this.estado}
                            @change=${this.onInput}
                        >
                        <label class="form-check-label">
                            Usuario activo
                        </label>
                    </div>

                    <div class="d-flex justify-content-end">
                        ${this.mode === 'edit' ? html`
                            <button
                                class="btn btn-secondary me-2"
                                @click=${this.cancel}
                                ?disabled=${this.loading}
                            >
                                Cancelar
                            </button>
                        ` : ''}

                        <button
                            class="btn btn-success"
                            @click=${this.submit}
                            ?disabled=${this.loading}
                        >
                            ${this.loading
                                ? 'Guardando...'
                                : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('user-form', UserForm);
