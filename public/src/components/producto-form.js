import { LitElement, html, css } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';

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
    };

    static styles = css`
        .grupo { margin-bottom: 12px; }
        label { display: block; margin-bottom: 6px; font-weight: 600; }
        input { width: 100%; padding: 10px; box-sizing: border-box; }
        button { pade2ding: 10px 14px; cursor: pointer; }
        .ok { margin-top: 14px; padding: 12px; border: 1px solid #ddd; }
        .err { margin-top: 14px; padding: 12px; border: 1px solid #c00; color: #c00; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    `;

    constructor() {
        super();
        this.reset();
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
        this[campo] = e.target.value;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('create-product', () => {
            this.reset();
        });

        this.addEventListener('edit-product', (e) => {
            const p = e.detail;
            this.id = p.id;
            this.nombre = p.nombre;
            this.precio = String(p.precio);
            this.stock = String(p.stock);
            this.mode = 'edit';
            this.error = '';
        });
    }

    async guardar() {
        this.error = "";
        this.creado = null;
        this.enviando = true;

        try {
            const payload = {
                nombre: this.nombre,
                precio: Number(this.precio),
                stock: Number(this.stock),
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
            this.reset();
        } catch (err) {
            this.error = err?.message ?? "Error desconocido";
        } finally {
            this.enviando = false;
        }
    }

    cancelEdit() {
        this.reset();
    }

    render() {
        return html`
        <h2 class="mb-4">${this.mode === 'edit' ? 'Editar producto' : 'Ingresar producto'}</h2>

        <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input class="form-control"
                name="nombre"
                .value=${this.nombre}
                @input=${this.onInput}>
        </div>

        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">Precio</label>
                <input class="form-control"
                    type="number"
                    step="0.01"
                    name="precio"
                    .value=${this.precio}
                    @input=${this.onInput}>
            </div>

            <div class="col-md-6 mb-3">
                <label class="form-label">Stock</label>
                <input class="form-control"
                    type="number"
                    name="stock"
                    .value=${this.stock}
                    @input=${this.onInput}>
            </div>
        </div>

        <div class="d-flex gap-2">
            ${this.mode === 'edit' ? html`
                <button class="btn btn-secondary" @click=${this.cancelEdit} ?disabled=${this.enviando}>Cancelar</button>
            ` : ''}

            <button class="btn btn-primary" ?disabled=${this.enviando} @click=${this.guardar}>
                ${this.enviando ? "Guardando..." : (this.mode === 'edit' ? 'Actualizar' : 'Guardar')}
            </button>
        </div>

        ${this.error
                    ? html`<div class="alert alert-danger mt-3">${this.error}</div>`
                    : ""}

        ${this.creado
                    ? html`
                <div class="alert alert-success mt-3">
                    <b>Producto creado:</b> ${this.creado.nombre}
                </div>
            `
                    : ""}
        `;
    }

}

customElements.define("producto-form", ProductoForm);
