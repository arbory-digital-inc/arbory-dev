import { Modal } from '../../types/config';
declare const createSearchModal: (config: Modal) => {
    element: HTMLDialogElement;
    openModal: () => void;
    closeModal: () => void;
};
export { createSearchModal };
