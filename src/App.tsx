import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Components, createDirectLine, createStore, hooks } from 'botframework-webchat';

const { BasicWebChat, Composer } = Components;
const { useSendMessage } = hooks;

const SendActivityButton = () => {
  const sendMessage = useSendMessage();

  const handleHelpButtonClick = useCallback(() => sendMessage("I can't believe you updated the README 🙄"), [sendMessage]);

  return (
    <button onClick={handleHelpButtonClick} type="button">
      Send Activity
    </button>
  );
};

function App() {
  const store = useMemo(() => createStore({}, ({ dispatch }: any) => (next: (action: any) => void) => (action: any) => {
    if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
      dispatch({
        type: 'WEB_CHAT/SEND_EVENT',
        payload: {
          name: 'webchat/join',
          value: { language: window.navigator.language }
        }
      });
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


  return (
    <div className="webchat_demo__container">
      <Composer directLine={directLine} store={store}>
        <SendActivityButton />
        <BasicWebChat />
      </Composer>
    </div>
  );
}

export default App;
