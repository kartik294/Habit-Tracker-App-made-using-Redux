// src/hooks/useNotification.ts

export const useNotification = () => {
  const notify = (title: string, options: NotificationOptions) => {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  };

  return { notify };
};
