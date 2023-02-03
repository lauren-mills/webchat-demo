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
    if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY' && action.payload.activity.type === 'event') {
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
        const res = await fetch('https://f6a453cad40fe7299dc27193ef3275e.d.environment.api.test.powerplatform.com/powervirtualagents/bots/fc9908cc-3c0b-4e15-bb9a-6789f5752922/directline/token?api-version=2022-03-01-preview', { method: 'GET' });
        const { token } = await res.json();
        setToken(token)
      }
    })();

    return () => {
      abortSignal.abort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [])

  window.addEventListener('webchatincomingevent', (event) => {
    alert(`Received event: ${(event as any).detail.name}!`);
  });

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
