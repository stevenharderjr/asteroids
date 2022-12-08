export function messageTimer(callback) {
  let timeouts = [];
  let messages = [];
  let messageIndex = 0;

  function clearTimeouts() {
    const timeoutCount = timeouts.length;
    for (let i = 0; i < timeoutCount; i++) {
      clearTimeout(timeouts[i]);
      clearInterval(timeouts[i]);
    }
  }

  function nextMessage() {
    if (messageIndex > messages.length - 1) messageIndex = 0;
    return messages[messageIndex++];
  }

  return function say(message, delay = 3000) {
    messageIndex = 0;
    clearTimeouts();

    if (typeof message === 'string') {
      callback(message);
      if (delay < 0) return;
      timeouts[0] = setTimeout(() => callback(''), delay);
    } else if (Array.isArray(message)) {
      messages = [...message];
      callback(nextMessage());
      if (delay < 0) {
        // rotate messages indefinitely
        timeouts[messageIndex] = setInterval(
          () => callback(nextMessage()),
          3000
        );
      } else {
        // send each message once
        const messagesCount = message.length;
        for (let i = 1; i < messagesCount; i++) {
          timeouts[i - 1] = setTimeout(
            () => callback(nextMessage()),
            delay * i
          );
        }
        timeouts[messagesCount] = setTimeout(
          () => callback(''),
          delay * messagesCount
        );
      }
    }

    return () => {
      clearTimeouts();
      callback('');
    };
  };
}
