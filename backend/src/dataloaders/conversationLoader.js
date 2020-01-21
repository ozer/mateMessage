import DataLoader from 'dataloader';
import Conversation from '../db/models/Conversation';

const conversationLoader = () => new DataLoader((conversationIds) => {
  return Conversation.find({ _id: { $in: conversationIds }});
});

export default conversationLoader;