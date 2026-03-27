import type { CSSProperties, ReactNode } from "react";

const frameStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  padding: "24px",
};

const embeddedFrameStyle: CSSProperties = {
  minHeight: "50vh",
  alignItems: "center",
};

const fullScreenFrameStyle: CSSProperties = {
  minHeight: "100vh",
  alignItems: "center",
  background:
    "radial-gradient(circle at top left, rgba(34, 197, 94, 0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.18), transparent 28%), linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%)",
  color: "#e2e8f0",
};

const panelStyle: CSSProperties = {
  width: "min(100%, 720px)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "28px",
  padding: "32px",
  background: "rgba(15, 23, 42, 0.82)",
  backdropFilter: "blur(18px)",
  boxShadow: "0 24px 80px rgba(2, 6, 23, 0.48)",
};

const iconWrapStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "999px",
  background: "rgba(125, 211, 252, 0.12)",
  color: "#7dd3fc",
};

const eyebrowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(125, 211, 252, 0.12)",
  color: "#7dd3fc",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.02em",
};

const titleStyle: CSSProperties = {
  margin: "18px 0 14px",
  fontSize: "clamp(32px, 6vw, 48px)",
  lineHeight: 1.05,
  letterSpacing: "-0.04em",
  color: "#f8fafc",
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "16px",
  lineHeight: 1.75,
};

const detailStyle: CSSProperties = {
  marginTop: "24px",
  padding: "18px 20px",
  borderRadius: "20px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(15, 23, 42, 0.78)",
  color: "#cbd5e1",
  fontSize: "15px",
  lineHeight: 1.7,
};

const actionsStyle: CSSProperties = {
  marginTop: "28px",
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};

const actionBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "48px",
  padding: "0 18px",
  borderRadius: "999px",
  fontWeight: 600,
  textDecoration: "none",
  border: "none",
  fontSize: "14px",
};

const actionToneStyles = {
  primary: {
    background: "#f8fafc",
    color: "#020617",
  } satisfies CSSProperties,
  secondary: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#e2e8f0",
  } satisfies CSSProperties,
};

const footerStyle: CSSProperties = {
  marginTop: "16px",
  color: "#94a3b8",
  fontSize: "14px",
};

interface StatusScreenFrameProps {
  children: ReactNode;
  fullScreen?: boolean;
}

interface StatusScreenProps {
  actions?: ReactNode;
  description: ReactNode;
  detail?: ReactNode;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

interface StatusActionProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  tone?: keyof typeof actionToneStyles;
}

export function StatusScreenFrame({
  children,
  fullScreen = false,
}: StatusScreenFrameProps) {
  return (
    <div
      style={{
        ...frameStyle,
        ...(fullScreen ? fullScreenFrameStyle : embeddedFrameStyle),
      }}
    >
      {children}
    </div>
  );
}

export function StatusScreen({
  actions,
  description,
  detail,
  eyebrow,
  footer,
  icon,
  title,
}: StatusScreenProps) {
  return (
    <main style={panelStyle}>
      {icon ? <div style={iconWrapStyle}>{icon}</div> : null}
      {eyebrow ? <div style={eyebrowStyle}>{eyebrow}</div> : null}
      <h1 style={titleStyle}>{title}</h1>
      <p style={descriptionStyle}>{description}</p>
      {detail ? <div style={detailStyle}>{detail}</div> : null}
      {actions ? <div style={actionsStyle}>{actions}</div> : null}
      {footer ? <p style={footerStyle}>{footer}</p> : null}
    </main>
  );
}

export function StatusAction({
  children,
  href,
  onClick,
  tone = "secondary",
}: StatusActionProps) {
  const style = {
    ...actionBaseStyle,
    ...actionToneStyles[tone],
  };

  if (href) {
    return (
      <a href={href} style={style}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...style, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
