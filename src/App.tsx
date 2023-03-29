import { useCallback, useEffect, useMemo, useState } from "react";
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
    localTimestamp: Date.now().toLocaleString(), // Activity-in-transit must have local timestamp.
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
  const [input, setInput] = useState<string | undefined>();
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  useEffect(() => {
    const handleIncomingEvent = (event: Event) => {
      alert(`Received event named: ${(event as any).detail.name}!`);
    };

    window.addEventListener('webchatincomingevent', handleIncomingEvent);

    return () => {
      window.removeEventListener('webchatincomingevent', handleIncomingEvent)
    }
  }, []);

  const handleInputChange = useCallback((url: string) => {
    setInput(url);
  }, []);

  const updateUrl = useCallback(() => {
    (async () => {
      if (input) {
        try {
          const res = await fetch(input as RequestInfo, { method: 'GET' });
          const { token } = await res.json();
          setToken(token)
        }
        catch (e) {
          console.log(e);
        }
      }
    })();
  }, [input]);

  return (
    <div className="webchat_demo__container">
      {directLine &&
        <Composer directLine={directLine} store={store}>
          <BasicWebChat />
          <SendEventButton />
          <SendInvokeButton />
        </Composer>
      }
      <div>
        <input title="Direct Line URL" type="text" name="url" value={input} onChange={(e) => handleInputChange(e.target.value)} />
        <button type="submit" onClick={() => updateUrl()}>Update</button>
      </div>
    </div>
  );
}

export default App;
