import { LitElement, html } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";
import '../auth/auth-buttons.js';

export class AppNavbar extends LitElement {

    static properties = {
        user: { type: Object }
    };

    constructor() {
        super();
        this.user = null;
    }

    createRenderRoot() {
        return this; // Bootstrap
    }

    logout() {
        this.dispatchEvent(new CustomEvent('logout', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <nav class="navbar navbar-dark bg-dark">
                <div class="container-fluid">

                    <span class="navbar-brand fw-bold">
                        StoreManager
                    </span>

                    ${this.user
                        ? html`
                            <div class="d-flex align-items-center gap-3">
                                <span class="text-light small">
                                    ${this.user.username}
                                </span>

                                <button class="btn btn-outline-light btn-sm"
                                    @click=${this.logout}>
                                    Cerrar sesión
                                </button>
                            </div>
                        `
                        : html`
                            <auth-buttons></auth-buttons>
                        `
                    }
                </div>
            </nav>
        `;
    }
}

customElements.define('app-navbar', AppNavbar);
