import { LitElement, html } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

import './app-navbar.js';

export class AppLayout extends LitElement {

    static properties = {
        user: { type: Object }
    };

    constructor() {
        super();
        this.user = null;
    }

    createRenderRoot() {
        return this; // Bootstrap global
    }

    render() {
        return html`
            <!-- NAVBAR -->
            <app-navbar
                .user=${this.user}>
            </app-navbar>

            <!-- CONTENIDO -->
            <main class="container mt-4">
                <slot></slot>
            </main>
        `;
    }
}

customElements.define('app-layout', AppLayout);
