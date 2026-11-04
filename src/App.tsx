import { roleFromLocation } from './roles';
import { RolePicker } from './components/RolePicker';
import { LegacyPortal } from './components/LegacyPortal';

/** The path decides the page: /lead, /psychiatrist, /psychologist, /nurse, /rmo open that role; anything else shows the picker.
 *  Moving between them is a real page load, so one page never runs two roles. */
export default function App() {
  const role = roleFromLocation();
  return role ? <LegacyPortal role={role} /> : <RolePicker />;
}
