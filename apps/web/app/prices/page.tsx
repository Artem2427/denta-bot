import { redirect } from 'next/navigation';

// Retired destination route (D-01, D-03). Content now lives at the
// #pricing anchor on the single-page landing. Target is a hardcoded
// literal — no user-controlled input is ever read to construct it.
export default function Prices(): never {
  redirect('/#pricing');
}
