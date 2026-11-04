import { useState } from 'react';
import { ROLES, isRole, roleLink, type RoleKey } from '../roles';
import './RolePicker.css';

const LAST_KEY = 'tulasi-proto-login-last';

function lastRole(): RoleKey | '' {
  try {
    const v = localStorage.getItem(LAST_KEY) ?? '';
    return isRole(v) ? v : '';
  } catch {
    return '';
  }
}

/** Login page: same look as doctor.tulasihealthcare.com/login, but the prototype picks a role instead of phone and OTP.
 *  Login opens that role's own link (/lead, /nurse, ...), which can be bookmarked. */
export function RolePicker() {
  const [pick, setPick] = useState<RoleKey | ''>(lastRole);

  const go = () => {
    if (!pick) return;
    try {
      localStorage.setItem(LAST_KEY, pick);
    } catch {
      /* private mode: the link still works */
    }
    window.location.assign(roleLink(pick));
  };

  return (
    <div className="picker" role="dialog" aria-label="Login">
      <div className="pk-left">
        <div className="pk-art">
          <img src="/logo.png" alt="Tulasi Healthcare" width={240} height={240} />
        </div>
        <div className="pk-blue">
          <div className="pk-brand">
            <img src="/logo.png" alt="" width={56} height={56} />
            <span>Tulasi Healthcare</span>
          </div>
          <div className="pk-welcome">
            <h2>
              Welcome to <b>Tulasi Healthcare</b>
            </h2>
            <p>Sign in to the inpatient workspace to run rounds, chart medicines and keep every patient's stay record in one place.</p>
            <p>Each role sees only its own screens, so doctors, psychologists, nurses and the RMO work from the same record.</p>
          </div>
        </div>
      </div>
      <div className="pk-right">
        <div className="pk-card">
          <img src="/logo.png" alt="Tulasi Healthcare" width={72} height={72} />
          <h1>Login</h1>
          <div className="pk-lbl" id="pkLbl">
            Login as
          </div>
          <div className="pk-roles" role="radiogroup" aria-labelledby="pkLbl">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                role="radio"
                aria-checked={pick === r.key}
                className={`pk-role${pick === r.key ? ' on' : ''}`}
                onClick={() => setPick(r.key)}
              >
                <span className="pk-dot" />
                <span>
                  <b>{r.label}</b>
                  <span className="d">{r.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <button className="pk-go" disabled={!pick} onClick={go}>
            Login
          </button>
          <div className="pk-note">Prototype with demo data only. Pick your role: Login opens that role's own link, which you can bookmark.</div>
        </div>
      </div>
    </div>
  );
}
