import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Components, createDirectLine, createStore, hooks } from 'botframework-webchat';

const { BasicWebChat, Composer } = Components;
const { useSendEvent, usePostActivity } = hooks;

const SendEventButton = () => {
  const sendEvent = useSendEvent();

  const handleHelpButtonClick = useCallback(() => sendEvent('testEvent', 'testValue'), [sendEvent]);

  return (
    <button onClick={handleHelpButtonClick} type="button">
      Send Event
    </button>
  );
};

const SendInvokeButton = () => {
  const sendActivity = usePostActivity();

  const handleSendButtonClick = useCallback(() => sendActivity({
    channelData: {
      'webchat:send-status': 'sending',
      'webchat:sequence-id': 0
    },
    from: {
      id: 'u00001',
      role: 'user'
    },
    localTimestamp: '2000-01-23T12:34:56.000Z', // Activity-in-transit must have local timestamp.
    name: 'TestInvoke',
    value: 'TestInvokeValue',
    type: 'invoke'
  }), [sendActivity]);

  return (
    <button onClick={handleSendButtonClick} type="button">
      Send Invoke
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
        <SendEventButton />
        <SendInvokeButton />
      </Composer>
    </div>
  );
}

export default App;
