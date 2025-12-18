import { LitElement, html } 
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

export class AuthButtons extends LitElement {

    // Bootstrap necesita light DOM
    createRenderRoot() {
        return this;
    }

    login() {
        this.dispatchEvent(new CustomEvent('show-login', {
            bubbles: true,
            composed: true
        }));
    }

    register() {
        this.dispatchEvent(new CustomEvent('show-register', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="d-flex gap-2">
                <button class="btn btn-outline-light btn-sm"
                    @click=${this.login}>
                    Iniciar sesión
                </button>

                <button class="btn btn-light btn-sm"
                    @click=${this.register}>
                    Registrarse
                </button>
            </div>
        `;
    }
}

customElements.define('auth-buttons', AuthButtons);
