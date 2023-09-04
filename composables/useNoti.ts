import { Notification } from "../models/noti"

export const useNoti = (
  type: "success" | "error",
  title: string,
  message: string,
  showing: boolean
) => {
  const notiState = useState<Notification>('notiState')

  notiState.value.title = title
  notiState.value.message = message
  notiState.value.type = type
  notiState.value.showing = showing

  setTimeout(() => {
    // hide notification after 5 seconds
    notiState.value.showing = false;
  }, 5000);
};
