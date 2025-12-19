import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

export class SaveButton extends LitElement {
    static properties = {
        loading: { type: Boolean },
        disabled: { type: Boolean },
        label: { type: String },
        loadingLabel: { type: String },
        variant: { type: String }, // primary, success, warning, etc.
        size: { type: String }, // sm, lg, o vacío para normal
    };

    constructor() {
        super();
        this.loading = false;
        this.disabled = false;
        this.label = 'Guardar';
        this.loadingLabel = 'Guardando...';
        this.variant = 'primary';
        this.size = '';
    }

    createRenderRoot() {
        return this; // Bootstrap
    }

    handleClick(e) {
        if (this.disabled || this.loading) {
            e.preventDefault();
            return;
        }
        
        this.dispatchEvent(new CustomEvent('save-click', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const sizeClass = this.size ? `btn-${this.size}` : '';
        const isDisabled = this.disabled || this.loading;

        return html`
            <button
                type="button"
                class="btn btn-${this.variant} ${sizeClass}"
                @click=${this.handleClick}
                ?disabled=${isDisabled}
            >
                ${this.loading ? html`
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ${this.loadingLabel}
                ` : this.label}
            </button>
        `;
    }
}

customElements.define('save-button', SaveButton);