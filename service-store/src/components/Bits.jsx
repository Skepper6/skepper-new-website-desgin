import { useEffect, useRef } from "react";

export const Arrow = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 14 13.4 2.6M4.6 2.2h9.2v9.2" /></svg>
);
export const Cross = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m3 3 12 12M15 3 3 15" /></svg>
);

/** The button used all over theskepper.com: a dark pill, its words roll over, a white disc with an arrow. */
export function Pill({ children, href, className = "", ...rest }) {
  const inner = (
    <>
      <span className="roll"><span>{children}</span><span aria-hidden="true">{children}</span></span>
      <i><Arrow /></i>
    </>
  );
  return href ? <a className={"bigbtn " + className} href={href} {...rest}>{inner}</a> : <button type="button" className={"bigbtn " + className} {...rest}>{inner}</button>;
}

/** A native dialog: the browser keeps focus inside it and gives it back on close. */
export function Layer({ onClose, className, label, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    document.documentElement.classList.add("locked");
    return () => document.documentElement.classList.remove("locked");
  }, []);
  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onMouseDown={(e) => e.target === ref.current && onClose()}
    >
      {children}
    </dialog>
  );
}

export const Field = ({ label, id, children, ...rest }) => (
  <div className="field"><label htmlFor={id}>{label}</label>{children || <input id={id} name={id} {...rest} />}</div>
);
