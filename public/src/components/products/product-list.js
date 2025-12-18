import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';
import './product-actions.js';

export class ProductList extends LitElement {
    static properties = {
        productos: { type: Array },
        error: { type: String },
        isAdmin: { type: Boolean },
    };

    constructor() {
        super();
        this.productos = [];
        this.error = '';
        this.isAdmin = false;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadProducts();
    }

    async loadProducts() {
        try {
            this.productos = await apiFetch('/api/productos');
            this.error = '';
        } catch (err) {
            this.error = err.message;
            this.productos = [];
        }
    }

    crearProducto() {
        if (!this.isAdmin) return;
        this.dispatchEvent(new CustomEvent('create-product', { bubbles: true, composed: true }));
    }

    render() {
        return html`
            <div class="card shadow-sm mt-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">Productos</h4>
                        ${this.isAdmin ? html`<button class="btn btn-primary btn-sm" @click=${this.crearProducto}>+ Nuevo producto</button>` : ''}
                    </div>

                    ${this.error ? html`<div class="alert alert-danger">${this.error}</div>` : ''}

                    <table class="table table-bordered table-striped">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Creado</th>
                                <th style="width:160px">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.productos.map(p => html`
                                <tr>
                                    <td>${p.id}</td>
                                    <td>${p.nombre}</td>
                                    <td>${p.precio}</td>
                                    <td>${p.stock}</td>
                                    <td>${p.created_at ?? ''}</td>
                                    <td><product-actions .producto=${p} .isAdmin=${this.isAdmin}></product-actions></td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define('product-list', ProductList);
