import { LitElement, html }
from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

export class CreateButton extends LitElement {
    static properties = {
        entity: { type: String },   // user | product | etc
        label: { type: String },
    };

    constructor() {
        super();
        this.entity = '';
        this.label = 'Crear';
    }

    onClick() {
        this.dispatchEvent(new CustomEvent('create-entity', {
            detail: {
                entity: this.entity
            },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <button class="btn btn-primary mb-3" @click=${this.onClick}>
                ${this.label}
            </button>
        `;
    }
}

customElements.define('create-button', CreateButton);
