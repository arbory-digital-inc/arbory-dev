import { ModalConfig, QueryInputConfig } from '../types/config.js';
export type ModalData = {
    openModal: () => void;
    closeModal: () => void;
};
export declare function mountSearchModal(customConfig: ModalConfig): void;
export declare function mountQueryInput(customConfig: QueryInputConfig, mountPoint?: Element): HTMLDivElement;
