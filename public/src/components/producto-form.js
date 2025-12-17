import { LitElement, html, css } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

export class ProductoForm extends LitElement {
    static properties = {
        nombre: { type: String },
        precio: { type: String },
        stock: { type: String },
        creado: { type: Object },
        error: { type: String },
        enviando: { type: Boolean },
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
        this.nombre = "";
        this.precio = "";
        this.stock = "";
        this.creado = null;
        this.error = "";
        this.enviando = false;
    }

    createRenderRoot() {
        return this;
    }

    onInput(e) {
        const campo = e.target.name;
        this[campo] = e.target.value;
    }

    async guardar() {
        this.error = "";
        this.creado = null;
        this.enviando = true;

        try {
            const res = await fetch("/api/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: this.nombre,
                    precio: Number(this.precio),
                    stock: Number(this.stock),
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);

                if (data?.errors) {
                    const mensajes = Object.values(data.errors).flat().join(" | ");
                    throw new Error(mensajes);
                }

                throw new Error(`Error HTTP ${res.status}`);
            }

            this.creado = await res.json();
            this.nombre = "";
            this.precio = "";
            this.stock = "";
        } catch (err) {
            this.error = err?.message ?? "Error desconocido";
        } finally {
            this.enviando = false;
        }
    }

    render() {
        return html`
        <h2 class="mb-4">Ingresar producto</h2>

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

        <button class="btn btn-primary"
            ?disabled=${this.enviando}
            @click=${this.guardar}>
            ${this.enviando ? "Guardando..." : "Guardar"}
        </button>

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
