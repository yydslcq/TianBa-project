export default function Modal({ open, title, children, onClose, labelledBy = 'modal-title' }) {
  if (!open) return null;

  return (
    <div className="modal is-open" aria-hidden={!open} onClick={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭弹窗">
          关闭
        </button>
        {title ? <h3 id={labelledBy}>{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}
