import { roleFromLocation } from './roles';
import { RolePicker } from './components/RolePicker';
import { LegacyPortal } from './components/LegacyPortal';
import { AuthGate } from './components/AuthGate';

/** The Patient Experience Lead page is the team's own clickable prototype (public/px-lead-prototype.html), shown exactly as they made it. */
function PatientExperienceLeadPrototype() {
  // with real patients (TULASI_REAL_DATA) the prototype's made-up grievances and patients must not show
  if ((window as unknown as { __TULASI_REAL?: boolean }).__TULASI_REAL)
    return (
      <div style={{ maxWidth: 520, margin: '15vh auto 0', padding: 28, font: '15px Inter,system-ui,sans-serif', color: '#101828', background: '#fff', border: '1px solid #e4e7ec', borderRadius: 16 }}>
        <b>Patient Experience is not connected to real patients yet.</b>
        <p style={{ color: '#475467' }}>It still runs on demo data. The inpatient portal (psychiatrist, psychologist, nurse, RMO, floor leads) is live on real patients.</p>
      </div>
    );
  return (
    <iframe
      title="Patient Experience Lead"
      src="/px-lead-prototype.html"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#f6fbff' }}
    />
  );
}

/** The path decides the page: each role link opens its selected workspace; anything else shows the picker.
 *  Moving between them is a real page load, so one page never runs two roles. Every role link needs that role's login first. */
export default function App() {
  const role = roleFromLocation();
  if (!role) return <RolePicker />;
  return (
    <AuthGate role={role}>
      {role === 'patient-experience-lead' ? <PatientExperienceLeadPrototype /> : <LegacyPortal role={role} />}
    </AuthGate>
  );
}
