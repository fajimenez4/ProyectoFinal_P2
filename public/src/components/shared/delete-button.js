import { LitElement, html } from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

export class DeleteButton extends LitElement {
    static properties = {
        label: { type: String },
        confirmLabel: { type: String },
        cancelLabel: { type: String },
        show: { type: Boolean },
        disabled: { type: Boolean },
    };

    constructor() {
        super();
        this.label = 'Eliminar';
        this.confirmLabel = 'Confirmar';
        this.cancelLabel = 'Cancelar';
        this.show = false;
        this.disabled = false;
    }

    // Sin shadow DOM (para Bootstrap)
    createRenderRoot() {
        return this;
    }

    onPrimaryClick(e) {
        e?.preventDefault();
        e?.stopPropagation();
        if (this.disabled) return;
        this.show = true;
    }

    onConfirm() {
        this.show = false;

        // Evento genérico, el padre decide qué borrar
        this.dispatchEvent(
            new CustomEvent('delete-confirmed', {
                bubbles: true,
                composed: true,
            })
        );
    }

    onCancel() {
        this.show = false;
    }

    render() {
        return html`
            ${this.show
                ? html`
                    <div class="d-inline-flex gap-2">
                        <button
                            class="btn btn-sm btn-danger"
                            @click=${this.onConfirm}
                            ?disabled=${this.disabled}
                        >
                            ${this.confirmLabel}
                        </button>

                        <button
                            class="btn btn-sm btn-secondary"
                            @click=${this.onCancel}
                            ?disabled=${this.disabled}
                        >
                            ${this.cancelLabel}
                        </button>
                    </div>
                `
                : html`
                    <button
                        class="btn btn-sm btn-danger"
                        @click=${this.onPrimaryClick}
                        ?disabled=${this.disabled}
                    >
                        ${this.label}
                    </button>
                `}
        `;
    }
}

customElements.define('delete-button', DeleteButton);
