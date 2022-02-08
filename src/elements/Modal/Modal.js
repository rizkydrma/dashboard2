import React, { useCallback, useEffect } from 'react';
import Button from '../Button/Button';

import './modal.css';

function Modal(props) {
  const closeOnEscapeKeyDown = useCallback(
    (e) => {
      if ((e.charCode || e.keyCode) === 27) {
        props.onClose();
      }
    },
    [props],
  );

  useEffect(() => {
    document.body.addEventListener('keydown', closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
    };
  }, [closeOnEscapeKeyDown]);

  return (
    <div
      className={`modal ${props.show ? 'enter-done' : ''}`}
      onClick={() => props.onClose()}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">{props.title}</h4>
        </div>
        <div className="modal-body">{props.children}</div>
        <div className="modal-footer">
          <Button className="btn" onClick={() => props.onClose()}>
            Cancel
          </Button>
          {props.onSave && (
            <Button className="btn btn-theme" onClick={() => props.onSave()}>
              Simpan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
