import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import { apiFetch } from '../api/api-client.js';
import './product-actions.js';

export class ProductList extends LitElement {
    static properties = {
        productos: { type: Array },
        error: { type: String },
        loading: { type: Boolean },
        isAdmin: { type: Boolean },
    };

    constructor() {
        super();
        this.productos = [];
        this.error = '';
        this.loading = false;
        this.isAdmin = false;
    }

    createRenderRoot() {
        return this; // Bootstrap
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadProducts();
    }

    async loadProducts() {
        this.loading = true;
        this.error = '';
        
        try {
            // IMPORTANTE: Cambia esta ruta según tu backend
            // Opción 1: Si tu backend usa /api/products
            // const data = await apiFetch('/api/products');
            
            // Opción 2: Si tu backend usa /api/productos
            const data = await apiFetch('/api/productos');
            
            this.productos = Array.isArray(data) ? data : [];
            
        } catch (err) {
            this.error = err.message;
            this.productos = [];
            console.error('Error cargando productos:', err);
        } finally {
            this.loading = false;
        }
    }

    crearProducto() {
        if (!this.isAdmin) return;
        this.dispatchEvent(new CustomEvent('create-product', { 
            bubbles: true, 
            composed: true 
        }));
    }

    editarProducto(producto) {
        if (!this.isAdmin) return;
        this.dispatchEvent(new CustomEvent('edit-product', {
            detail: producto,
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">Productos</h4>
                        ${this.isAdmin ? html`
                            <button 
                                class="btn btn-primary btn-sm" 
                                @click=${this.crearProducto}
                            >
                                + Nuevo producto
                            </button>
                        ` : ''}
                    </div>

                    ${this.error ? html`
                        <div class="alert alert-danger" role="alert">
                            <strong>Error:</strong> ${this.error}
                            <hr>
                            <small class="d-block mt-2">
                                <strong>Posibles soluciones:</strong><br>
                                1. Verifica que el backend esté corriendo<br>
                                2. Revisa que la ruta sea <code>/api/productos</code> o <code>/api/products</code><br>
                                3. Verifica que el token de autenticación sea válido
                            </small>
                            <button 
                                class="btn btn-sm btn-outline-danger mt-2" 
                                @click=${this.loadProducts}
                            >
                                Reintentar
                            </button>
                        </div>
                    ` : ''}

                    ${this.loading ? html`
                        <div class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando productos...</span>
                            </div>
                            <p class="mt-2 text-muted">Cargando productos...</p>
                        </div>
                    ` : html`
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped table-hover">
                                <thead class="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th>Creado</th>
                                        ${this.isAdmin ? html`<th style="width:180px">Acciones</th>` : ''}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.productos.length === 0 && !this.error ? html`
                                        <tr>
                                            <td colspan="${this.isAdmin ? 6 : 5}" class="text-center text-muted py-4">
                                                <div class="py-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-inbox mb-2" viewBox="0 0 16 16">
                                                        <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z"/>
                                                    </svg>
                                                    <p class="mb-0">No hay productos registrados</p>
                                                    ${this.isAdmin ? html`
                                                        <button 
                                                            class="btn btn-sm btn-primary mt-2" 
                                                            @click=${this.crearProducto}
                                                        >
                                                            Crear primer producto
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    ` : this.productos.map(p => html`
                                        <tr>
                                            <td>${p.id}</td>
                                            <td>${p.nombre}</td>
                                            <td>$${Number(p.precio).toFixed(2)}</td>
                                            <td>
                                                <span class="badge ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                                                    ${p.stock}
                                                </span>
                                            </td>
                                            <td>${p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : 'N/A'}</td>
                                            ${this.isAdmin ? html`
                                                <td>
                                                    <product-actions 
                                                        .producto=${p} 
                                                        .isAdmin=${this.isAdmin}
                                                    ></product-actions>
                                                </td>
                                            ` : ''}
                                        </tr>
                                    `)}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
}

customElements.define('product-list', ProductList);