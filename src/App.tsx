import  { useEffect, useMemo, useRef, useState } from "react";

import ReactWebChat, { createDirectLine } from 'botframework-webchat';

function App() {
  const [token, setToken] = useState<string | undefined>();
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  const abortSignal = useRef(new AbortController()).current;

  useEffect(() => {
    (async () => {
      if (!abortSignal.signal.aborted) {
        const res = await fetch('https://f6a453cad40fe7299dc27193ef3275e.d.environment.api.test.powerplatform.com/powervirtualagents/bots/fc9908cc-3c0b-4e15-bb9a-6789f5752922/directline/token?api-version=2022-03-01-preview', { method: 'POST' });
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
      <ReactWebChat directLine={directLine} />
    </div>
  );
}

export default App;
