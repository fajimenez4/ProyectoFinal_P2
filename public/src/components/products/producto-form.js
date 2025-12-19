import { LitElement, html, css } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';
import '../shared/save-button.js';

export class ProductoForm extends LitElement {
    static properties = {
        id: { type: Number },
        nombre: { type: String },
        precio: { type: String },
        stock: { type: String },
        creado: { type: Object },
        error: { type: String },
        enviando: { type: Boolean },
        mode: { type: String }, // create | edit
        visible: { type: Boolean },
    };

    static styles = css`
        .grupo { margin-bottom: 12px; }
        label { display: block; margin-bottom: 6px; font-weight: 600; }
        input { width: 100%; padding: 10px; box-sizing: border-box; }
        button { padding: 10px 14px; cursor: pointer; }
        .ok { margin-top: 14px; padding: 12px; border: 1px solid #ddd; }
        .err { margin-top: 14px; padding: 12px; border: 1px solid #c00; color: #c00; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    `;

    constructor() {
        super();
        this.reset();
        this.visible = false;
    }

    reset() {
        this.id = null;
        this.nombre = "";
        this.precio = "";
        this.stock = "";
        this.creado = null;
        this.error = "";
        this.enviando = false;
        this.mode = 'create';
    }

    createRenderRoot() {
        return this;
    }

    onInput(e) {
        const campo = e.target.name;
        let value = e.target.value;

        // Validaciones en tiempo real
        if (campo === 'precio') {
            // Solo números y un punto decimal
            value = value.replace(/[^0-9.]/g, '');
            // Solo un punto decimal
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            // Máximo 2 decimales
            if (parts[1] && parts[1].length > 2) {
                value = parts[0] + '.' + parts[1].substring(0, 2);
            }
        }

        if (campo === 'stock') {
            // Solo números enteros
            value = value.replace(/[^0-9]/g, '');
        }

        this[campo] = value;
    }

    connectedCallback() {
        super.connectedCallback();
        
        this.addEventListener('create-product', () => {
            this.reset();
            this.visible = true;
        });

        this.addEventListener('edit-product', (e) => {
            const p = e.detail;
            this.id = p.id;
            this.nombre = p.nombre;
            this.precio = String(p.precio);
            this.stock = String(p.stock);
            this.mode = 'edit';
            this.error = '';
            this.visible = true;
        });
    }

    validarFormulario() {
        const errores = [];

        if (!this.nombre.trim()) {
            errores.push('El nombre es obligatorio');
        }

        if (!this.precio || parseFloat(this.precio) <= 0) {
            errores.push('El precio debe ser mayor a 0');
        }

        if (!this.stock || parseInt(this.stock) < 0) {
            errores.push('El stock debe ser 0 o mayor');
        }

        if (errores.length > 0) {
            this.error = errores.join('. ');
            return false;
        }

        return true;
    }

    async guardar() {
        if (!this.validarFormulario()) {
            return;
        }

        this.error = "";
        this.creado = null;
        this.enviando = true;

        try {
            const payload = {
                nombre: this.nombre.trim(),
                precio: parseFloat(this.precio),
                stock: parseInt(this.stock),
            };

            if (this.mode === 'edit' && this.id) {
                await apiFetch(`/api/productos/${this.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                this.creado = await apiFetch("/api/productos", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            // Emitir evento global para refrescar lista
            this.dispatchEvent(new CustomEvent('product-saved', { bubbles: true, composed: true }));
            
            // Cerrar formulario después de un delay
            setTimeout(() => {
                this.reset();
                this.visible = false;
            }, 1500);
        } catch (err) {
            this.error = err?.message ?? "Error desconocido";
        } finally {
            this.enviando = false;
        }
    }

    cancelEdit() {
        this.reset();
        this.visible = false;
    }

    render() {
        if (!this.visible) {
            return html``;
        }

        return html`
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <h4 class="card-title mb-4">
                    ${this.mode === 'edit' ? 'Editar producto' : 'Nuevo producto'}
                </h4>

                ${this.error ? html`
                    <div class="alert alert-danger">${this.error}</div>
                ` : ''}

                ${this.creado ? html`
                    <div class="alert alert-success">
                        <b>Producto creado:</b> ${this.creado.nombre}
                    </div>
                ` : ''}

                <div class="mb-3">
                    <label class="form-label">Nombre</label>
                    <input 
                        class="form-control"
                        name="nombre"
                        .value=${this.nombre}
                        @input=${this.onInput}
                        placeholder="Ej: Laptop HP"
                    >
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Precio</label>
                        <input 
                            class="form-control"
                            type="text"
                            inputmode="decimal"
                            name="precio"
                            .value=${this.precio}
                            @input=${this.onInput}
                            placeholder="0.00"
                        >
                        <small class="text-muted">Solo números y punto decimal</small>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Stock</label>
                        <input 
                            class="form-control"
                            type="text"
                            inputmode="numeric"
                            name="stock"
                            .value=${this.stock}
                            @input=${this.onInput}
                            placeholder="0"
                        >
                        <small class="text-muted">Solo números enteros</small>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button 
                        class="btn btn-secondary" 
                        @click=${this.cancelEdit} 
                        ?disabled=${this.enviando}
                    >
                        Cancelar
                    </button>

                    <save-button
                        .loading=${this.enviando}
                        .label=${this.mode === 'edit' ? 'Actualizar' : 'Guardar'}
                        .loadingLabel=${this.mode === 'edit' ? 'Actualizando...' : 'Guardando...'}
                        @save-click=${this.guardar}
                    ></save-button>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define("producto-form", ProductoForm);