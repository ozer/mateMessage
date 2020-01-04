import get from "lodash.get";

export const getConvoInitials = convo => {
  return convo && convo.title ? convo.title : "CO";
};

export const getChatTitleByRecipients = recipients => {
  if (!recipients.length) {
    return "Chat";
  }

  if (recipients.length === 1) {
    const [recipient] = recipients;
    return recipient.name;
  }

  return recipients.map(recipient => recipient.name).join(",");
};

export const getChatSubtitle = messages => {
  const edges = get(messages, "edges") || [];
  if (!edges.length) {
    return `Say 'Hi!'`;
  }

  const lastMessage = edges[edges.length - 1];
  return lastMessage.node.content;
};
