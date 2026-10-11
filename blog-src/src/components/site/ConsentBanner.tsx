// Analytics consent prompt, shown only to visitors in consent-required regions
// who have not chosen yet. Renders nothing on the server.
import { useState, useSyncExternalStore } from 'react';
import { consentRequired, setConsent, storedConsent, type Consent } from '@/lib/analytics';

const subscribe = () => () => {};
const needsPrompt = () => storedConsent() === null && consentRequired();
const onServer = () => false;

export default function ConsentBanner() {
  const show = useSyncExternalStore(subscribe, needsPrompt, onServer);
  const [done, setDone] = useState(false);
  // An empty fragment, not null: Astro recognises a React component by the
  // element it returns, and on the server this one always renders nothing.
  if (!show || done) return <></>;

  const choose = (value: Consent) => {
    setConsent(value);
    setDone(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rule-strong bg-paper-raised/97 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p id="consent-heading" className="text-[13.5px] font-medium text-ink">
            Analytics on this page
          </p>
          <p className="mt-1 max-w-prose text-[12.5px] leading-relaxed text-ink-muted">
            This site uses Google Analytics to see which parts of this page people actually read. No advertising, no
            profiling, and nothing is shared on. Decline and the page works exactly the same.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="border border-rule-strong px-4 py-2 text-[13px] font-medium text-ink transition-colors duration-200 hover:border-ink active:translate-y-px"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="bg-ink px-4 py-2 text-[13px] font-medium text-paper-raised transition-colors duration-200 hover:bg-accent active:translate-y-px"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
