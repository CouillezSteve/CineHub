import { useEffect } from "react";

// Fenêtre modale Bootstrap (classes CSS uniquement, sans le JavaScript de Bootstrap).
// Si `onSubmit` est fourni, le contenu est un <form>.
export default function Modal({ show, onClose, title, children, footer, onSubmit }) {
  useEffect(() => {
    if (!show) return;
    document.body.classList.add("modal-open");
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [show, onClose]);

  if (!show) return null;

  const Wrapper = onSubmit ? "form" : "div";
  const wrapperProps = onSubmit ? { onSubmit } : {};

  return (
    <>
      <div className="modal-backdrop show" />
      <div className="modal d-block" tabIndex={-1} role="dialog" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-dialog modal-dialog-centered">
          <Wrapper className="modal-content" {...wrapperProps}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Fermer" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </Wrapper>
        </div>
      </div>
    </>
  );
}
