import React from 'react';
import '../../styles/Modal.css';

function Modal({ isOpen, onClose, title, children, zIndex = 1000 }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: zIndex }}> 
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-button">X</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;