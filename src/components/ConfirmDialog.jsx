import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ message, subMessage, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.pawIcon}>🐾</div>
        <p className={styles.message}>{message}</p>
        {subMessage && <p className={styles.subMessage}>{subMessage}</p>}
        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={onConfirm}>确认</button>
          <button className={styles.cancelBtn} onClick={onCancel}>取消</button>
        </div>
      </div>
    </div>
  );
}
