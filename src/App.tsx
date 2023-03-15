import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Components, createDirectLine, createStore, hooks } from 'botframework-webchat';

const { BasicWebChat, Composer } = Components;
const { useSendEvent } = hooks;

const SendActivityButton = () => {
  const sendEvent = useSendEvent();

  const handleHelpButtonClick = useCallback(() => sendEvent('testEvent', 'testValue'), [sendEvent]);

  return (
    <button onClick={handleHelpButtonClick} type="button">
      Send Event
    </button>
  );
};

function App() {
  const store = useMemo(() => createStore({}, ({ dispatch }: any) => (next: (action: any) => void) => (action: any) => {
    if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY' && action.payload.activity.type === 'event' && action.payload.activity.from.role === 'bot') {
      const event = new CustomEvent('webchatincomingevent', { detail: action.payload.activity });
      window.dispatchEvent(event);
    }

    return next(action);
  }), []);
  const [token, setToken] = useState<string | undefined>();
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  const abortSignal = useRef(new AbortController()).current;

  useEffect(() => {
    (async () => {
      if (!abortSignal.signal.aborted) {
        const res = await fetch('https://default72f988bf86f141af91ab2d7cd011db4.7.environment.api.test.powerplatform.com/powervirtualagents/botsbyschema/crbfe_ckk02142023/directline/token?api-version=2022-03-01-preview', { method: 'GET' });
        const { token } = await res.json();
        setToken(token)
      }
    })();

    return () => {
      abortSignal.abort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [])

  useEffect(() => {
    const handleIncomingEvent = (event: Event) => {
      alert(`Received event named: ${(event as any).detail.name}!`);
    };

    window.addEventListener('webchatincomingevent', handleIncomingEvent);

    return () => {
      window.removeEventListener('webchatincomingevent', handleIncomingEvent)
    }
  }, []);

  return (
    <div className="webchat_demo__container">
      <Composer directLine={directLine} store={store}>
        <BasicWebChat />
        <SendActivityButton />
      </Composer>
    </div>
  );
}

export default App;
