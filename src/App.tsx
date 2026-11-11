import { roleFromLocation } from './roles';
import { RolePicker } from './components/RolePicker';
import { LegacyPortal } from './components/LegacyPortal';

/** The Patient Experience Lead page is the team's own clickable prototype (public/px-lead-prototype.html), shown exactly as they made it. */
function PatientExperienceLeadPrototype() {
  return (
    <iframe
      title="Patient Experience Lead"
      src="/px-lead-prototype.html"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#f6fbff' }}
    />
  );
}

/** The path decides the page: each role link opens its selected workspace; anything else shows the picker.
 *  Moving between them is a real page load, so one page never runs two roles. */
export default function App() {
  const role = roleFromLocation();
  if (role === 'patient-experience-lead') return <PatientExperienceLeadPrototype />;
  return role ? <LegacyPortal role={role} /> : <RolePicker />;
}
