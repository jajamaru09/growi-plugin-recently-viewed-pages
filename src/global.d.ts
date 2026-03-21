interface Window {
  navigation?: EventTarget & {
    addEventListener: EventTarget['addEventListener'];
    removeEventListener: EventTarget['removeEventListener'];
  };
}
